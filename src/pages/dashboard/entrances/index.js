import { Add, Delete, DoorFront, Edit, HelpOutline, LockOpen } from "@mui/icons-material";
import { Box, Button, Card, Container, Divider, Grid, InputAdornment, MenuItem, TextField, Tooltip, Typography } from "@mui/material";
import Head from "next/head";
import NextLink from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import entranceApi from "../../../api/entrance";
import accessGroupEntrance from "../../../api/access-group-entrance-n-to-n";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import StyledMenu from "../../../components/dashboard/styled-menu";
import { useMounted } from "../../../hooks/use-mounted";
import { ChevronDown } from "../../../icons/chevron-down";
import { gtm } from "../../../lib/gtm";
import { Upload } from "../../../icons/upload"; 
import { Download } from "../../../icons/download";
import { Search } from "../../../icons/search";
import EntranceListTable from "../../../components/dashboard/entrances/list/entrance-list-table";
import { applyPagination, createFilter } from "../../../utils/list-utils";
import ConfirmStatusUpdate from "../../../components/dashboard/entrances/list/confirm-status-update";
import ConfirmUnlock from "../../../components/dashboard/entrances/list/confirm-unlock";
import { Confirmdelete } from "../../../components/dashboard/entrances/confirm-delete";
import { filterEntranceByStringPlaceholder, filterEntranceByStatus, filterEntranceByCurrStatus, filterEntranceByString, entranceCreateLink, getEntranceIdsEditLink } from "../../../utils/entrance";
import { controllerApi } from "../../../api/controllers";
import { entranceScheduleApi } from "../../../api/entrance-schedule";
import { serverDownCode } from "../../../api/api-helpers";
import { ServerDownError } from "../../../components/dashboard/errors/server-down-error";
import {
    CloudDone,
    CloudOff,
} from "@mui/icons-material";

const applyFilter = createFilter({
    query: filterEntranceByString,
    status: filterEntranceByStatus,
    currStatus: filterEntranceByCurrStatus,
})

const EntranceList = () => {
    // copied
    useEffect(() => {
        gtm.push({ event: "page_view" });
    })
    
    // get entrances and access groups
    const [entrances, setEntrances] = useState([]);
    const [serverDownOpen, setServerDownOpen] = useState(false);

    const isMounted = useMounted();
    const getAccessGroupsLocal = useCallback(async(entrances) => {
        const newEntrances = [ ...entrances ]
        const resArr = await Promise.all(
            newEntrances.map(
                entrance => accessGroupEntrance.getAccessGroupWhereEntranceId(entrance.entranceId)
            )
        );
        const successArr = resArr.map(res => res.status == 200);
        const serverDownFailArr = resArr.filter(res => res.status == serverDownCode);
        if (serverDownFailArr.length > 0) {
            setServerDownOpen(true);
            toast.error("Error loading access groups info");
            return;
        }

        if(successArr.some(success => !success)) { // some res fail
            toast.error("Error loading access groups info");
        }
        const jsonArr = await Promise.all(resArr.map(res => res.json()));
        newEntrances.forEach((entrance, i) => entrance.accessGroups = successArr[i] ? jsonArr[i] : []);
        const entranceCurrentStatus = await getEntranceCurrentStatus();
        const dataWithCurrentStatus = newEntrances.map(entrance => {
            return {
                ... entrance,
                isLocked: !entranceCurrentStatus[entrance.entranceId]
            }
        });
        if (isMounted()) {
            setEntrances(dataWithCurrentStatus);
        }
    }, [isMounted]);
    const getEntranceCurrentStatus = async () => {
        const res = await entranceScheduleApi.getCurrentEntranceStatus();
        if (res.status != 200) {
            if (res.status == serverDownCode) {
                setServerDownOpen(true);
            }
            toast.error("Error loading entrance current statuses info");
            return {};
        }
        const data = await res.json();
        return data;
    };
    const getEntrancesLocal = useCallback(async () => {
        const res = await entranceApi.getEntrances();
        if (res.status != 200) {
            if (res.status == serverDownCode) {
                setServerDownOpen(true);
            }
            toast.error("Error loading entrances info");
            setEntrances([]);
            return [];
        }
        const data = await res.json();
        const entranceCurrentStatus = await getEntranceCurrentStatus();
        const dataWithCurrentStatus = data.map(entrance => {
            return {
                ... entrance,
                isLocked: !entranceCurrentStatus[entrance.entranceId]
            }
        });
        if (isMounted()) {
            setEntrances(dataWithCurrentStatus);
        }
        return data;
    }, [isMounted]);
    const [entranceSchedules, setEntranceSchedules] = useState({}); // map entranceId to number of schedules
    const getEntranceSchedules = async() => {
        try {
            const res = await entranceScheduleApi.getEntranceSchedules();
            if (res.status != 200) {
                if (res.status == serverDownCode) {
                    setServerDownOpen(true);
                }
                throw 'cannot load entrance schedules'
            };
            const body = await res.json();
            const temp = {};
            body.forEach(sch => {
                temp[sch.entranceId] = (temp[sch.entranceId] || 0) + 1;
            })
            setEntranceSchedules(temp);
        } catch(e) {
            console.error(e);
            toast.error("Error loading entrance schedules");
        }
    }
    const [entranceController, setEntranceController] = useState({}); // map entranceId to controller
    const getControllers = async() => {
        try {
            const res = await controllerApi.getControllers();
            if (res.status != 200) {
                if (res.status == serverDownCode) {
                    setServerDownOpen(true);
                }
                throw 'cannot load controllers'
            };
            const body = await res.json();
            const temp = {};
            body.forEach(con => {
                const authArr = con.authDevices;
                if (Array.isArray(authArr)) {
                    authArr.forEach(auth => {
                        const entranceId = auth.entrance?.entranceId;
                        if (entranceId) temp[entranceId] = con;
                    });
                }
            });
            setEntranceController(temp);
        } catch(e) {
            console.error(e);
            toast.error("Entrance controllers failed to load");
        }
    };
    const getInfo = async() => {
        getControllers();
        getEntranceSchedules();
        getAccessGroupsLocal(await getEntrancesLocal());
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(getInfo, [])  

    // for selection of checkboxes
    const [selectedEntrances, setSelectedEntrances] = useState([]);
    const selectedAllEntrances = selectedEntrances.length == entrances.length;
    const selectedSomeEntrances = selectedEntrances.length > 0 && !selectedAllEntrances;
    const handleSelectAllEntrances = (e) => setSelectedEntrances(e.target.checked ? entrances.map(e => e.entranceId) : []);
    const handleSelectFactory = (entranceId) => () => {
        if (selectedEntrances.includes(entranceId)) {
            setSelectedEntrances(selectedEntrances.filter(id => id !== entranceId));
        } else {
            setSelectedEntrances([ ...selectedEntrances, entranceId ]);
        }
    }
     // for actions button
    const [actionAnchor, setActionAnchor] = useState(null);
    const open = Boolean(actionAnchor);
    const handleActionClick = (e) => setActionAnchor(e.currentTarget);
    const handleActionClose = () => setActionAnchor(null);
    const actionDisabled = selectedEntrances.length == 0;
    
    // for filtering
    const [filters, setFilters] = useState({
        query: "",
        status: null,
        currStatus: null
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

    // status filter
    const handleCurrentStatusSelect = (i) => {
        const currStatus = i == -1 ? null : i == 1;
        setFilters((prevState) => ({
            ...prevState,
            currStatus: currStatus
        }));
    }
    const filteredEntrances = applyFilter(entrances, filters);


    // for pagination
    const [page, setPage] = useState(0);
    const handlePageChange = (e, newPage) => setPage(newPage);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const handleRowsPerPageChange = (e) => setRowsPerPage(parseInt(e.target.value, 10));
    const paginatedEntrances = applyPagination(filteredEntrances, page, rowsPerPage);


    // for updating status
    const [statusUpdateIds, setStatusUpdateIds] = useState([]);
    const [updateStatus, setUpdateStatus] = useState(null);
    const [openUnlockDialog, setOpenUnlockDialog] = useState(false);
    const [statusUpdateDialogOpen, setStatusUpdateDialogOpen] = useState(false);
    const openStatusUpdateDialog = (entranceIds, updatedStatus) => {
        setStatusUpdateIds(entranceIds);
        setUpdateStatus(updatedStatus);
        setStatusUpdateDialogOpen(true);
    }
    const openUnlockDialogFunc = (entranceIds) => {
        setStatusUpdateIds(entranceIds);
        setOpenUnlockDialog(true);
    }
    const handleUnlockDialogClose = () => {
        setOpenUnlockDialog(false);
        handleActionClose();
    }
    const handleStatusUpdateDialogClose = () => {
        setStatusUpdateDialogOpen(false);
        handleActionClose();
    }
    const handleMultipleActivationUpdate = (updateStatus) => openStatusUpdateDialog([...selectedEntrances], updateStatus);
    const handleMultipleUnlock = () => openUnlockDialogFunc([...selectedEntrances]);
    const handleMultiEnable = () => handleMultipleActivationUpdate(true);
    const handleMultiDisable = () => handleMultipleActivationUpdate(false);
    const handleMultiUnlock = () => handleMultipleUnlock();
    const handleUnlockApiCall= async (entranceIds) => {
        handleStatusUpdateDialogClose();

        const resArr = await Promise.all(entranceIds.map(entranceId => entranceApi.manuallyUnlockEntrance(entranceId)));
        
        let successCount = 0;
        const someFailed = false;
        resArr.forEach(res => {
            if (res.status == 200) {
                successCount++;
            } else {
                someFailed = true;
            }
        })

        if (someFailed) { toast.error("Failed to unlock some entrances"); }
        if (successCount) { toast.success("Successfully unlock " + (successCount > 1 ? successCount + " entrances" : "1 entrance")); }
    }

    const handleStatusUpdate = async (entranceIds, updatedStatus) => {
        handleStatusUpdateDialogClose();

        const resArr = await Promise.all(entranceIds.map(entranceId => entranceApi.updateEntranceActiveStatus(entranceId, updatedStatus)));
        
        let successCount = 0;
        const someFailed = false;
        resArr.forEach(res => {
            if (res.status == 200) {
                successCount++;
            } else {
                someFailed = true;
            }
        })

        if (someFailed) { toast.error("Failed to " + (updatedStatus ? "activate" : "deactivate") + " some entrances"); }
        if (successCount) { toast.success("Successfully " + (updatedStatus ? "activated" : "deactivate") + " " + (successCount > 1 ? successCount + " entrances" : "1 entrance")); }

        const newEntrances = [ ...entrances ];
        newEntrances.forEach(entrance => {
            if (entranceIds.includes(entrance.entranceId)) {
                //TODO: look into this logic again, I believe regardless of whether this is successful or not, it will be updated
                entrance.isActive = updatedStatus;
            }
        })
        setEntrances(newEntrances);
    }

    //for delete action button
	const [deleteOpen, setDeleteOpen] = useState(false);  
	
	//Set to true if an entrance is selected. controls form input visibility.
	const [selectedState, setselectedState] = useState(false);
	const checkSelected = () => {
	  if(selectedEntrances.length>=1){
		 setselectedState(true)
	  }
	};
	useEffect(() => {
		checkSelected()
	}, [selectedEntrances]);
	

	const handleDeleteOpen = () => {        
		setDeleteOpen(true);           
	};
	const handleDeleteClose = () => {
		setDeleteOpen(false);
	}
	const deleteEntrances = async(e) => {
        e.preventDefault();
		Promise.all(selectedEntrances.map(id=>{
			return entranceApi.deleteEntrance(id)
		})).then( resArr => {
			resArr.filter(res=>{
				if(res.status == 204){
					toast.success('Delete success',{duration:2000},);
				}
				else{
					toast.error('Delete unsuccessful' )
				}
			})
			getEntrancesLocal();
		})
		setDeleteOpen(false);
	};

    // Reset selectedEntrances when entrances change
	useEffect(
		() => {
			if (selectedEntrances.length) {
				setSelectedEntrances([]);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[entrances]
	);
    

    return(
        <>
            <Head>
                <title>Etlas: Entrance List</title>
            </Head>
            <ConfirmStatusUpdate
                entranceIds={statusUpdateIds}
                open={statusUpdateDialogOpen}
                handleDialogClose={handleStatusUpdateDialogClose}
                updateStatus={updateStatus}
                handleStatusUpdate={handleStatusUpdate}
            />
            <ConfirmUnlock
                entranceIds={statusUpdateIds}
                open={openUnlockDialog}
                handleDialogClose={handleUnlockDialogClose}
                handleStatusUpdate={handleUnlockApiCall}
            />
            <ServerDownError
                open={serverDownOpen}
                handleDialogClose={() => setServerDownOpen(false)}
            />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py:8
                }}
            >
                <Container maxWidth="xl">
                    <Box sx={{ mb: 4 }}>
                        <Grid container
                                justifyContent="space-between"
                                spacing={3}>
                            <Grid item
                                sx={{ m: 2.5 }}>
                                <Typography variant="h4">Entrances</Typography>    
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
                                    <NextLink href={entranceCreateLink}
                                        passHref>
                                        <MenuItem disableRipple>
                                            <Add />
                                            &#8288;Create
                                        </MenuItem>
                                    </NextLink>
                                    <NextLink href={getEntranceIdsEditLink(selectedEntrances)}
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
                                        selectedEntrances={selectedEntrances}
                                        deleteEntrances={deleteEntrances}
                                    />    
                                    <MenuItem 
                                        disableRipple
                                        onClick={handleMultiEnable}
                                        disabled={actionDisabled}
                                    >
                                        <CloudDone />
                                        &#8288;Activate
                                    </MenuItem>
                                    <MenuItem 
                                        disableRipple
                                        onClick={handleMultiDisable}
                                        disabled={actionDisabled}
                                    >
                                        <CloudOff />
                                        &#8288;De-Activate
                                    </MenuItem>
                                    <MenuItem 
                                        disableRipple
                                        onClick={handleMultiUnlock}
                                        disabled={actionDisabled}
                                    >
                                        <LockOpen />
                                        &#8288;Manually Unlock
                                    </MenuItem>
                                </StyledMenu>
                            </Grid> 
                        </Grid>
                        {/* <Box
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
                                title="Excel template can be found at {}"
                                enterTouchDelay={0}
                                placement="top"
                                sx={{
                                    m: -0.5,
                                    mt: 3
                                }}>
                                <HelpOutline />
                            </Tooltip>
                        </Box> */}
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
                                    placeholder={filterEntranceByStringPlaceholder}
                                />                                   
                            </Box>
                        </Box>
                        <EntranceListTable 
                            entrances={paginatedEntrances}
                            selectedAllEntrances={selectedAllEntrances}
                            selectedSomeEntrances={selectedSomeEntrances}
                            handleSelectAllEntrances={handleSelectAllEntrances}
                            handleSelectFactory={handleSelectFactory}
                            selectedEntrances={selectedEntrances}
                            entranceCount={filteredEntrances.length}
                            onPageChange={handlePageChange}
                            onRowsPerPageChange={handleRowsPerPageChange}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            handleStatusSelect={handleStatusSelect}
                            handleCurrentStatusSelect={handleCurrentStatusSelect}
                            openStatusUpdateDialog={openStatusUpdateDialog}
                            openUnlockDialog={openUnlockDialogFunc}
                            entranceSchedules={entranceSchedules}
                            entranceController={entranceController}
                        />
                    </Card>
                </Container>    
            </Box>
        </>
    )
}

EntranceList.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>{page}</DashboardLayout>
    </AuthGuard>
);

export default EntranceList;