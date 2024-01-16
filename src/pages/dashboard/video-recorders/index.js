import { Add, Delete, Edit, HelpOutline } from "@mui/icons-material";
import { Box, Button, Card, Container, Divider, Grid, InputAdornment, MenuItem, TextField, Tooltip, Typography } from "@mui/material";
import Head from "next/head";
import NextLink from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import videoRecorderApi from "../../../api/videorecorder";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import StyledMenu from "../../../components/dashboard/styled-menu";
import { useMounted } from "../../../hooks/use-mounted";
import { ChevronDown } from "../../../icons/chevron-down";
import { gtm } from "../../../lib/gtm";
import { Upload } from "../../../icons/upload";
import { Download } from "../../../icons/download";
import { Search } from "../../../icons/search";
import VideoListTable from "../../../components/dashboard/video-recorders/video-list-table";
import { applyPagination, createFilter } from "../../../utils/list-utils";
import { Confirmdelete } from "../../../components/dashboard/video-recorders/confirm-delete";
import { filterVideoByStringPlaceholder, videoRecorderCreateLink, filterRecorderByString, getVideoRecordersEditLink, filterRecorderByStatus } from "../../../utils/video-recorder";
import Script from 'next/script'
import { serverDownCode } from "../../../api/api-helpers";
import { ServerDownError } from "../../../components/dashboard/errors/server-down-error";

const applyFilter = createFilter({
    query: filterRecorderByString,
    status: filterRecorderByStatus
})

const RecorderList = () => {
    // copied
    useEffect(() => {
        gtm.push({ event: "page_view" });
    })

    // get entrances and access groups
    const [recorders, setRecorders] = useState([]);

    const [serverDownOpen, setServerDownOpen] = useState(false);

    const isMounted = useMounted();

    const [loadedSDK, setLoadedSDK] = useState(false)
    const [authStatus, setAuthStatus] = useState({})
    const [sdkHandle, setSDKHandle] = useState(null)


    // sdk 
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
        return await new Promise((resolve, reject) => {
            name.I_Login(ip, 2, port, username, password, {
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
                await Promise.resolve(data.forEach(async (recorder) => {
                    const sdk_handle = await get_sdk_handle();
                    setSDKHandle(sdk_handle);

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
                        timeout(3000)
                    ]).catch((error) => {
                        if (error.message === "Timeout") {
                            console.log("Login function call timed out after 3 seconds");
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

    const refresh = (async () => {
        window.location.reload(true);
    })

    // for selection of checkboxes
    const [selectedRecorders, setSelectedRecorders] = useState([]);
    const selectedAllRecorders = selectedRecorders.length == recorders.length;
    const selectedSomeRecorders = selectedRecorders.length > 0 && !selectedAllRecorders;
    const handleSelectAllRecorders = (e) => setSelectedRecorders(e.target.checked ? recorders.map(e => e.recorderId) : []);
    const handleSelectFactory = (recorderId) => () => {
        if (selectedRecorders.includes(recorderId)) {
            setSelectedRecorders(selectedRecorders.filter(id => id !== recorderId));
        } else {
            setSelectedRecorders([...selectedRecorders, recorderId]);
        }
    }

    // for actions button
    const [actionAnchor, setActionAnchor] = useState(null);
    const open = Boolean(actionAnchor);
    const handleActionClick = (e) => setActionAnchor(e.currentTarget);
    const handleActionClose = () => setActionAnchor(null);
    const actionDisabled = selectedRecorders.length == 0;

    // for filtering
    const [filters, setFilters] = useState({
        query: "",
        status: null
    })
    // query filter
    const queryRef = useRef(null);
    const handleQueryChange = (e) => {
        e.preventDefault();
        setPage(0);
        setFilters((prevState) => ({
            ...prevState,
            query: queryRef.current?.value
        }));
    }
    // status filter
    const handleStatusSelect = (i) => {
        const status = i == -1 ? null : i == 1;
        setFilters((prevState) => ({
            ...prevState,
            status: status
        }));
    }
    const filteredRecorders = applyFilter(recorders, filters);


    // for pagination
    const [page, setPage] = useState(0);
    const handlePageChange = (e, newPage) => setPage(newPage);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const handleRowsPerPageChange = (e) => setRowsPerPage(parseInt(e.target.value, 10));
    const paginatedRecorders = applyPagination(filteredRecorders, page, rowsPerPage);

    //for delete action button
    const [deleteOpen, setDeleteOpen] = useState(false);

    //Set to true if a video recorder is selected. controls form input visibility.
    //TODO: Check whether this can be removed
    const [selectedState, setselectedState] = useState(false);
    useEffect(() => {
        if (selectedRecorders.length >= 1) {
            setselectedState(true)
        }
    }, [selectedRecorders]);


    const handleDeleteOpen = () => {
        setDeleteOpen(true);
    };
    const handleDeleteClose = () => {
        setDeleteOpen(false);
    }

    const deleteRecorders = async () => {
        Promise.all(selectedRecorders.map(id => {
            return videoRecorderApi.deleteRecorder(id)
        })).then(resArr => {
            resArr.filter(res => {
                if (res.status == 204 || res.status == 200) {
                    toast.success('Delete success', { duration: 2000 },);
                }
                else {
                    toast.error('Delete unsuccessful')
                }
            })
            getRecordersLocal();
        })
        setDeleteOpen(false);
    };

    useEffect(() => getRecordersLocal(), [isMounted]);

    return (
        <>
            <Head>
                <title>Etlas: Video Recorder List</title>
            </Head>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8
                }}
            >
                <ServerDownError
                    open={serverDownOpen}
                    handleDialogClose={() => setServerDownOpen(false)}
                />
                <Container maxWidth="xl">
                    <Box sx={{ mb: 4 }}>
                        <Grid container
                            justifyContent="space-between"
                            spacing={3}>
                            <Grid item
                                sx={{ m: 2.5 }}>
                                <Typography variant="h4">Video Recorders</Typography>
                            </Grid>
                            <Grid item>
                                <Button
                                    endIcon={<ChevronDown fontSize="small" />}
                                    sx={{ m: 2 }}
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
                                    <NextLink href={videoRecorderCreateLink}
                                        passHref>
                                        <MenuItem disableRipple>
                                            <Add />
                                            &#8288;Create
                                        </MenuItem>
                                    </NextLink>
                                    <NextLink href={getVideoRecordersEditLink(selectedRecorders)}
                                        passHref>
                                        <MenuItem disableRipple
                                            disabled={actionDisabled}>
                                            <Edit />
                                            &#8288;Edit
                                        </MenuItem>
                                    </NextLink>
                                    <MenuItem
                                        disableRipple
                                        disabled={actionDisabled}
                                        onClick={handleDeleteOpen}

                                    >
                                        <Delete />
                                        &#8288;Delete
                                    </MenuItem>
                                    <Confirmdelete
                                        setActionAnchor={setActionAnchor}
                                        open={deleteOpen}
                                        handleDialogClose={handleDeleteClose}
                                        selectedEntrances={selectedRecorders}
                                        deleteRecorders={deleteRecorders}
                                    />
                                </StyledMenu>
                            </Grid>
                        </Grid>
                        <Box
                            sx={{
                                m: -1,
                                mt: 3
                            }}
                        >
                            <Button startIcon={<Upload fontSize="small" />}
                                sx={{ m: 1 }}>Import</Button>
                            <Button startIcon={<Download fontSize="small" />}
                                sx={{ m: 1 }}>Export</Button>
                            <Tooltip
                                title="Excel template can be found in our documentation"
                                enterTouchDelay={0}
                                placement="top"
                                sx={{
                                    m: -0.5,
                                    mt: 3
                                }}>
                                <HelpOutline />
                            </Tooltip>
                        </Box>
                    </Box>
                    <Card>
                        <Divider />
                        <Box
                            sx={{
                                alignItems: "center",
                                display: "flex",
                                flexWrap: "wrap",
                                m: -1.5,
                                p: 3
                            }}
                        >
                            <Box
                                onChange={handleQueryChange}
                                sx={{
                                    flexGrow: 1,
                                    m: 1.5
                                }}
                            >
                                <TextField
                                    defaultValue=""
                                    fullWidth
                                    inputProps={{
                                        ref: queryRef
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search fontSize="small" />
                                            </InputAdornment>
                                        )
                                    }}
                                    placeholder={filterVideoByStringPlaceholder}
                                />
                            </Box>
                        </Box>
                        <VideoListTable
                            key={recorders.toString()}
                            videoRecorders={paginatedRecorders}
                            selectedAllVideoRecorders={selectedAllRecorders}
                            selectedSomeVideoRecorders={selectedSomeRecorders}
                            handleSelectAllVideoRecorders={handleSelectAllRecorders}
                            handleSelectFactory={handleSelectFactory}
                            selectedVideoRecorders={selectedRecorders}
                            videoRecorderCount={filteredRecorders.length}
                            onPageChange={handlePageChange}
                            onRowsPerPageChange={handleRowsPerPageChange}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            handleStatusSelect={handleStatusSelect}
                            getRecordersLocal={getRecordersLocal}
                        />
                    </Card>
                </Container>
            </Box>
        </>
    )
}

RecorderList.getLayout = (page) => (
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

export default RecorderList;