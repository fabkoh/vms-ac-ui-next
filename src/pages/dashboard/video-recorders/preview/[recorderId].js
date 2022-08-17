import { useCallback, useEffect, useState } from "react";
import { useMounted } from "../../../../hooks/use-mounted"
import { gtm } from "../../../../lib/gtm";
import accessGroupEntranceApi from "../../../../api/access-group-entrance-n-to-n";
import entranceApi from "../../../../api/entrance";
import NextLink from 'next/link';
import Head from 'next/head';
import router from 'next/router';
import {
  Box,
  Select,
  Grid, 
  MenuItem,
  InputLabel,
  Typography,
  Switch,
  Container,
  TextField,
  Link, 
  Button 
} from "@mui/material";
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ChevronDown } from "../../../../icons/chevron-down";
import StyledMenu from "../../../../components/dashboard/styled-menu";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { EntranceBasicDetails } from "../../../../components/dashboard/entrances/details/entrance-basic-details";
import toast from "react-hot-toast";
import { Confirmdelete } from '../../../../components/dashboard/video-recorders/confirm-delete';
import { set } from "date-fns";
import AccessGroupDetails from "../../../../components/dashboard/entrances/details/entrance-access-group-details";
import { BuildCircle, DoorFront, LockOpen, Refresh } from "@mui/icons-material";
import ConfirmStatusUpdate from "../../../../components/dashboard/entrances/list/confirm-status-update";
import { entranceCreateLink, entranceListLink, getEntranceEditLink } from "../../../../utils/entrance";
import EntranceSchedules from "../../../../components/dashboard/entrances/details/entrance-schedules";
import { entranceScheduleApi } from "../../../../api/entrance-schedule";
import { getEntranceScheduleEditLink } from "../../../../utils/entrance-schedule";
import videoRecorderApi from "../../../../api/videorecorder";
import { VideoRecorderBasicDetails } from "../../../../components/dashboard/video-recorders/details/video-recorder-basic-details";
import { getVideoRecorderEditLink, getVideoRecorderListLink } from "../../../../utils/video-recorder";
import {VideoRecorderCameras} from "../../../../components/dashboard/video-recorders/details/video-recorder-cameras";

function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
     day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) 
    month = '0' + month;
  if (day.length < 2) 
    day = '0' + day;

  return [year, month, day].join('-');
}

const VideoRecorderPreview = () => {
    const isMounted = useMounted();
    const [entrance, setEntrance] = useState(null);
    const { cameraId, recorderId }  = router.query;

    useEffect(() => {
        gtm.push({ event: 'page_view' });
    }, [])
    const [videoRecorderInfo, setVideoRecorderInfo] = useState(null)
    const [loadedSDK, setLoadedSDK] = useState(false)
    const [authStatus, setAuthStatus] = useState({})
    const [sdkHandle, setSDKHandle] = useState(null)
    const [previewMode, setPreviewMode] = useState("live")
    const [ptz_speed, setPtzSpeed] = useState(4)
    const [preset_view, setPresetView] = useState(1)

    const [stream_type, setStreamType] = useState(1)
    const [start_time, setStartTime] = useState(new Date());
    const [end_time, setEndTime] = useState(new Date());
    const [download_start_time, setDownloadStartTime] = useState(new Date());
    const [download_end_time, setDownloadEndTime] = useState(new Date());
    const [playback_files, setPlaybackFiles] = useState([]);

    const get_sdk_handle = async function() {
        while (true) {
            if (window.WebVideoCtrl && window.jQuery) {
                return window.WebVideoCtrl
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    const attach_sdk     = async function(handle) {
        return await new Promise((resolve, reject) => {
            const {clientHeight: height, clientWidth: width} = document.getElementById('divPlugin');

            handle.I_InitPlugin(width, height, {
                bWndFull:       true,
                iPackageType:   2,
                iWndowType:     1,
                bNoPlugin:      true,
                oStyle: {border: 0},

                cbSelWnd:           function (xmlDoc) { },
                cbDoubleClickWnd:   function (iWndIndex, bFullScreen) { },
                cbEvent:            function (iEventType, iParam1, iParam2) { },
                cbRemoteConfig:     function () { },
                cbInitPluginComplete: function () {
                    try {
                        WebVideoCtrl.I_InsertOBJECTPlugin("divPlugin");
                        resolve();
                    } catch (ex) {
                        console.warn("Failed to inject plugin")
                        reject();
                    }
                }
            });
        });
    }

    const login_sdk = async function(handle, {ip, port, username, password}) {
        return await new Promise((resolve, reject) => {
            handle.I_Login(ip, 1, port, username, password, {
                success: function (xmlDoc) {
                    resolve();
                }, error: function (status, xmlDoc) {
                    reject();
                    alert("login failed");
                }
            });
        });
    }

    const get_device_info = async function(handle, {ip}) {
        return await new Promise((resolve, reject) => {
            try{
            handle.I_GetDeviceInfo(ip, {
                success: function (xmlDoc) {
                    const xml_handle = $(xmlDoc);

                    resolve({
                        device_name:        xml_handle.find("deviceName").eq(0).text(),
                        device_id:          xml_handle.find("deviceID").eq(0).text(),
                        model:              xml_handle.find("model").eq(0).text(),
                        serial_number:      xml_handle.find("serialNumber").eq(0).text(),
                        mac_addreess:       xml_handle.find("macAddress").eq(0).text(),
                        firmware_version:   `${xml_handle.find("firmwareVersion").eq(0).text()}  ${xml_handle.find("firmwareReleasedDate").eq(0).text()}`,
                        encoder_version:    `${xml_handle.find("encoderVersion").eq(0).text()}  ${xml_handle.find("encoderReleasedDate").eq(0).text()}`,
                    });
                }, error: function (status, xmlDoc) {
                    reject();
                }
            })
        } catch(ex) {}
        })
    }

    const get_device_ports= async function(handle, {ip}) {
        return await new Promise((resolve, reject) => {
            const ports = handle.I_GetDevicePort(ip);
            resolve(ports);
        });
    }

    const get_analogue_channels = async function(handle, {ip}) {
        return await new Promise((resolve, reject) => {
            handle.I_GetAnalogChannelInfo(ip, {
                async: false,
                success: function (xmlDoc) {
                    const channels = [];

                    $.each($(xmlDoc).find("VideoInputChannel"), function (i) {
                        channels.push({
                            id:     $(this).find("id").eq(0).text(),
                            name:   $(this).find("name").eq(0).text()
                        });
                    });

                    resolve(channels);
                }, error: function (status, xmlDoc) {
                    reject();
                }
            });
        });
    }

    const get_digital_channels = async function(handle, {ip}) {
        return await new Promise((resolve, reject) => {
            handle.I_GetDigitalChannelInfo(ip, {
                async: false,
                success: function (xmlDoc) {
                    const channels = [];

                    $.each($(xmlDoc).find("InputProxyChannelStatus"), function (i) {
                        channels.push({
                            id:     $(this).find("id").eq(0).text(),
                            name:   $(this).find("name").eq(0).text(),
                            online: ($(this).find("online").eq(0).text().toLowerCase() === 'true'),
                            ip:     $(this).find("ipAddress").eq(0).text()
                        });
                    });

                    resolve(channels);
                }, error: function (status, xmlDoc) {
                    reject();
                }
            });
        });
    }

    const preview_recorder     = async function(handle, {ip, rtsp_port, stream_type, channel_id, zero_channel}) {
        return await new Promise((resolve, reject) => {
          handle.I_StartRealPlay(ip, {
            iRtspPort:      rtsp_port,
            iStreamType:    stream_type,
            iChannelID:     channel_id,
            bZeroChannel:   zero_channel
          });

          resolve();
        });
    }

    const stop_preview_recorder = async function(handle) {
      return await new Promise((resolve, reject) => {
        handle.I_Stop({
          success: function () {
            resolve();
          }, error: function () {
            reject()
          }
        });
      });
    }

    const change_split_Screen = async function(handle, mode) {
      return await new Promise((resolve, reject) => {
        handle.I_ChangeWndNum(mode);
        resolve();
      });
    }

    const getVideoRecorder = async(recorderId) => {
        try{
            Promise.resolve(videoRecorderApi.getRecorder(parseInt(recorderId)))
            .then( async res=>{
                if(res.status==200){
                    const data              = await res.json()

                    if (!loadedSDK) {
                        const sdk_handle        = await get_sdk_handle();
                        setSDKHandle(sdk_handle);

                        await attach_sdk(sdk_handle);

                        const login             = await login_sdk(sdk_handle, {
                            ip:         data.recorderIpAddress,
                            port:       data.recorderPortNumber,
                            username:   data.recorderUsername,
                            password:   data.recorderPassword
                        });

                        const device_info       = await get_device_info(sdk_handle, {
                            ip: data.recorderIpAddress
                        })

                        for (const key of Object.keys(device_info)) {
                            data[key] = device_info[key]
                        }

                        const analogue_channels = await get_analogue_channels(sdk_handle, {
                            ip: data.recorderIpAddress
                        })

                        const digital_channels  = await get_digital_channels(sdk_handle, {
                            ip: data.recorderIpAddress
                        })

                        const device_ports      = await get_device_ports(sdk_handle, {
                            ip: data.recorderIpAddress
                        })

                        data.rtsp_port = device_ports.iRtspPort;

                        await preview_recorder(sdk_handle, {
                            ip: data.recorderIpAddress, rtsp_port: device_ports.iRtspPort,
                            stream_type: 1, channel_id:  1, zero_channel: false
                        });

                        setVideoRecorderInfo(data);

                        setLoadedSDK(true);
                    }
                } else{
                    toast.error("Video Recorder camera info not found")
                }
            })
        } catch(err){ }
    }

    const getInfo = useCallback(async() => {
        getVideoRecorder(recorderId)
    }, [isMounted])

    useEffect(() => {
        getInfo();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    [])

    const [actionAnchor, setActionAnchor] = useState(null);
    const open = Boolean(actionAnchor);
    const handleActionClick = (e) => { setActionAnchor(e.currentTarget); }
    const handleActionClose = () => { setActionAnchor(null); }

	const [selectedState, setselectedState] = useState(false);
	const checkSelected = () => {
		setselectedState(true)
	};
	useEffect(() => {
		checkSelected()
	});

    return (
      <>
        <Box
          component="main"
          sx={{
              flexGrow: 1,
              py: 8
          }}>
          <Container maxWidth="lg">
            <div>
              <Box sx={{ mb: 4 }}>         
                <Link
                  color="textPrimary"
                  component="a"
                  sx={{
                    alignItems: 'center',
                    display: 'flex'
                  }}>
                  <ArrowBackIcon
                    fontSize="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="subtitle2">Video Recorders</Typography>
                </Link>
                        
              </Box>
              <Grid container justifyContent="space-between" spacing={3}>
                <Grid item
                  sx={{
                    alignItems: 'center',
                    display: 'flex',
                    overflow: 'hidden'
                  }}>
                  <div>
                    <Typography variant="h4">
                      { videoRecorderInfo? `Live View/Playback: ${videoRecorderInfo.recorderName}`: " Camera Not Found" }    
                    </Typography>    
                  </div>    
                </Grid>
            </Grid>
          </div>
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <div
                  key = "plugin_div"
                  style = {{justifyContent: 'center', display: 'flex'}}
                  dangerouslySetInnerHTML = {{ __html: '<div id="divPlugin" style = "height: auto;width: 100%;background-color: black;aspect-ratio: 1.6; border-radius: 4px;overflow: hidden;"></div>'}}
                />
              </Grid>

              <Grid item xs={12}>
                <div>

                    <div>
                      <div>
                        <div style = {{
                            padding:        '.6em',
                            margin:         '.2em',
                            border:         '1px solid #D1D5DB',
                            borderRadius:   4,
                            display:        'inline-block'
                          }}>
                           <div>
                            <InputLabel id="split_screen">Split screen</InputLabel>
                            <Select
                              labelId="split_screen"
                              onChange = {async ({target: {value}})=> {
                                await change_split_Screen(sdkHandle, value)
                              }}
                              sx={{ width: 200 }}
                              value={stream_type}
                              label="Split screen">
                              {
                                [
                                  {"name": "1x1", "value": 1},
                                  {"name": "2x2", "value": 2},
                                  {"name": "3x3", "value": 3},
                                  {"name": "4x4", "value": 4}
                                ].map(({name, value})  => (<MenuItem key = {value} value = {value}>{name}</MenuItem>))
                              }
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                </div>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </>
  )
}

VideoRecorderPreview.getLayout = (page) => (
  <AuthGuard>
    <Head>
      <title>
        Etlas: Video Recorder Preview
      </title>
      <script src="/static/sdk/codebase/jquery-1.12.1.min.js"></script>
      <script src="/static/sdk/codebase/encryption/AES.js"></script>
      <script src="/static/sdk/codebase/encryption/cryptico.min.js"></script>
      <script src="/static/sdk/codebase/encryption/crypto-3.1.2.min.js"></script>
      <script id="videonode" src="/static/sdk/codebase/webVideoCtrl.js"></script>
    </Head>
    <DashboardLayout>
      { page }
    </DashboardLayout>
  </AuthGuard>
)

export default VideoRecorderPreview;