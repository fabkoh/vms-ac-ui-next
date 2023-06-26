import { useCallback, useEffect, useState } from "react";
import { useMounted } from "../../../../hooks/use-mounted";
import { gtm } from "../../../../lib/gtm";
import accessGroupEntranceApi from "../../../../api/access-group-entrance-n-to-n";
import entranceApi from "../../../../api/entrance";
import NextLink from "next/link";
import Head from "next/head";
import router from "next/router";
import {
  Box,
  Grid,
  MenuItem,
  Typography,
  Container,
  Link,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ChevronDown } from "../../../../icons/chevron-down";
import StyledMenu from "../../../../components/dashboard/styled-menu";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { EntranceBasicDetails } from "../../../../components/dashboard/entrances/details/entrance-basic-details";
import toast from "react-hot-toast";
import { Confirmdelete } from "../../../../components/dashboard/video-recorders/confirm-delete";
import { set } from "date-fns";
import AccessGroupDetails from "../../../../components/dashboard/entrances/details/entrance-access-group-details";
import { BuildCircle, DoorFront, LockOpen, Refresh } from "@mui/icons-material";
import ConfirmStatusUpdate from "../../../../components/dashboard/entrances/list/confirm-status-update";
import {
  entranceCreateLink,
  entranceListLink,
  getEntranceEditLink,
} from "../../../../utils/entrance";
import EntranceSchedules from "../../../../components/dashboard/entrances/details/entrance-schedules";
import { entranceScheduleApi } from "../../../../api/entrance-schedule";
import { getEntranceScheduleEditLink } from "../../../../utils/entrance-schedule";
import videoRecorderApi from "../../../../api/videorecorder";
import { VideoRecorderBasicDetails } from "../../../../components/dashboard/video-recorders/details/video-recorder-basic-details";
import {
  getVideoRecorderEditLink,
  getVideoRecorderListLink,
  videoRecorderListLink,
} from "../../../../utils/video-recorder";
import { VideoRecorderCameras } from "../../../../components/dashboard/video-recorders/details/video-recorder-cameras";
import { ServerDownError } from "../../../../components/dashboard/errors/server-down-error";
import { serverDownCode } from "../../../../api/api-helpers";

const VideoRecorderDetails = () => {
  const isMounted = useMounted();
  const [entrance, setEntrance] = useState(null);
  const { recorderId } = router.query;
  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const [videoRecorderInfo, setVideoRecorderInfo] = useState(null);
  const [loadedSDK, setLoadedSDK] = useState(false);
  const [authStatus, setAuthStatus] = useState({});
  const [sdkHandle, setSDKHandle] = useState(null);
  const [serverDownOpen, setServerDownOpen] = useState(false);

  const [count, setCount] = useState(0);

  const get_sdk_handle = async function () {
    while (true) {
      if (window.WebVideoCtrl && window.jQuery) {
        console.log("sdk loaded");
        return window.WebVideoCtrl;
      }
      console.log("sdk outside");
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  };

  const attach_sdk = async function (handle) {
    return await new Promise((resolve, reject) => {
      handle.I_InitPlugin(500, 300, {
        bWndFull: true,
        iPackageType: 2,
        iWndowType: 1,
        bNoPlugin: true,
        cbSelWnd: function (xmlDoc) {},
        cbDoubleClickWnd: function (iWndIndex, bFullScreen) {},
        cbEvent: function (iEventType, iParam1, iParam2) {},
        cbRemoteConfig: function () {},
        cbInitPluginComplete: function () {
          try {
            resolve();
          } catch (ex) {
            console.warn("Failed to inject plugin");
            reject();
          }
        },
      });
    });
  };

  const login_sdk = async function (handle, { ip, port, username, password }) {
    console.log(ip);
    console.log(port);
    return await new Promise((resolve, reject) => {
      handle.I_Login(ip, 2, port, username, password, {
        success: function (xmlDoc) {
          resolve();
          console.log("success");
        },
        error: function (status, xmlDoc) {
          reject();
          alert("login failed");
          console.log("failure");
          console.log("Status Code:", status);
          console.log("XML response:", xmlDoc);
        },
      });
    });
  };

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
              firmware_version: `${xml_handle
                .find("firmwareVersion")
                .eq(0)
                .text()}  ${xml_handle
                .find("firmwareReleasedDate")
                .eq(0)
                .text()}`,
              encoder_version: `${xml_handle
                .find("encoderVersion")
                .eq(0)
                .text()}  ${xml_handle
                .find("encoderReleasedDate")
                .eq(0)
                .text()}`,
            });
          },
          error: function (status, xmlDoc) {
            reject();
          },
        });
      } catch (ex) {}
    });
  };

  const get_analogue_channels = async function (handle, { ip }) {
    return await new Promise((resolve, reject) => {
      handle.I_GetAnalogChannelInfo(ip, {
        async: false,
        success: function (xmlDoc) {
          const channels = [];

          $.each($(xmlDoc).find("VideoInputChannel"), function (i) {
            channels.push({
              id: $(this).find("id").eq(0).text(),
              name: $(this).find("name").eq(0).text(),
            });
          });

          resolve(channels);
        },
        error: function (status, xmlDoc) {
          reject();
        },
      });
    });
  };

  const get_digital_channels = async function (handle, { ip }) {
    return await new Promise((resolve, reject) => {
      handle.I_GetDigitalChannelInfo(ip, {
        async: false,
        success: function (xmlDoc) {
          const channels = [];

          $.each($(xmlDoc).find("InputProxyChannelStatus"), function (i) {
            setCount((prev) => prev + 1);
            channels.push({
              id: $(this).find("id").eq(0).text(),
              name: $(this).find("name").eq(0).text(),
              online:
                $(this).find("online").eq(0).text().toLowerCase() === "true",
              ip: $(this).find("ipAddress").eq(0).text(),
            });
          });

          resolve(channels);
        },
        error: function (status, xmlDoc) {
          reject();
        },
      });
    });
  };

  const convert_DNS_sdk = async function(handle, {ip, port, device_serial_number}) {
    return await new Promise((resolve, reject) => {
        handle.I_GetIPInfoByMode(0, ip, port, device_serial_number, {
          success: function(ipInfo) {
              resolve(ipInfo);
          },
          error: function() {
              reject("Failed to get IP info");
          }
      });
    });
}

  const getVideoRecorder = async (recorderId) => {
    try {
      Promise.resolve(videoRecorderApi.getRecorder(recorderId)).then(
        async (res) => {
          if (res.status == 200) {
            const data = await res.json();
            // console.log(data);
            setVideoRecorderInfo(data);
            if (!loadedSDK) {
              const sdk_handle = await get_sdk_handle();
              setSDKHandle(sdk_handle);
              console.log("sdk set");

              await attach_sdk(sdk_handle);
              console.log("sdk attached");
              console.log("Login");

              const login = await login_sdk(sdk_handle, {
                ip: data.recorderPublicIp,
                port: data.recorderPortNumber,
                username: data.recorderUsername,
                password: data.recorderPassword,
              });

              const device_info = await get_device_info(sdk_handle, {
                ip: data.recorderPublicIp,
              });

              for (const key of Object.keys(device_info)) {
                data[key] = device_info[key];
              }

              const analogue_channels = await get_analogue_channels(
                sdk_handle,
                {
                  ip: data.recorderPublicIp,
                }
              );

              const digital_channels = await get_digital_channels(sdk_handle, {
                ip: data.recorderPublicIp,
              });

              data.cameras = digital_channels;
              data.recorderSerialNumber = device_info["serial_number"];
              videoRecorderApi.updateRecorder(data);

              setVideoRecorderInfo({ ...data });

              setLoadedSDK(true);
            }

            //setControllerInfo(data)
          } else {
            if (res.status == serverDownCode) {
              setServerDownOpen(true);
            }
            toast.error("Video Recorder info not found");
            //router.replace(getControllerListLink())
          }
        }
      );
    } catch (err) {}
  };

  const getInfo = useCallback(async () => {
    getVideoRecorder(recorderId);
  }, [isMounted]);

  const refresh = async () => {
    window.location.reload(true);
  };

  useEffect(
    () => {
      getInfo();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [actionAnchor, setActionAnchor] = useState(null);
  const open = Boolean(actionAnchor);
  const handleActionClick = (e) => {
    setActionAnchor(e.currentTarget);
  };
  const handleActionClose = () => {
    setActionAnchor(null);
  };

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedState, setselectedState] = useState(false);
  const checkSelected = () => {
    setselectedState(true);
  };
  useEffect(() => {
    checkSelected();
  });

  const handleDeleteOpen = () => {
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => {
    setDeleteOpen(false);
  };

  const deleteVideoRecorder = async () => {
    toast.loading("Deleting Controller...");
    videoRecorderApi.deleteRecorder(recorderId).then(async (res) => {
      toast.dismiss();

      if (res.status != 200) {
        toast.error("Delete unsuccessful", { duration: 3000 });
      } else {
        toast.success("Delete success");
        router.replace(videoRecorderListLink);
      }
    });
    setDeleteOpen(false);
  };

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <ServerDownError
          open={serverDownOpen}
          handleCloseDialog={() => setServerDownOpen(false)}
        />
        <Container maxWidth="md">
          <div>
            <Box sx={{ mb: 4 }}>
              <NextLink href={"/dashboard/video-recorders"} passHref>
                <Link
                  color="textPrimary"
                  component="a"
                  sx={{
                    alignItems: "center",
                    display: "flex",
                  }}
                  onClick={() => {
                    window.location.href = `/dashboard/video-recorders`;
                  }}
                >
                  <ArrowBackIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2">Video Recorders</Typography>
                </Link>
              </NextLink>
            </Box>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid
                item
                sx={{
                  alignItems: "center",
                  display: "flex",
                  overflow: "hidden",
                }}
              >
                <div>
                  <Typography variant="h4">
                    {videoRecorderInfo
                      ? videoRecorderInfo.recorderName
                      : "Video Recorder Not Found"}
                  </Typography>
                </div>
              </Grid>
              <Grid item sx={{ m: -1 }}>
                <Button
                  variant="contained" // add refresh fn here. refetch or refresh entire page?
                  sx={{ m: 1 }}
                  onClick={refresh}
                  endIcon={<Refresh fontSize="small" />}
                >
                  Refresh
                </Button>
                <Button
                  endIcon={<ChevronDown fontSize="small" />}
                  sx={{ m: 1 }}
                  variant="contained"
                  onClick={handleActionClick}
                >
                  Actions
                </Button>
                <StyledMenu
                  anchorEl={actionAnchor}
                  open={open}
                  onClose={handleActionClose}
                >
                  <NextLink
                    href={getVideoRecorderEditLink(
                      videoRecorderInfo ? videoRecorderInfo.recorderId : null
                    )}
                    passHref
                  >
                    <MenuItem disableRipple>
                      <EditIcon />
                      &#8288;Edit
                    </MenuItem>
                  </NextLink>
                  <MenuItem disableRipple onClick={handleDeleteOpen}>
                    <DeleteIcon />
                    &#8288;Delete
                  </MenuItem>
                  <Confirmdelete
                    setActionAnchor={setActionAnchor}
                    open={deleteOpen}
                    handleDialogClose={handleDeleteClose}
                    deleteRecorders={deleteVideoRecorder}
                  />
                </StyledMenu>
              </Grid>
            </Grid>
          </div>
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <VideoRecorderBasicDetails
                  recorder={videoRecorderInfo}
                  count={count}
                />
              </Grid>

              <Grid item xs={12}>
                <VideoRecorderCameras
                  recorderId={recorderId}
                  recorder={videoRecorderInfo}
                  cameras={videoRecorderInfo?.cameras}
                />
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </>
  );
};

VideoRecorderDetails.getLayout = (page) => (
  <AuthGuard>
    <Head>
      <title>Etlas: Video Recorder Details</title>
      <script src="/static/sdk/codebase/jquery-1.12.1.min.js"></script>
      <script src="/static/sdk/codebase/encryption/AES.js"></script>
      <script src="/static/sdk/codebase/encryption/cryptico.min.js"></script>
      <script src="/static/sdk/codebase/encryption/crypto-3.1.2.min.js"></script>
      <script
        id="videonode"
        src="/static/sdk/codebase/webVideoCtrl.js"
      ></script>
    </Head>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default VideoRecorderDetails;
