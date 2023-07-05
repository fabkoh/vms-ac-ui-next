import { Add, Delete, Edit, HelpOutline } from "@mui/icons-material";
import { Box, Button, Card, Container, Divider, Grid, InputAdornment, MenuItem, TextField, Tooltip, Typography } from "@mui/material";
import Head from "next/head";
import NextLink from "next/link";
import { useCallback, useEffect, useRef, useState, React } from "react";
import toast from "react-hot-toast";
import videoRecorderApi from "../../../api/videorecorder";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import StyledMenu from "../../../components/dashboard/styled-menu";
import { useMounted } from "../../../hooks/use-mounted";
import { ChevronDown } from "../../../icons/chevron-down";
import { gtm } from "../../../lib/gtm";
import { applyPagination, createFilter } from "../../../utils/list-utils";
import { Confirmdelete } from "../../../components/dashboard/video-recorders/confirm-delete";
import { filterVideoByStringPlaceholder, videoRecorderCreateLink, filterRecorderByString, getVideoRecordersEditLink, filterRecorderByStatus } from "../../../utils/video-recorder";
import { serverDownCode } from "../../../api/api-helpers";
import { alpha, useTheme } from '@mui/material/styles';
import { Chart } from '../../../components/chart';

const VideoRecorderDeviceCondition = () => {
  const theme = useTheme();
  // copied
  useEffect(() => {
    gtm.push({ event: "page_view" });
  })

  // get entrances and access groups
  const [recorders, setRecorders] = useState([]);
  const [upCounter, setUpCounter] = useState(0);
  const [healthPercentage, setHealthPercentage] = useState(0);
  const [login, setLogin] = useState(false);

  const isMounted = useMounted();

  const [loadedSDK, setLoadedSDK] = useState(false)

  // sdk 
  const get_sdk_handle = async function () {
    while (true) {
      if (window.WebVideoCtrl && window.jQuery) {
        console.log("inside");
        return window.WebVideoCtrl
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    console.log("outside");
  }

  const attach_sdk = async function (handle) {
    return await new Promise((resolve, reject) => {
      handle.I_InitPlugin(500, 300, {
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
            resolve();
          } catch (ex) {
            console.warn("Failed to inject plugin")
            reject();
          }
        }
      });
    });
  }

  const login_sdk = async function (name, { ip, port, username, password }) {
    console.log("inside loginsdk");
    return await new Promise((resolve, reject) => {
      name.I_Login(ip, 2, port, username, password, {
        success: function (xmlDoc) {
          resolve();
          setLogin(true);
          console.log("login success")
        }, error: function (status, xmlDoc) {
          reject();
          console.log("login failed")
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
          },
          error: function (status, xmlDoc) {
            reject();
          }
        })
      } catch (ex) { }
    })
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
        },
        error: function (status, xmlDoc) {
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
      if (!loadedSDK) {
        await Promise.resolve(data.map(async (recorder) => {

          const sdk_handle = await get_sdk_handle();

          await attach_sdk(sdk_handle);

          // Timeout to handle case where it is already logged in
          const timeout = (ms) => new Promise((resolve, reject) => setTimeout(() => reject(new Error("Timeout")), ms));

          const login = await Promise.race([
            login_sdk(sdk_handle, {
              ip: recorder.recorderPrivateIp,
              port: recorder.recorderPortNumber,
              username: recorder.recorderUsername,
              password: recorder.recorderPassword
            }),
            timeout(4000)
          ]).catch((error) => {
            if (error.message === "Timeout") {
              console.log("Login function call timed out after 4 seconds");
            } else {
              console.error(error);
            }
          });

          const device_info = await get_device_info(sdk_handle, {
            ip: recorder.recorderPrivateIp
          })

          for (const key of Object.keys(device_info)) {
            recorder[key] = device_info[key]
          }

          const analogue_channels = await get_analogue_channels(sdk_handle, {
            ip: recorder.recorderPrivateIp
          })

          const digital_channels = await get_digital_channels(sdk_handle, {
            ip: recorder.recorderPrivateIp
          })

          recorder.cameras = digital_channels;
          recorder.recorderSerialNumber = device_info["serial_number"];
          videoRecorderApi.updateRecorder(recorder);

          setRecorders([...data]);
        }))
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
  }, [isMounted]);

  useEffect(() => {
    const count = async () => {
      setUpCounter(0);
      const promises = recorders.map(async (recorder) => {
        try {
          if (recorder && "cameras" in recorder) {
            setUpCounter(prevUpCounter => prevUpCounter + 1);
          }
        } catch (e) {
          // Handle error
          console.error(e);
        }
      });

      await Promise.all(promises);
    }

    count();
  }, [recorders]);


  useEffect(() => {
    if (recorders.length !== 0) {
      setHealthPercentage((upCounter * 100) / recorders.length);
    }
  }, [recorders, upCounter]);

  const chartOptions = {
    chart: {
      background: 'transparent',
      stacked: false,
      toolbar: {
        show: false
      }
    },
    colors: recorders.length == 0 ? [theme.palette.text.primary]
      : healthPercentage == 100 ? [theme.palette.success.light]
        : healthPercentage < 100 ? [theme.palette.warning.light]
          : [theme.palette.text.primary],
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
          background: recorders.length == 0 ? theme.palette.grey[100]
            : healthPercentage == 0 ? theme.palette.error.light
              : theme.palette.grey[100],
        }
      }
    },
    theme: {
      mode: theme.palette.mode
    }
  };

  const chartSeries = [healthPercentage];

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

VideoRecorderDeviceCondition.getLayout = (page) => (
  <AuthGuard>
    <Head>
      <script src="/static/sdk/codebase/jquery-1.12.1.min.js"></script>
      <script src="/static/sdk/codebase/encryption/AES.js"></script>
      <script src="/static/sdk/codebase/encryption/cryptico.min.js"></script>
      <script src="/static/sdk/codebase/encryption/crypto-3.1.2.min.js"></script>
      <script id="videonode" src="/static/sdk/codebase/webVideoCtrl.js"></script>
    </Head>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default VideoRecorderDeviceCondition;