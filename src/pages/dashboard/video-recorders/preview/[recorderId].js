import { useCallback, useEffect, useContext, useState } from "react";
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
import { DashboardLayout, TheaterModeContext } from "../../../../components/dashboard/dashboard-layout";
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
import { serverDownCode } from "../../../../api/api-helpers";
import {ServerDownError} from "../../../../components/dashboard/errors/server-down-error";

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
    const { theaterMode, setTheaterMode} = useContext(TheaterModeContext);
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
    const [serverDownOpen, setServerDownOpen] = useState(false);
    const [selectedWindow, setSelectedWindow] = useState(1);
    const [selectedChannel, setSelectedChannel] = useState('1');
    const [availableChannels, setAvailableChannels] = useState([]);

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
            console.log(width, height)

            handle.I_InitPlugin(width, height, {
                bWndFull:       true,
                iPackageType:   2,
                iWndowType:     1,
                bNoPlugin:      true,

                cbSelWnd: function (xmlDoc) {
                  const windowIndex = parseInt($(xmlDoc).find("SelectWnd").eq(0).text(), 10);
                  setSelectedWindow(windowIndex);
                },
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

    // time format
// function dateFormat(oDate, fmt) {
//   var o = {
//       "M+": oDate.getMonth() + 1, //month
//       "d+": oDate.getDate(), //day
//       "h+": oDate.getHours(), //hour
//       "m+": oDate.getMinutes(), //minute
//       "s+": oDate.getSeconds(), //second
//       "q+": Math.floor((oDate.getMonth() + 3) / 3), //quarter
//       "S": oDate.getMilliseconds()//millisecond
//   };
//   if (/(y+)/.test(fmt)) {
//       fmt = fmt.replace(RegExp.$1, (oDate.getFullYear() + "").substr(4 - RegExp.$1.length));
//   }
//   for (var k in o) {
//       if (new RegExp("(" + k + ")").test(fmt)) {
//           fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
//       }
//   }
//   return fmt;
// }

//     function showOPInfo(szInfo, status, xmlDoc) {
//     var szTip = "<div>" + dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss") + " " + szInfo;
//     if (typeof status != "undefined" && status != 200) {
//         var szStatusString = $(xmlDoc).find("statusString").eq(0).text();
//         var szSubStatusCode = $(xmlDoc).find("subStatusCode").eq(0).text();
//         if ("" === szSubStatusCode) {
//             if("" === szSubStatusCode && "" === szStatusString){
//                 szTip += "(" + status + ")";
//             }
//             else{
//                 szTip += "(" + status + ", " + szStatusString + ")";
//             }
//         } else {
//             szTip += "(" + status + ", " + szSubStatusCode + ")";
//         }
//     }
//     szTip += "</div>";

//     $("#opinfo").html(szTip + $("#opinfo").html());
// }

//     const login_sdk = async function(handle, {ip, port, username, password}) {
//       var szDeviceIdentify = ip + "_" + port;
//       var iRet = handle.I_Login(ip, 1, port, username, password, {
//           success: function (xmlDoc) {            
//               showOPInfo(szDeviceIdentify + " 登录成功！");
//               $(ip).prepend("<option value='" + szDeviceIdentify + "'>" + szDeviceIdentify + "</option>");
//               setTimeout(function () {
//                 $(ip).val(szDeviceIdentify);
//                   getChannelInfo(handle,ip);
//                   getDevicePort(handle,ip);
//               }, 10);
//           },
//           error: function (status, xmlDoc) {
//               console.log(xmlDoc);
//               showOPInfo(szDeviceIdentify + " 登录失败！", status, xmlDoc);
//           }
//       });
  
//       if (-1 == iRet) {
//           showOPInfo(szDeviceIdentify + " 已登录过！");
//       }
//   }
//   // {
//   //       return await new Promise((resolve, reject) => {
//   //           handle.I_Login(ip, 1, port, username, password, {
//   //               success: function (xmlDoc) {
//   //                   resolve();
//   //               }, error: function (status, xmlDoc) {
//   //                   reject();
//   //                   alert("login failed");
//   //               }
//   //           });
//   //       });
//   //   }

//   function getChannelInfo(handle,ip) {
//     var szDeviceIdentify =ip,
//         oSel = $("#channels").empty();

//     if (null == szDeviceIdentify) {
//         return;
//     }

//     // analog channel
//     handle.I_GetAnalogChannelInfo(szDeviceIdentify, {
//         async: false,
//         success: function (xmlDoc) {
//             var oChannels = $(xmlDoc).find("VideoInputChannel");

//             $.each(oChannels, function (i) {
//                 var id = $(this).find("id").eq(0).text(),
//                     name = $(this).find("name").eq(0).text();
//                 if ("" == name) {
//                     name = "Camera " + (i < 9 ? "0" + (i + 1) : (i + 1));
//                 }
//                 oSel.append("<option value='" + id + "' bZero='false'>" + name + "</option>");
//             });
//             showOPInfo(szDeviceIdentify + " get analog channel success！");
//         },
//         error: function (status, xmlDoc) {
//             showOPInfo(szDeviceIdentify + " get analog channel failed！", status, xmlDoc);
//         }
//     });
//     // IP channel
//     handle.I_GetDigitalChannelInfo(szDeviceIdentify, {
//         async: false,
//         success: function (xmlDoc) {
//             var oChannels = $(xmlDoc).find("InputProxyChannelStatus");

//             $.each(oChannels, function (i) {
//                 var id = $(this).find("id").eq(0).text(),
//                     name = $(this).find("name").eq(0).text(),
//                     online = $(this).find("online").eq(0).text();
//                 if ("false" == online) {// filter the forbidden IP channel
//                     return true;
//                 }
//                 if ("" == name) {
//                     name = "IPCamera " + (i < 9 ? "0" + (i + 1) : (i + 1));
//                 }
//                 oSel.append("<option value='" + id + "' bZero='false'>" + name + "</option>");
//             });
//             showOPInfo(szDeviceIdentify + " get IP channel success！");
//         },
//         error: function (status, xmlDoc) {
//             showOPInfo(szDeviceIdentify + " get IP channel failed！", status, xmlDoc);
//         }
//     });
//     // zero-channel info
//     handle.I_GetZeroChannelInfo(szDeviceIdentify, {
//         async: false,
//         success: function (xmlDoc) {
//             var oChannels = $(xmlDoc).find("ZeroVideoChannel");
            
//             $.each(oChannels, function (i) {
//                 var id = $(this).find("id").eq(0).text(),
//                     name = $(this).find("name").eq(0).text();
//                 if ("" == name) {
//                     name = "Zero Channel " + (i < 9 ? "0" + (i + 1) : (i + 1));
//                 }
//                 if ("true" == $(this).find("enabled").eq(0).text()) {//  filter the forbidden zero-channel
//                     oSel.append("<option value='" + id + "' bZero='true'>" + name + "</option>");
//                 }
//             });
//             showOPInfo(szDeviceIdentify + " get zero-channel success！");
//         },
//         error: function (status, xmlDoc) {
//             showOPInfo(szDeviceIdentify + " get zero-channel failed！", status, xmlDoc);
//         }
//     });
// }

// // get port
// function getDevicePort(handle,ip) {
//     var szDeviceIdentify = ip;

//     if (null == szDeviceIdentify) {
//         return;
//     }

//     var oPort = WebVideoCtrl.I_GetDevicePort(szDeviceIdentify);
//     if (oPort != null) {
//         $("#deviceport").val(oPort.iDevicePort);
//         $("#rtspport").val(oPort.iRtspPort);

//         showOPInfo(szDeviceIdentify + " get port success！");
//     } else {
//         showOPInfo(szDeviceIdentify + " get port failed！");
//     }
// }

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

    const preview_recorder     = async function(handle, {ip, rtsp_port, stream_type, channel_id, zero_channel, port}) {
        return await new Promise((resolve, reject) => {
            handle.I_StartRealPlay(ip, {
            iRtspPort:      rtsp_port,
            iStreamType:    stream_type,
            iChannelID:     channel_id,
            bZeroChannel:   zero_channel,
            iWSPort: port,
            success: function () {
              console.log("started the preview", selectedWindow)
            },
            error: function (status, xmlDoc) {
              if (status === 403) {
                  console.log("Device do not support Websocket extracting the flow！");
              } else {
                  console.log("start real play failed！");
              }
            }
          });

          resolve();
        });
    }

    const stop_preview_recorder = async function(handle) {
      const currentStatus = await sdkHandle.I_GetWindowStatus(selectedWindow)
      if(!!currentStatus) { 
        return await new Promise((resolve, reject) => {
          handle.I_Stop({
            success: function () {
              resolve();
            }, error: function () {
              reject()
            }
          });
        });
      } else { return; }
                                
    }

    const change_split_Screen = async function(handle, mode) {
      return await new Promise((resolve, reject) => {
        handle.I_ChangeWndNum(mode);
        setStreamType(mode);
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
                            ip:         data.recorderPublicIp,
                            port:       data.recorderPortNumber,
                            username:   data.recorderUsername,
                            password:   data.recorderPassword
                        });

                        const device_info       = await get_device_info(sdk_handle, {
                            ip: data.recorderPublicIp
                        })

                        for (const key of Object.keys(device_info)) {
                            data[key] = device_info[key]
                        }

                        const analogue_channels = await get_analogue_channels(sdk_handle, {
                            ip: data.recorderPublicIp
                        })

                        const digital_channels  = await get_digital_channels(sdk_handle, {
                            ip: data.recorderPublicIp
                        })

                        const device_ports      = await get_device_ports(sdk_handle, {
                            ip: data.recorderPublicIp
                        })

                        setAvailableChannels([...digital_channels]);
                        data.rtsp_port = device_ports.iRtspPort;
                        // channel_id to switch cam
                        await preview_recorder(sdk_handle, {
                            ip: data.recorderPublicIp, rtsp_port: device_ports.iRtspPort,
                            stream_type: 1, channel_id: 1, zero_channel: false, port: 7681
                        });
                        data.recorderSerialNumber = device_info["serial_number"];
                        videoRecorderApi.updateRecorder(data);
                        setVideoRecorderInfo(data);

                        setLoadedSDK(true);
                    }
                } else {
                    if (res.status == serverDownCode) {
                      setServerDownOpen(true);
                    }
                    toast.error("Video recorder info not found")
                }
            })
        } catch(err){ }
    }

    const getInfo = useCallback(async() => {
        getVideoRecorder(recorderId)
        if(window.pageYOffset !== 177.6) window.scroll(0, 177.6);
    }, [isMounted])

    useEffect(() => {
        getInfo();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    [])
    // if full screen closed using ESC key
    addEventListener("fullscreenchange", async () => {      
      if( sdkHandle && theaterMode && !document.fullscreenElement) {
        const {clientHeight: height, clientWidth: width} = document.getElementById('stream-container');
        await sdkHandle.I_Resize(`${width}`, `${window.innerHeight - 20}`)
        setTheaterMode(false);
      }
    })

    const [actionAnchor, setActionAnchor] = useState(null);
    const open = Boolean(actionAnchor);
    const handleActionClick = (e) => { setActionAnchor(e.currentTarget); }
    const handleActionClose = () => { setActionAnchor(null); }

    const [selectedState, setselectedState] = useState(false);
    const checkSelected = () => {
      setselectedState(true)
    };

    useEffect(() => {
      checkSelected();
    });

    return (
      <>
        <Box
          component="main"
          sx={{
              flexGrow: 1,
              py: 8
          }}>
          <ServerDownError
            open={serverDownOpen}
            handleDialogClose={() => setServerDownOpen(false)} />
          <Container style={ theaterMode ? { maxWidth: "100%" } : {}}>
            <div>
              <Box sx={{ mb: 4 }}>   
              {/* <NextLink
                  href={`/dashboard/video-recorders/details/${recorderId}`}
                  passHref
              > */}
                <Link
                  color="textPrimary"
                  component="a"
                  onClick ={() => {
                      window.location.href = 
                      `/dashboard/video-recorders/details/${recorderId}`
                  }}
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
                {/* </NextLink> */}
                        
              </Box>
              <Grid container
                justifyContent="space-between"
                spacing={3}>
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
            <Grid container
              spacing={3}>
              <Grid item
                id="stream-container"
                xs={12}
                sx={{ position: "relative" }}>
                  <div
                    key = "plugin_div"
                    dangerouslySetInnerHTML = {{ __html: '<div id="divPlugin" style = "height: auto;width: 100%;background-color: black;aspect-ratio: 1.6; border-radius: 4px;overflow: hidden;"></div>'}}
                  />
                   <button type="button" 
                    style={{ 
                      position: "absolute", 
                      bottom: "10px", 
                      right: "10px", 
                      background: "transparent", 
                      border: "none" 
                    }}
                    onClick={ async () => { 
                      await sdkHandle.I_Resize(`${window.outerWidth}`, `${window.outerHeight}`);
                      var elem = document.getElementById("divPlugin");
                      if (elem.requestFullscreen) {
                        await elem.requestFullscreen().catch((err) => console.log(err));
                      } else if (elem.webkitRequestFullscreen) { /* Safari */
                        await elem.webkitRequestFullscreen().catch((err) => console.log(err));
                      } else if (elem.msRequestFullscreen) { /* IE11 */
                        await elem.msRequestFullscreen().catch((err) => console.log(err));
                      }                    
                      setTheaterMode(!theaterMode);
                    }}>
                    <img alt="theater mode" 
                      style={{ filter: "invert(1)" }} 
                      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAjklEQVR4nO2WwQmAMAxFu1jq1Q2SUZL1FBTX0EEqxYuokFB7EJsHvf38DyWQH4LTHB1xDyhbJEnnByijNps117lIvGZPNTgL78OSgHgoCz7Cgx58iEMlzH7Rg19i/kFAGS2LZKW2n+M4HyYiL4AyVfUjnnWhH4kG7jE/V5/izmWsPh1x/xRe3rmMZc/5HTtHhL2kVsbKbgAAAABJRU5ErkJggg==" />
                  </button>
              </Grid>    

              <Grid item
                xs={12}>
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
                                if(window.pageYOffset !== 177.6) window.scroll(0, 177.6);
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
                                ].map(({name, value})  => (<MenuItem key = {value}
                                value = {value}>{name}</MenuItem>))
                              }
                            </Select>
                          </div>
                          {/* Select the channel that has to be displayed when clicked on start preview */}
                          { availableChannels.length > 0 && 
                            <div style={{ marginTop: "20px" }}>
                              <InputLabel id="channels">Select Channel</InputLabel>
                              <Select
                                labelId="Channels"
                                onChange = {async ({target: {value}})=> {
                                  setSelectedChannel(value);
                                }}
                                sx={{ width: 200 }}
                                value={selectedChannel}
                                label="Channels">
                                {
                                  availableChannels.map(({id, name, online})  => online && (
                                  <MenuItem 
                                    key = {name} 
                                    value = {id}>
                                    {name}
                                  </MenuItem>))
                                }
                              </Select>
                              <Button onClick={async () => { 
                                // if something is already running then close it to play the current choice
                                await stop_preview_recorder(sdkHandle) 
                                await preview_recorder(sdkHandle, {
                                  ip: videoRecorderInfo.recorderPublicIp, rtsp_port: videoRecorderInfo.rtsp_port,
                                  stream_type: 1, channel_id: selectedChannel, zero_channel: false, port: 7681
                                });
                              }}>Start Preview</Button>
                              <Button onClick={async () => {
                                // to stop the current preview
                                await stop_preview_recorder(sdkHandle) 
                              }}>Stop Preview</Button>
                            </div> 
                          }
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
      <script id="videonode"
              src="/static/sdk/codebase/webVideoCtrl.js"></script>
    </Head>
    <DashboardLayout>
      { page }
    </DashboardLayout>
  </AuthGuard>
)

export default VideoRecorderPreview;