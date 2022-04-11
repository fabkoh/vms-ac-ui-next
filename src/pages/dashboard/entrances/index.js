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
import { Confirmdelete } from "../../../components/dashboard/entrances/confirm-delete";
import { filterEntranceByStringPlaceholder, filterEntranceByStatus, filterEntranceByString, entranceCreateLink, getEntranceIdsEditLink } from "../../../utils/entrance";

const applyFilter = createFilter({
    query: filterEntranceByString,
    status: filterEntranceByStatus
})

const EntranceList = () => {
    // copied
    useEffect(() => {
        gtm.push({ event: "page_view" });
    })
    
    // get entrances and access groups
    const [entrances, setEntrances] = useState([]);
    const isMounted = useMounted();
    const getAccessGroupsLocal = useCallback(async(entrances) => {
        const newEntrances = [ ...entrances ]
        const resArr = await Promise.all(
            newEntrances.map(
                entrance => accessGroupEntrance.getAccessGroupWhereEntranceId(entrance.entranceId)
            )
        );
        const successArr = resArr.map(res => res.status == 200);
        if(successArr.some(success => !success)) { // some res fail
            toast.error("Access groups info failed to load");
        }
        const jsonArr = await Promise.all(resArr.map(res => res.json()));
        newEntrances.forEach((entrance, i) => entrance.accessGroups = successArr[i] ? jsonArr[i] : []);
        if (isMounted()) {
            setEntrances(newEntrances);
        }
    }, [isMounted]);
    const getEntrancesLocal = useCallback(async () => {
        const res = await entranceApi.getEntrances();
        if (res.status != 200) {
            toast.error("Entrances info failed to load");
            return [];
        }
        const data = await res.json();
        if (isMounted()) {
            setEntrances(data);
        }
        return data;
    }, [isMounted]);
    //eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(async () => getAccessGroupsLocal(await getEntrancesLocal()), [])  

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
    const [statusUpdateDialogOpen, setStatusUpdateDialogOpen] = useState(false);
    const openStatusUpdateDialog = (entranceIds, updatedStatus) => {
        setStatusUpdateIds(entranceIds);
        setUpdateStatus(updatedStatus);
        setStatusUpdateDialogOpen(true);
    }
    const handleStatusUpdateDialogClose = () => {
        setStatusUpdateDialogOpen(false);
        handleActionClose();
    }
    const handleMultipleUpdate = (updateStatus) => openStatusUpdateDialog([ ...selectedEntrances ], updateStatus);
    const handleMultiEnable = () => handleMultipleUpdate(true);
    const handleMultiUnlock = () => handleMultipleUpdate(false);
    const handleStatusUpdate = async (entranceIds, updatedStatus) => {
        handleStatusUpdateDialogClose();

        const resArr = await Promise.all(entranceIds.map(entranceId => entranceApi.updateEntranceStatus(entranceId, updatedStatus)));
        
        let successCount = 0;
        const someFailed = false;
        resArr.forEach(res => {
            if (res.status == 200) {
                successCount++;
            } else {
                someFailed = true;
            }
        })

        if (someFailed) { toast.error("Failed to " + (updatedStatus ? "activate" : "unlock") + " some entrances"); }
        if (successCount) { toast.success("Successfully " + (updatedStatus ? "activated" : "unlocked") + " " + (successCount > 1 ? successCount + " entrances" : "1 entrance")); }

        const newEntrances = [ ...entrances ];
        newEntrances.forEach(entrance => {
            if (entranceIds.includes(entrance.entranceId)) {
                entrance.isActive = updatedStatus;
            }
        })
        setEntrances(newEntrances);
    }

    //for delete action button
	const [deleteOpen, setDeleteOpen] = useState(false);  
	const [text, setText] = useState("");
	const [deleteBlock, setDeleteBlock] = useState(true);
	const handleTextChange = (e) => {
		setText(e.target.value);
	};
	useEffect(() => {
	//  console.log(text); 
	 (text=='DELETE')? setDeleteBlock(false):setDeleteBlock(true)
	});
	
	//Set to true if an access group is selected. controls form input visibility.
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
        setText("");
		setDeleteOpen(false);
	}
	const handleDeleteAction = () => {
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
        setText("");
	};

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
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py:8
                }}
            >
                <Container maxWidth="xl">
                    <Box sx={{ mb: 4 }}>
                        <Grid container justifyContent="space-between" spacing={3}>
                            <Grid item sx={{ m: 2.5 }}>
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
                                    <NextLink href={entranceCreateLink} passHref>
                                        <MenuItem disableRipple>
                                            <Add />
                                            &#8288;Create
                                        </MenuItem>
                                    </NextLink>
                                    <NextLink href={getEntranceIdsEditLink(selectedEntrances)} passHref>    
                                        <MenuItem disableRipple disabled={actionDisabled}>
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
                                                selectedState={selectedState}
                                        		setActionAnchor={setActionAnchor}
                                                deleteOpen={deleteOpen} 
                                                handleDeleteClose={handleDeleteClose}
                                                handleDeleteAction={handleDeleteAction}
                                                handleDeleteOpen={handleDeleteOpen}
                                                selectedAccessGroup={selectedEntrances}
                                                handleTextChange={handleTextChange}
                                                deleteBlock={deleteBlock}
                                        />    
                                    <MenuItem 
                                        disableRipple
                                        onClick={handleMultiEnable}
                                        disabled={actionDisabled}
                                    >
                                        <DoorFront />
                                        &#8288;Activate
                                    </MenuItem>
                                    <MenuItem 
                                        disableRipple
                                        onClick={handleMultiUnlock}
                                        disabled={actionDisabled}
                                    >
                                        <LockOpen />
                                        &#8288;Unlock
                                    </MenuItem>
                                </StyledMenu>
                            </Grid> 
                        </Grid>
                        <Box
                            sx={{
                                m: -1,
                                mt: 3
                            }}
                        >
                            <Button startIcon={<Upload fontSize="small" />} sx={{ m: 1 }}>Import</Button>    
                            <Button startIcon={<Download fontSize="small" />} sx={{ m: 1 }}>Export</Button>
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
                                component="form"
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
                            openStatusUpdateDialog={openStatusUpdateDialog}
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