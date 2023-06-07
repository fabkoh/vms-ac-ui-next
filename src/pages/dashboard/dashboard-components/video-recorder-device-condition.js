import { Avatar, Box, Button, Card, CardActions, Divider, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ArrowRight as ArrowRightIcon, ContentPasteGoSharp } from '@mui/icons-material';
import { ChevronUp as ChevronUpIcon } from '../../../icons/chevron-up';
import { Chart } from '../../../components/chart';
import { React, useState, useEffect } from 'react';
import videoRecorderApi from '../../../api/videorecorder';
import { useMounted } from "../../../hooks/use-mounted";
import toast from "react-hot-toast";

const VideoRecorderDeviceCondition = () => {
  const theme = useTheme();
  const isMounted = useMounted();

  const [upCounter, setUpCounter] = useState(0);
  const [recorders, setRecorders] = useState([]);
  const [loadedSDK, setLoadedSDK] = useState(false)

  // sdk 
  const get_sdk_handle = async function() {
    console.log("inside sdkhandle")
      while (true) {
          if (window.WebVideoCtrl && window.jQuery) {
            console.log("inside sdkhandle if")
              return window.WebVideoCtrl
          }
          console.log("outside")
          await new Promise(resolve => setTimeout(resolve, 50));
      }
  }

  const attach_sdk = async function(handle) {
      return await new Promise((resolve, reject) => {
          handle.I_InitPlugin(500, 300, {
              bWndFull:       true,
              iPackageType:   2,
              iWndowType:     1,
              bNoPlugin:      true,
              cbSelWnd:           function (xmlDoc) { },
              cbDoubleClickWnd:   function (iWndIndex, bFullScreen) { },
              cbEvent:            function (iEventType, iParam1, iParam2) { },
              cbRemoteConfig:     function () { },
              cbInitPluginComplete: function () {
                  try {
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
              },
              error: function (status, xmlDoc) {
                  reject();
              }
          })
      } catch(ex) {}
      })
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
              },
              error: function (status, xmlDoc) {
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
                      //setCount(prev => prev + 1)
                      channels.push({
                          id:     $(this).find("id").eq(0).text(),
                          name:   $(this).find("name").eq(0).text(),
                          online: ($(this).find("online").eq(0).text().toLowerCase() === 'true'),
                          ip:     $(this).find("ipAddress").eq(0).text()
                      });
                  });

                  resolve(channels);
              },
              error: function (status, xmlDoc) {
                  reject();
              }
          });
      });
  }


  const getRecordersLocal = async () => {
      const res = await videoRecorderApi.getRecorders();
      if (res.status != 200) {
          toast.error("Recorders info failed to load");
          if (res.status == serverDownCode) {
              setServerDownOpen(true);
          }
          return [];
      }
      const data = await res.json();
      setRecorders(data);
      if (isMounted()) {
        console.log("checkpoint1")
              if (!loadedSDK){
                console.log("checkpoint2")
                for (const recorder of data) { 
                  console.log("checkpoitn5")
                  const sdk_handle = await get_sdk_handle();
                  await attach_sdk(sdk_handle);
                  console.log("handling login")
                  const login = await login_sdk(sdk_handle, {
                      ip:         recorder.recorderPublicIp,
                      port:       recorder.recorderPortNumber,
                      username:   recorder.recorderUsername,
                      password:   recorder.recorderPassword
                  });
                  
                  console.log("getting device info")
                  const device_info = await get_device_info(sdk_handle, {
                      ip: recorder.recorderPublicIp
                  })
                  
                  console.log("mapping key")
                  for (const key of Object.keys(device_info)) {
                      recorder[key] = device_info[key]
                  }
                
                  console.log("getting analogue channels")
                  const analogue_channels = await get_analogue_channels(sdk_handle, {
                      ip: recorder.recorderPublicIp
                  })
                  console.log("getting digital channels")
                  const digital_channels = await get_digital_channels(sdk_handle, {
                      ip: recorder.recorderPublicIp
                  })
                  
                  console.log("updating recorder")
                  recorder.cameras  = digital_channels;
                  recorder.recorderSerialNumber = device_info["serial_number"];
                  await videoRecorderApi.updateRecorder(recorder);
                
                  console.log("checkpoint3")
                  recorder.isActive = true;
                  setRecorders(prevRecorders => [...prevRecorders, recorder]);
                }

              console.log("checkpoint4")
              setLoadedSDK(true);
              }
          }
      
      return data;
  }

  useEffect(() => {
    const getRecordersHelper = async () => {
      await getRecordersLocal();
    }

    getRecordersHelper();
  }, []);

  // useEffect(() => {
  //   const count = async () => {
  //     console.log("Count is done");
  //     const promises = recorders.map(async (recorder) => {
  //       try {
  //         console.log("Checking recorder isActive");
  //         console.log(recorder.recorderId);
  //         console.log(recorder.isActive);
  //         if (isActive) {
  //           console.log("Recorder is active");
  //           setUpCounter(prevUpCounter => prevUpCounter + 1);
  //         }
  //         console.log("Checked recorder");
  //       } catch(e) {
  //           // Handle error
  //           console.error(e);
  //       }
  //     });

  //     await Promise.all(promises);
  //   }
    
  //   count();
  // }, [recorders]);


  const chartOptions = {
    chart: {
      background: 'transparent',
      stacked: false,
      toolbar: {
        show: false
      }
    },
    colors: [theme.palette.text.secondary],
    fill: {
      opacity: 1
    },
    labels: ["Health"],
    plotOptions: {
      radialBar: {
        dataLabels: {
          show: true,
        },
        hollow: {
          size: '50%'
        },
        track: {
          background: theme.palette.grey[100]
        }
      }
    },
    theme: {
      mode: theme.palette.mode
    }
  };

  const chartSeries = [(upCounter*100)/recorders.length];

  return (
    <Card>
      <Box
        sx={{
          alignItems: {
            sm: 'center'
          },
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: 'column',
          p: 3
        }}
      >
        <Chart
          height={250}
          options={chartOptions}
          series={chartSeries}
          type="radialBar"
          width={250}
        />
        <Divider />
            <Typography
              color="primary"
              variant="h4"
            >
              {upCounter} of {recorders.length}
            </Typography>
            <Divider />
            <Typography
              color="textSecondary"
              sx={{ mt: 1 }}
              variant="body1"
            >
              Recorders Healthy
            </Typography>
      </Box>
    </Card>
  );
};

export default VideoRecorderDeviceCondition;