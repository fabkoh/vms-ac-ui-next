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

const applyFilter = createFilter({
    query: filterRecorderByString,
    status: filterRecorderByStatus
})

const VideoRecorderDeviceCondition = () => {
    // copied
    useEffect(() => {
        gtm.push({ event: "page_view" });
    })

    const [serverDownOpen, setServerDownOpen] = useState(false);
    const [recorders, setRecorders] = useState([]);

    const theme = useTheme();
    const isMounted = useMounted();

    const [upCounter, setUpCounter] = useState(0);
    const [loadedSDK, setLoadedSDK] = useState(false);
    const [authStatus, setAuthStatus] = useState({});
    const [sdkHandle, setSDKHandle] = useState(null);


    // sdk 
    const get_sdk_handle = async function() {
        while (true) {
            if (window.WebVideoCtrl && window.jQuery) {
                console.log("inside sdk handle if")
                return window.WebVideoCtrl
            }
            console.log("outside")
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    const attach_sdk     = async function(handle) {
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
            // try{
                if (!loadedSDK){
                    await Promise.resolve(data.forEach(async(recorder) => { 
                        const sdk_handle        = await get_sdk_handle();
                        setSDKHandle(sdk_handle);

                        await attach_sdk(sdk_handle);

                        const login             = await login_sdk(sdk_handle, {
                            ip:         recorder.recorderPublicIp,
                            port:       recorder.recorderPortNumber,
                            username:   recorder.recorderUsername,
                            password:   recorder.recorderPassword
                        });

                        const device_info       = await get_device_info(sdk_handle, {
                            ip: recorder.recorderPublicIp
                        })

                        for (const key of Object.keys(device_info)) {
                            recorder[key] = device_info[key]
                        }

                        const analogue_channels = await get_analogue_channels(sdk_handle, {
                            ip: recorder.recorderPublicIp
                        })

                        const digital_channels  = await get_digital_channels(sdk_handle, {
                            ip: recorder.recorderPublicIp
                        })

                        // recorder = {...recorder,
                        //             "cameras":digital_channels,
                        //             "isActive":true}
                        recorder.cameras  = digital_channels;
                        recorder.recorderSerialNumber = device_info["serial_number"];
                        videoRecorderApi.updateRecorder(recorder);

                        recorder.isActive = true;
                        setRecorders([...data]);
                        
                    //return { ...recorder } 
                }))

                    
                // console.log(222,data);
                // const newData = [...data]; 
                // newData.forEach(recorder => console.log(444,recorder.device_id
                //     ));
                // setRecorders([...newData]);
                setLoadedSDK(true);
                }
            }
        
        // } catch(err){ }
        return data;
    }

    const refresh = (async() => {
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
            setSelectedRecorders([ ...selectedRecorders, recorderId ]);
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
	if(selectedRecorders.length>=1) {
		 setselectedState(true)
	  }
	}, [selectedRecorders]);
	

	const handleDeleteOpen = () => {        
		setDeleteOpen(true);           
	};
	const handleDeleteClose = () => {
		setDeleteOpen(false);
    }
    
	const deleteRecorders = async() => {
		Promise.all(selectedRecorders.map(id=>{
			return videoRecorderApi.deleteRecorder(id)
		})).then( resArr => {
			resArr.filter(res=>{
				if(res.status == 204 || res.status == 200){
					toast.success('Delete success',{duration:2000},);
				}
				else{
					toast.error('Delete unsuccessful' )
				}
			})
			getRecordersLocal();
		})
		setDeleteOpen(false);
	};

    // Reset selectedRecorders when recorders change
	// useEffect(
	// 	() => {
	// 		if (selectedRecorders.length) {
	// 			setSelectedRecorders([]);
	// 		}
	// 	},
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// 	[recorders]
    // );
    
    useEffect(() => getRecordersLocal(), [isMounted]);

    useEffect(() => {
      const getRecordersHelper = async () => {
        await getRecordersLocal();
      }
  
      getRecordersHelper();
    }, []);
  
    useEffect(() => {
      const count = async () => {
        console.log("Count is done");
        const promises = recorders.map(async (recorder) => {
          try {
            console.log("Checking recorder isActive");
            console.log(recorder.recorderId);
            console.log(recorder.isActive);
            if (isActive) {
              console.log("Recorder is active");
              setUpCounter(prevUpCounter => prevUpCounter + 1);
            }
            console.log("Checked recorder");
          } catch(e) {
              // Handle error
              console.error(e);
          }
        });
  
        await Promise.all(promises);
      }
      
      count();
    }, [recorders]);
  
  
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