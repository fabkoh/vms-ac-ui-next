import { useCallback, useContext, useEffect, useState } from "react";
import { useMounted } from "../../../../../hooks/use-mounted"
import { gtm } from "../../../../../lib/gtm";
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
  Button,
} from "@mui/material";
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AuthGuard } from "../../../../../components/authentication/auth-guard";
import { DashboardLayout, TheaterModeContext } from "../../../../../components/dashboard/dashboard-layout";
import toast from "react-hot-toast";
import videoRecorderApi from "../../../../../api/videorecorder";
import { ServerDownError } from "../../../../../components/dashboard/errors/server-down-error";
import { serverDownCode } from "../../../../../api/api-helpers";
import { authRenewToken } from "../../../../../api/api-helpers";

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

const VideoCameraDetails = () => {
  const isMounted = useMounted();
  const { cameraId, recorderId } = router.query;
  const { theaterMode, setTheaterMode } = useContext(TheaterModeContext)

  useEffect(() => {
    gtm.push({ event: 'page_view' });
  }, [])
  const [videoRecorderInfo, setVideoRecorderInfo] = useState(null)
  const [loadedSDK, setLoadedSDK] = useState(false)
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
  const [isRecording, setIsRecording] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleRecording = async () => {
    if (isRecording) {
      await stop_recording(sdkHandle);
    } else {
      await start_recording(sdkHandle);
    }
    setIsRecording(!isRecording);
  };

  const toggleAudio = async () => {
    if (audioEnabled) {
      await disable_audio(sdkHandle);
    } else {
      await enable_audio(sdkHandle);
    }
    setAudioEnabled(!audioEnabled);
  };

  const handlePlay = async () => {
    console.log("handlePlay", start_time);
    await play(sdkHandle, {
      publicIP: videoRecorderInfo.recorderPublicIp,
      privateIP: videoRecorderInfo.recorderPrivateIp,
      port: videoRecorderInfo.recorderPortNumber,
      rtsp_port: videoRecorderInfo.rstp_port,
      IWSPort: videoRecorderInfo.recorderIWSPort,
      type: 1,
      stream_type,
      start_time,
      end_time

    });
    setIsPlaying(true);
  };

  const handleStop = async () => {
    await stop(sdkHandle);
    setIsPlaying(false);
  };

  // Begin indefinite polling for refresh token
  useEffect(
    () => {
      const timer = setInterval(() => {
        refreshToken();
      }, 5 * 60 * 1000);
      return () => clearInterval(timer);

    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const refreshToken = async () => {
    try {
      authRenewToken();
    } catch (error) {
      console.error("Error here")
      console.error("Error:", error);
    }
  }

  const get_sdk_handle = async function () {
    while (true) {
      if (window.WebVideoCtrl && window.jQuery) {
        return window.WebVideoCtrl
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  const attach_sdk = async function (handle) {
    return await new Promise((resolve, reject) => {
      const { clientHeight: height, clientWidth: width } = document.getElementById('divPlugin');

      handle.I_InitPlugin(width, height, {
        bWndFull: true,
        iPackageType: 2,
        iWndowType: 1,
        bNoPlugin: true,

        cbSelWnd: function (xmlDoc) { },
        cbDoubleClickWnd: function (iWndIndex, bFullScreen) { },
        cbEvent: function (iEventType, iParam1, iParam2) { },
        cbRemoteConfig: function () { },
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

  const login_sdk = async function (handle, { ip, port, username, password }) {
    return await new Promise((resolve, reject) => {
      handle.I_Login(ip, 2, port, username, password, {
        success: function (xmlDoc) {
          resolve();
        }, error: function (status, xmlDoc) {
          reject();
          alert("login failed");
        }
      });
    });
  }

  const get_device_info = async function (handle, { ip }) {
    return await new Promise((resolve, reject) => {
      try {
        handle.I_GetDeviceInfo(ip, {
          success: function (xmlDoc) {
            const xml_handle = $(xmlDoc);

            resolve({
              device_name: xml_handle.find("deviceName").eq(0).text(),
              device_id: xml_handle.find("deviceID").eq(0).text(),
              model: xml_handle.find("model").eq(0).text(),
              serial_number: xml_handle.find("serialNumber").eq(0).text(),
              mac_addreess: xml_handle.find("macAddress").eq(0).text(),
              firmware_version: `${xml_handle.find("firmwareVersion").eq(0).text()}  ${xml_handle.find("firmwareReleasedDate").eq(0).text()}`,
              encoder_version: `${xml_handle.find("encoderVersion").eq(0).text()}  ${xml_handle.find("encoderReleasedDate").eq(0).text()}`,
            });
          }, error: function (status, xmlDoc) {
            reject();
          }
        })
      } catch (ex) { }
    })
  }

  const get_device_ports = async function (handle, { ip }) {
    return await new Promise((resolve, reject) => {
      const ports = handle.I_GetDevicePort(ip);
      resolve(ports);
    });
  }

  const get_analogue_channels = async function (handle, { ip }) {
    return await new Promise((resolve, reject) => {
      handle.I_GetAnalogChannelInfo(ip, {
        async: false,
        success: function (xmlDoc) {
          const channels = [];

          $.each($(xmlDoc).find("VideoInputChannel"), function (i) {
            channels.push({
              id: $(this).find("id").eq(0).text(),
              name: $(this).find("name").eq(0).text()
            });
          });

          resolve(channels);
        }, error: function (status, xmlDoc) {
          reject();
        }
      });
    });
  }

  const get_digital_channels = async function (handle, { ip }) {
    return await new Promise((resolve, reject) => {
      handle.I_GetDigitalChannelInfo(ip, {
        async: false,
        success: function (xmlDoc) {
          const channels = [];

          $.each($(xmlDoc).find("InputProxyChannelStatus"), function (i) {
            channels.push({
              id: $(this).find("id").eq(0).text(),
              name: $(this).find("name").eq(0).text(),
              online: ($(this).find("online").eq(0).text().toLowerCase() === 'true'),
              ip: $(this).find("ipAddress").eq(0).text()
            });
          });

          resolve(channels);
        }, error: function (status, xmlDoc) {
          reject();
        }
      });
    });
  }

  const take_picture = async function (handle) {
    return await new Promise((resolve, reject) => {
      const xmlDoc = WebVideoCtrl.I_GetLocalCfg();
      let szCaptureFileFormat = "0";
      if (xmlDoc != null) {
        szCaptureFileFormat = $(xmlDoc).find("CaptureFileFormat").eq(0).text();
      }

      var szPicName = new Date().getTime();
      szPicName += ("0" === szCaptureFileFormat) ? ".jpg" : ".bmp";

      WebVideoCtrl.I2_CapturePic(szPicName, {
        bDateDir: true
      });

      resolve();
    });
  }

  const start_recording = async function (handle) {
    return await new Promise((resolve, reject) => {
      handle.I_StartRecord(new Date().getTime().toString(), {
        bDateDir: true,
        success: function () {
          resolve();
        },
        error: function (error) {
          console.error("Start Recording Error: ", error);
          reject(error);
        }
      });
    });
  }

  const stop_recording = async function (handle) {
    return await new Promise((resolve, reject) => {
      handle.I_StopRecord({
        success: function () {
          resolve();
        },
        error: function (error) {
          console.error("Stop Recording Error: ", error);
          reject(error);
        }
      });
    });
  }

  const zoom_in = async function (handle) {
    return await new Promise((resolve, reject) => {
      handle.I_PTZControl(videoRecorderInfo.recorderPrivateIp, 10, false, {
        iWndIndex: 0,
        success: function (xmlDoc) {
          resolve(xmlDoc)
        }, error: function (status, xmlDoc) {
          reject()
        }
      });
    });
  }

  const zoom_out = async function (handle) {
    return await new Promise((resolve, reject) => {
      handle.I_PTZControl(videoRecorderInfo.recorderPrivateIp, 11, false, {
        iWndIndex: 0,
        success: function (xmlDoc) {
          resolve(xmlDoc)
        }, error: function (status, xmlDoc) {
          reject()
        }
      });
    });
  }

  const zoom_stop = async function (handle) {
    return await new Promise((resolve, reject) => {
      handle.I_PTZControl(videoRecorderInfo.recorderPrivateIp, 11, true, {
        iWndIndex: 0,
        success: function (xmlDoc) {
          resolve(xmlDoc)
        }, error: function (status, xmlDoc) {
          reject()
        }
      });
    });
  }

  const preview_recorder = async function (handle, { privateIP, publicIP, rtsp_port, stream_type, channel_id, zero_channel, port }) {
    try {
      await new Promise((resolve, reject) => {
        handle.I_StartRealPlay(privateIP, publicIP, {
          iRtspPort: rtsp_port,
          iStreamType: stream_type,
          iChannelID: channel_id,
          bZeroChannel: zero_channel,
          iWSPort: port,
          success: function () {
            resolve();
          },
          error: function () {
            reject(new Error("Error in preview_recorder"));
          }
        });
      });
    } catch (error) {
      console.log(error);  // Will log: "Error: An error occurred in preview_recorder"
    }

  }

  const stop_preview_recorder = async function (handle) {
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

  const move_ptz = async function (handle, ptz_index, ptz_speed) {
    return await new Promise((resolve, reject) => {
      handle.I_PTZControl(videoRecorderInfo.recorderPrivateIp, ptz_index, false, {
        iPTZSpeed: ptz_speed,
        success: function (xmlDoc) {
          resolve(xmlDoc);
        }, error: function (status, xmlDoc) {
          reject();
        }
      });
    });
  }

  const stop_ptz = async function (handle) {
    return await new Promise((resolve, reject) => {
      handle.I_PTZControl(videoRecorderInfo.recorderPrivateIp, 1, true, {
        success: function (xmlDoc) {
          resolve(xmlDoc);
        }, error: function (status, xmlDoc) {
          reject()
        }
      });
    })
  }

  const focus_in = async function (handle) {
    return await new Promise((resolve, reject) => {
      handle.I_PTZControl(videoRecorderInfo.recorderPrivateIp, 12, false, {
        iWndIndex: 0,
        success: function (xmlDoc) {
          resolve(xmlDoc)
        }, error: function (status, xmlDoc) {
          reject();
        }
      });
    });
  }

  const focus_out = async function (handle) {
    return await new Promise((resolve, reject) => {
      handle.I_PTZControl(videoRecorderInfo.recorderPrivateIp, 13, false, {
        iWndIndex: 0,
        success: function (xmlDoc) {
          resolve(xmlDoc)
        }, error: function (status, xmlDoc) {
          reject();
        }
      });
    });
  }

  const focus_stop = async function (handle) {
    return await new Promise((resolve, reject) => {
      handle.I_PTZControl(videoRecorderInfo.recorderPrivateIp, 12, true, {
        iWndIndex: 0,
        success: function (xmlDoc) {
          resolve(xmlDoc)
        }, error: function (status, xmlDoc) {
          reject();
        }
      });
    });
  }

  const iris_in = async function (handle) {
    return await new Promise((resolve, reject) => {
      handle.I_PTZControl(videoRecorderInfo.recorderPrivateIp, 14, true, {
        iWndIndex: 0,
        success: function (xmlDoc) {
          resolve(xmlDoc)
        }, error: function (status, xmlDoc) {
          reject();
        }
      });
    });
  }

  const iris_out = async function (handle) {
    return await new Promise((resolve, reject) => {
      handle.I_PTZControl(videoRecorderInfo.recorderPrivateIp, 15, true, {
        iWndIndex: 0,
        success: function (xmlDoc) {
          resolve(xmlDoc)
        }, error: function (status, xmlDoc) {
          reject();
        }
      });
    });
  }

  const iris_stop = async function (handle) {
    return await new Promise((resolve, reject) => {
      handle.I_PTZControl(videoRecorderInfo.recorderPrivateIp, 14, true, {
        iWndIndex: 0,
        success: function (xmlDoc) {
          resolve(xmlDoc)
        }, error: function (status, xmlDoc) {
          reject();
        }
      });
    });
  }

  const set_preset = async function (handle, preset_id) {
    return await new Promise((resolve, reject) => {
      handle.I_SetPreset(videoRecorderInfo.recorderPrivateIp, preset_id, {
        success: function (xmlDoc) {
          resolve(xmlDoc)
        }, error: function (status, xmlDoc) {
          reject();
        }
      });
    });
  }

  const go_preset = async function (handle, preset_id) {
    return await new Promise((resolve, reject) => {
      handle.I_GoPreset(videoRecorderInfo.recorderPrivateIp, preset_id, {
        success: function (xmlDoc) {
          resolve(xmlDoc)
        }, error: function (status, xmlDoc) {
          reject();
        }
      });
    });
  }

  const enable_audio = async function (handle) {
    return await new Promise((resolve, reject) => {
      var res = handle.I_OpenSound();
      if (res == 0) {
        console.log("Audio Enabled");
      } else {
        console.log("Audio Enable Failed");
      }
    });
  }

  const disable_audio = async function (handle) {
    return await new Promise((resolve, reject) => {
      var res = handle.I_CloseSound();
      if (res == 0) {
        console.log("Audio Disabled");
      } else {
        console.log("Audio Disable Failed");
      }
    });
  }

  const search_video = async function (handle, { ip, port, type, stream_type, start_time, end_time }) {
    return await new Promise((resolve, reject) => {

      var szDeviceIdentify = `${ip}_${port}`,
        iChannelID = 1,
        bZeroChannel = false,
        iStreamType = stream_type,
        szStartTime = (new Date(start_time.getTime() - start_time.getTimezoneOffset() * 60000)).toISOString(),
        szEndTime = (new Date(end_time.getTime() - end_time.getTimezoneOffset() * 60000)).toISOString();

      let iSearchTimes = 0;
      let g_iSearchTimes = 0;
      const results = [];


      handle.I_RecordSearch(szDeviceIdentify, iChannelID, szStartTime, szEndTime, {
        iStreamType: iStreamType,
        iSearchPos: g_iSearchTimes * 40,
        success: function (xmlDoc) {
          if ("MORE" === $(xmlDoc).find("responseStatusStrg").eq(0).text()) {
            for (var i = 0, nLen = $(xmlDoc).find("searchMatchItem").length; i < nLen; i++) {
              var szPlaybackURI = $(xmlDoc).find("playbackURI").eq(i).text();
              if (szPlaybackURI.indexOf("name=") < 0) {
                break;
              }
              var szStartTime = $(xmlDoc).find("startTime").eq(i).text();
              var szEndTime = $(xmlDoc).find("endTime").eq(i).text();
              var szFileName = szPlaybackURI.substring(szPlaybackURI.indexOf("name=") + 5, szPlaybackURI.indexOf("&size="));

              results.push({
                start_time: szStartTime,
                end_time: szEndTime,
                file_name: szFileName,
                playbackURI: szPlaybackURI
              })
            }
            g_iSearchTimes++;
          } else if ("OK" === $(xmlDoc).find("responseStatusStrg").eq(0).text()) {
            var iLength = $(xmlDoc).find("searchMatchItem").length;
            for (var i = 0; i < iLength; i++) {
              var szPlaybackURI = $(xmlDoc).find("playbackURI").eq(i).text();
              if (szPlaybackURI.indexOf("name=") < 0) {
                break;
              }
              var szStartTime = $(xmlDoc).find("startTime").eq(i).text();
              var szEndTime = $(xmlDoc).find("endTime").eq(i).text();
              var szFileName = szPlaybackURI.substring(szPlaybackURI.indexOf("name=") + 5, szPlaybackURI.indexOf("&size="));

              results.push({
                start_time: szStartTime,
                end_time: szEndTime,
                file_name: szFileName,
                playbackURI: szPlaybackURI
              })
            }

            resolve(results)
          }
        }, error: function (status, xmlDoc) {
          reject()
        }
      });
    });
  }

  const download_video = async function (handle, { ip, file_name, playbackURI, start_time, end_time }) {
    return await new Promise((resolve, reject) => {
      var szDeviceIdentify = `${ip}`,
        szChannelID = 1,
        szFileName = file_name,
        szPlaybackURI = playbackURI,
        szStartTime = (new Date(start_time.getTime() - start_time.getTimezoneOffset() * 60000)).toISOString(),
        szEndTime = (new Date(end_time.getTime() - end_time.getTimezoneOffset() * 60000)).toISOString();

      const g_iDownloadID = handle.I_StartDownloadRecordByTime(szDeviceIdentify, szPlaybackURI, szFileName, szStartTime, szEndTime, {
        bDateDir: true
      });
    });
  }

  const play = async function (handle, { publicIP, privateIP, port, IWSPort, rtsp_port, type, stream_type, start_time, end_time }) {
    return await new Promise((resolve, reject) => {
      console.log("handlePlay", start_time);
      var szDeviceIdentify = `${publicIP}`,
        iChannelID = 1,
        bZeroChannel = false,
        iStreamType = stream_type,
        szStartTime = (new Date(start_time.getTime() - start_time.getTimezoneOffset() * 60000)).toISOString(),
        szEndTime = (new Date(end_time.getTime() - end_time.getTimezoneOffset() * 60000)).toISOString();

      console.log("startTimelocal", szStartTime);


      handle.I_StartPlayback(publicIP, privateIP, {
        iRtspPort: rtsp_port,
        iStreamType: type,
        iChannelID: 1,
        szStartTime: szStartTime,
        szEndTime: szEndTime,
        port: IWSPort,
        success: function () {
          resolve();
        }, error: function (status, xmlDoc) {
          reject()
        }
      });
    });
  }

  const stop = async function (handle) {
    return await new Promise((resolve, reject) => {
      handle.I_Stop({
        success: function () {
          resolve();
        },
        error: function () {
          reject();
        }
      });
    });
  }

  const pause = async function (handle) {
    return await new Promise((resolve, reject) => {
      handle.I_Pause({
        success: function () {
          resolve();
        },
        error: function () {
          reject();
        }
      });
    });
  }

  const resume = async function (handle) {
    return await new Promise((resolve, reject) => {
      handle.I_Resume({
        success: function () {
          resolve();
        },
        error: function () {
          reject();
        }
      });
    });
  }

  const slow_forward = async function (handle) {
    return await new Promise((resolve, reject) => {
      handle.I_PlaySlow({
        success: function () {
          resolve();
        },
        error: function () {
          reject();
        }
      });
    });
  }

  const fast_forward = async function (handle) {
    return await new Promise((resolve, reject) => {
      handle.I_PlayFast({
        success: function () {
          resolve();
        },
        error: function () {
          reject();
        }
      });
    });
  }

  const start_clip = async function (handle, { }) {

  }

  const stop_clip = async function (handle, { }) {

  }

  const getVideoRecorder = async (recorderId) => {
    try {
      Promise.resolve(videoRecorderApi.getRecorder(parseInt(recorderId)))
        .then(async res => {
          if (res.status == 200) {
            const data = await res.json()

            if (!loadedSDK) {
              const sdk_handle = await get_sdk_handle();
              setSDKHandle(sdk_handle);

              await attach_sdk(sdk_handle);

              const login = await login_sdk(sdk_handle, {
                ip: data.recorderPrivateIp,
                port: data.recorderPortNumber,
                username: data.recorderUsername,
                password: data.recorderPassword
              });

              const device_info = await get_device_info(sdk_handle, {
                ip: data.recorderPrivateIp
              })

              for (const key of Object.keys(device_info)) {
                data[key] = device_info[key]
              }

              const analogue_channels = await get_analogue_channels(sdk_handle, {
                ip: data.recorderPrivateIp
              })

              const digital_channels = await get_digital_channels(sdk_handle, {
                ip: data.recorderPrivateIp
              })

              data.recorderCameras = [...digital_channels];

              const device_ports = await get_device_ports(sdk_handle, {
                ip: data.recorderPrivateIp
              })

              data.rtsp_port = device_ports.iRtspPort;

              await preview_recorder(sdk_handle, {
                privateIP: data.recorderPrivateIp,
                publicIP: data.recorderPublicIp, rtsp_port: data.recorderPortNumber,
                stream_type: 1, channel_id: cameraId, zero_channel: false, port: data.recorderIWSPort
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
    } catch (err) { }
  }

  const getInfo = useCallback(async () => {
    getVideoRecorder(recorderId)
  }, [isMounted])

  // if full screen closed using ESC key
  addEventListener("fullscreenchange", async () => {
    if (sdkHandle && theaterMode && !document.fullscreenElement) {
      const { clientHeight: height, clientWidth: width } = document.getElementById('stream-container');
      await sdkHandle.I_Resize(`${width}`, `${window.innerHeight - 20}`)
      setTheaterMode(false);
    }
  })

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
        <ServerDownError
          open={serverDownOpen}
          handleDialogClose={() => { setServerDownOpen(false) }}
        />
        <Container style={theaterMode ? { maxWidth: "100%" } : {}}>
          <div>
            <Box sx={{ mb: 4 }}>
              {/* <NextLink
                  href={`/dashboard/video-recorders/details/${recorderId}`}
                  passHref
              >       */}
              <Link
                color="textPrimary"
                component="a"
                onClick={() => {
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
                <Typography variant="subtitle2">Video Recorder Details</Typography>
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
                    {videoRecorderInfo ? `${previewMode === 'live' ? 'Live View' : 'Playback'}: 
    ${videoRecorderInfo.recorderCameras
                      [parseInt(cameraId) - 1].name}` : " Camera Not Found"}
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
                  key="plugin_div"
                  style={{ justifyContent: 'center', display: 'flex' }}
                  dangerouslySetInnerHTML={{ __html: '<div id="divPlugin" style = "height: auto;width: 100%;background-color: black;aspect-ratio: 1.6; border-radius: 4px;overflow: hidden;"></div>' }}
                />

                <button type="button"
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    right: "10px",
                    background: "transparent",
                    border: "none"
                  }}
                  onClick={async () => {
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

                    <div style={{
                      padding: '.6em',
                      margin: '.2em',
                      display: 'inline-block',
                      border: '1px solid #D1D5DB',
                      border: `1px solid ${(previewMode === 'live') ? '#3e5879' : '#D1D5DB'}`,
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                      onClick={async () => {
                        setPreviewMode('live');
                        await preview_recorder(sdkHandle, {
                          privateIP: videoRecorderInfo.recorderPrivateIp,
                          publicIP: videoRecorderInfo.recorderPublicIp, rtsp_port: videoRecorderInfo.rstp_port,
                          stream_type: 1, channel_id: 1, zero_channel: false, port: videoRecorderInfo.recorderIWSPort
                        });
                      }}>
                      <label style={{ color: "#6B7280", cursor: 'pointer' }}>Live View</label>
                    </div>
                    <Switch
                      onClick={async () => {
                        if (previewMode === "live") {
                          await stop_preview_recorder(sdkHandle);
                          setPreviewMode('playback');
                          console.log(previewMode);
                        } else {
                          await preview_recorder(sdkHandle, {
                            privateIP: videoRecorderInfo.recorderPrivateIp,
                            publicIP: videoRecorderInfo.recorderPublicIp, rtsp_port: videoRecorderInfo.rstp_port,
                            stream_type: 1, channel_id: 1, zero_channel: false, port: videoRecorderInfo.recorderIWSPort
                          });
                          setPreviewMode('live')
                          console.log(previewMode);
                        }
                      }}
                      checked={(previewMode === 'live') ? false : true}
                      size="small" >
                    </Switch>
                    <div style={{
                      padding: '.6em',
                      margin: '.2em',
                      display: 'inline-block',
                      border: `1px solid ${(previewMode === 'live') ? '#D1D5DB' : '#3e5879'}`,
                      borderRadius: 4,
                      cursor: 'pointer'
                    }}
                      onClick={async () => {
                        setPreviewMode('playback');
                        await stop_preview_recorder(sdkHandle);
                      }}>
                      <label style={{ color: "#6B7280", cursor: 'pointer' }}>Playback</label>
                    </div>
                  </div>
                </div>

                <div style={{ display: (previewMode === 'live') ? null : 'none' }}>
                  <div style={{
                    padding: '.6em',
                    margin: '.2em',
                    border: '1px solid #D1D5DB',
                    borderRadius: 4,
                    cursor: 'pointer',
                    display: 'inline-block'
                  }}>
                    <label style={{ display: 'block', color: "#6B7280", padding: '0.5em' }}>PTZ Controls</label>
                    <div style={{ display: 'flex' }}>
                      <div>
                        <InputLabel id="ptz_speed">Speed</InputLabel>
                        <Select
                          labelId="ptz_speed"
                          onChange={({ target: { value } }) => {
                            setPtzSpeed(value)
                          }}
                          sx={{ width: 100 }}
                          value={ptz_speed}
                          label="Speed">
                          {
                            [1, 2, 3, 4, 5, 6, 7].map((value) => (<MenuItem key={value}
                              value={value}>{value}</MenuItem>))
                          }
                        </Select>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', maxWidth: '225px', marginBottom: '8px' }}>
                          <Button
                            sx={{ m: 1 }}
                            style={{ color: 'transparent', margin: 5 }}
                            variant="contained"
                            onClick={async () => {
                              await move_ptz(sdkHandle, 5, ptz_speed);
                              await new Promise(resolve => setTimeout(resolve, 500));
                              await stop_ptz(sdkHandle);
                            }}>
                            ⯆
                          </Button>

                          <Button
                            sx={{ m: 1 }}
                            variant="contained"
                            style={{ margin: 5 }}
                            onClick={async () => {
                              await move_ptz(sdkHandle, 1, ptz_speed);
                              await new Promise(resolve => setTimeout(resolve, 500));
                              await stop_ptz(sdkHandle);
                            }}>
                            ⯅
                          </Button>

                          <Button
                            sx={{ m: 1 }}
                            variant="contained"
                            style={{ color: 'transparent', margin: 5 }}
                            onClick={async () => {
                              await move_ptz(sdkHandle, 7, ptz_speed);
                              await new Promise(resolve => setTimeout(resolve, 500));
                              await stop_ptz(sdkHandle);
                            }}>
                            ⯅
                          </Button>

                          <Button
                            sx={{ m: 1 }}
                            variant="contained"
                            style={{ margin: 5 }}
                            onClick={async () => {
                              await move_ptz(sdkHandle, 3, ptz_speed);
                              await new Promise(resolve => setTimeout(resolve, 500));
                              await stop_ptz(sdkHandle);
                            }}>
                            ⯇
                          </Button>

                          <Button
                            sx={{ m: 1 }}
                            style={{ color: 'transparent', margin: 5 }}
                            variant="contained"
                            onClick={async () => {
                              //await stop_recording(sdkHandle);
                            }}>
                            ⯆
                          </Button>

                          <Button
                            sx={{ m: 1 }}
                            variant="contained"
                            style={{ margin: 5 }}
                            onClick={async () => {
                              await move_ptz(sdkHandle, 4, ptz_speed);
                              await new Promise(resolve => setTimeout(resolve, 500));
                              await stop_ptz(sdkHandle);
                            }}>
                            ⯈
                          </Button>

                          <Button
                            sx={{ m: 1 }}
                            style={{ color: 'transparent', margin: 5 }}
                            variant="contained"
                            onClick={async () => {
                              await move_ptz(sdkHandle, 6, ptz_speed);
                              await new Promise(resolve => setTimeout(resolve, 500));
                              await stop_ptz(sdkHandle);
                            }}>
                            ▼
                          </Button>

                          <Button
                            sx={{ m: 1 }}
                            variant="contained"
                            style={{ margin: 5 }}
                            onClick={async () => {
                              await move_ptz(sdkHandle, 2, ptz_speed);
                              await new Promise(resolve => setTimeout(resolve, 500));
                              await stop_ptz(sdkHandle);
                            }}>
                            ▼
                          </Button>

                          <Button
                            sx={{ m: 1 }}
                            style={{ color: 'transparent', margin: 5 }}
                            variant="contained"
                            onClick={async () => {
                              await move_ptz(sdkHandle, 8, ptz_speed);
                              await new Promise(resolve => setTimeout(resolve, 500));
                              await stop_ptz(sdkHandle);
                            }}>
                            ▼
                          </Button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <label style={{ width: 80, fontWeight: "bold", alignSelf: 'center' }}>Zoom:</label>
                          <div style={{ display: 'flex', gap: '1px' }}>
                            <Button
                              sx={{ m: 1 }}
                              variant="contained"
                              onClick={async () => {
                                await zoom_out(sdkHandle);
                                await new Promise(resolve => setTimeout(resolve, 500));
                                await zoom_stop(sdkHandle);
                              }}
                            >
                              -
                            </Button>
                            <Button
                              sx={{ m: 1 }}
                              variant="contained"
                              onClick={async () => {
                                await zoom_in(sdkHandle);
                                await new Promise(resolve => setTimeout(resolve, 500));
                                await zoom_stop(sdkHandle);
                              }}
                            >
                              +
                            </Button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <label style={{ width: 80, fontWeight: "bold", alignSelf: 'center' }}>Focus:</label>
                          <div style={{ display: 'flex', gap: '1px' }}>
                            <Button
                              sx={{ m: 1 }}
                              variant="contained"
                              onClick={async () => {
                                await focus_out(sdkHandle);
                                await new Promise(resolve => setTimeout(resolve, 500));
                                await focus_stop(sdkHandle);
                              }}
                            >
                              -
                            </Button>
                            <Button
                              sx={{ m: 1 }}
                              variant="contained"
                              onClick={async () => {
                                await focus_in(sdkHandle);
                                await new Promise(resolve => setTimeout(resolve, 500));
                                await focus_stop(sdkHandle);
                              }}
                            >
                              +
                            </Button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <label style={{ width: 80, fontWeight: "bold", alignSelf: 'center' }}>Iris:</label>
                          <div style={{ display: 'flex', gap: '1px' }}>
                            <Button
                              sx={{ m: 1 }}
                              variant="contained"
                              onClick={async () => {
                                await iris_out(sdkHandle);
                                await new Promise(resolve => setTimeout(resolve, 500));
                                await iris_stop(sdkHandle);
                              }}
                            >
                              -
                            </Button>
                            <Button
                              sx={{ m: 1 }}
                              variant="contained"
                              onClick={async () => {
                                await iris_in(sdkHandle);
                                await new Promise(resolve => setTimeout(resolve, 500));
                                await iris_stop(sdkHandle);
                              }}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <InputLabel id="preset_view">Preset View</InputLabel>
                      <Select
                        labelId="preset_view"
                        onChange={({ target: { value } }) => {
                          setPresetView(value)
                        }}
                        sx={{ width: 100 }}
                        value={preset_view}
                        label="Preset View">
                        {
                          [1, 2, 3, 4, 5, 6, 7].map((value) => (<MenuItem key={value}
                            value={value}>{value}</MenuItem>))
                        }
                      </Select>
                    </div>

                    <div>
                      <Button
                        sx={{ m: 1 }}
                        variant="contained"
                        onClick={async () => {
                          await set_preset(sdkHandle, preset_view);
                        }}>
                        Save
                      </Button>

                      <Button
                        sx={{ m: 1 }}
                        variant="contained"
                        onClick={async () => {
                          await go_preset(sdkHandle, preset_view);
                        }}>
                        Retrieve
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{
                    padding: '.6em',
                    margin: '.2em',
                    border: '1px solid #D1D5DB',
                    borderRadius: 4,
                    cursor: 'pointer',
                    display: 'inline-block'
                  }}>
                    <label style={{ display: 'block', color: "#6B7280", padding: '0.5em' }}>Recording</label>
                    <div style={{ display: 'flex' }}>
                      <label style={{
                        width: 120, fontWeight: "bold",
                        alignSelf: 'center'
                      }}>Picture:</label>

                      <div style={{ flex: 1 }}>
                        <Button
                          sx={{ m: 1 }}
                          variant="contained"
                          onClick={async () => {
                            await take_picture(sdkHandle);
                          }}>
                          Snapshot
                        </Button>
                      </div>
                    </div>

                    <div style={{ display: 'flex' }}>
                      <label style={{
                        width: 120, fontWeight: "bold",
                        alignSelf: 'center'
                      }}>
                        Recording:
                      </label>
                      <div style={{ display: 'flex' }}>
                        <Button
                          sx={{ m: 1 }}
                          variant="contained"
                          onClick={toggleRecording}
                        >
                          {isRecording ? 'Stop' : 'Start'}
                        </Button>
                      </div>
                    </div>

                    <div style={{ display: 'flex' }}>
                      <label style={{
                        width: 120, fontWeight: "bold",
                        alignSelf: 'center'
                      }}>
                        Audio:
                      </label>
                      <div style={{ display: 'flex' }}>
                        <Button
                          sx={{ m: 1 }}
                          variant="contained"
                          onClick={toggleAudio}
                        >
                          {audioEnabled ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: "center" }}>
                      <Button
                        sx={{ m: 1 }}
                        variant="contained"
                        onClick={() => {
                          window.open(`http://${videoRecorderInfo.recorderPrivateIp}:${videoRecorderInfo.recorderPortNumber}`);
                        }}>
                        Detailed Interface
                      </Button>

                      <Typography color="neutral.500" variant="body2">
                        To access this feature, please ensure that you are connected to the local network
                      </Typography>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: (previewMode === 'playback') ? 'grid' : 'none',
                  padding: '1em',
                  border: '1px solid #D1D5DB',
                  borderRadius: 4,
                }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <InputLabel id="ptz_speed">Stream type</InputLabel>
                      <Select
                        labelId="ptz_speed"
                        onChange={({ target: { value } }) => { setStreamType(value) }}
                        sx={{ width: 200 }}
                        value={stream_type}
                        label="Stream type"
                      >
                        {[
                          { "name": "Main stream", "value": 1 },
                          { "name": "Sub stream", "value": 2 }
                        ].map(({ name, value }) => (<MenuItem key={value} value={value}>{name}</MenuItem>))}
                      </Select>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <div>
                        <DateTimePicker
                          label="Start Time"
                          value={start_time}
                          onChange={(newValue) => { setStartTime(newValue); }}
                          renderInput={(params) => <TextField {...params} />}
                        />
                        <DateTimePicker
                          label="End Time"
                          value={end_time}
                          onChange={(newValue) => { setEndTime(newValue); }}
                          renderInput={(params) => <TextField {...params} />}
                        />
                      </div>
                      <div style={{ display: 'flex', padding: '10px' }}>
                        <Button
                          style={{ alignSelf: 'start', marginTop: '1em', marginRight: '10px' }}
                          variant="contained"
                          onClick={async () => {
                            const results = await search_video(sdkHandle, {
                              type: 1,
                              ip: videoRecorderInfo.recorderPrivateIp,
                              port: videoRecorderInfo.recorderPortNumber,
                              stream_type, start_time, end_time
                            });
                            setPlaybackFiles(results);
                          }}
                        >
                          Search
                        </Button>
                        <Button
                          style={{ alignSelf: 'start', marginTop: '1em' }}
                          variant="contained"
                          onClick={async () => {
                            if (playback_files.length >= 1) {
                              const {
                                start_time, end_time, file_name, playbackURI
                              } = playback_files[0];

                              await download_video(sdkHandle, {
                                ip: videoRecorderInfo.recorderPublicIp,
                                file_name, playbackURI, start_time: new Date(start_time), end_time: new Date(end_time)
                              })
                            }
                          }}
                        >
                          Download
                        </Button>
                      </div>
                    </Grid>

                    <Grid item xs={12}>
                      <div style={{ maxWidth: 800 }}>
                        <table style={{ maxWidth: 800 }}>
                          <tr>
                            <th>ID</th>
                            <th>File Name</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                            <th>Download</th>
                          </tr>
                          {
                            playback_files.map(({
                              start_time, end_time, file_name, playbackURI
                            }, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{file_name}</td>
                                <td>{new Date(start_time).toLocaleString()}</td>
                                <td>{new Date(end_time).toLocaleString()}</td>
                                <td>
                                  <div onClick={async () => {
                                    await download_video(sdkHandle, {
                                      ip: videoRecorderInfo.recorderPrivateIp,
                                      file_name, playbackURI, start_time: new Date(start_time), end_time: new Date(end_time)
                                    })
                                  }}>
                                    <a href="#">Download</a>
                                  </div>
                                </td>
                              </tr>
                            ))
                          }
                        </table>
                      </div>
                    </Grid>

                    <Grid item xs={12}>
                      <div style={{ display: 'flex' }}>
                        <label style={{
                          width: 120, fontWeight: "bold",
                          alignSelf: 'center'
                        }}>
                          Media:
                        </label>
                        <div style={{ display: 'flex' }}>
                          {!isPlaying ? (
                            <Button
                              sx={{ m: 1 }}
                              variant="contained"
                              onClick={handlePlay}
                            >
                              Play
                            </Button>
                          ) : (
                            <Button
                              sx={{ m: 1 }}
                              variant="contained"
                              onClick={handleStop}
                            >
                              Stop
                            </Button>
                          )}
                        </div>

                        <div style={{ display: 'flex' }}>
                          {isPaused ? (
                            <Button
                              sx={{ m: 1 }}
                              variant="contained"
                              onClick={async () => {
                                await resume(sdkHandle);
                                setIsPaused(false);
                              }}>
                              Resume
                            </Button>
                          ) : (
                            <Button
                              sx={{ m: 1 }}
                              variant="contained"
                              onClick={async () => {
                                await pause(sdkHandle);
                                setIsPaused(true);
                              }}>
                              Pause
                            </Button>
                          )}
                        </div>
                      </div>
                    </Grid>

                    <Grid item xs={12}>
                      <div style={{ display: 'flex' }}>
                        <label style={{
                          width: 120, fontWeight: "bold",
                          alignSelf: 'center'
                        }}>
                          Media 2:
                        </label>
                        <div style={{ display: 'flex' }}>
                          <Button
                            sx={{ m: 1 }}
                            variant="contained"
                            onClick={async () => {
                              await slow_forward(sdkHandle);
                            }}>
                            Slow forward
                          </Button>

                          {/* <Button
                            sx={{ m: 1 }}
                            variant="contained"
                            onClick={async () => {
                              await fast_forward(sdkHandle);
                            }}>
                            Fast forward
                          </Button> */}
                        </div>
                        {/* <div style={{ display: 'flex' }}>
                          <label style={{
                            width: 120, fontWeight: "bold",
                            alignSelf: 'center'
                          }}>
                            Media 3:
                          </label>
                          <div style={{ display: 'flex' }}>
                            <Button
                              sx={{ m: 1 }}
                              variant="contained"
                              onClick={async () => {
                                await take_picture(sdkHandle);
                              }}>
                              Capture
                            </Button>

                            <Button
                              sx={{ m: 1 }}
                              variant="contained"
                              onClick={async () => {
                                await start_recording(sdkHandle);
                              }}>
                              Start Clip
                            </Button>

                            <Button
                              sx={{ m: 1 }}
                              variant="contained"
                              onClick={async () => {
                                await stop_recording(sdkHandle);
                              }}>
                              Stop Clip
                            </Button>
                          </div>
                        </div> */}

                      </div>
                    </Grid>

                  </Grid>
                </div>

              </Grid>
            </Grid>
          </Box>
        </Container >
      </Box >
    </>
  )
}

VideoCameraDetails.getLayout = (page) => (
  <AuthGuard>
    <Head>
      <title>
        Etlas: Video Camera Preview
      </title>
      <script src="/static/sdk/codebase/jquery-1.12.1.min.js"></script>
      <script src="/static/sdk/codebase/encryption/AES.js"></script>
      <script src="/static/sdk/codebase/encryption/cryptico.min.js"></script>
      <script src="/static/sdk/codebase/encryption/crypto-3.1.2.min.js"></script>
      <script id="videonode"
        src="/static/sdk/codebase/webVideoCtrl.js"></script>
    </Head>
    <DashboardLayout>
      {page}
    </DashboardLayout>
  </AuthGuard>
)

export default VideoCameraDetails;