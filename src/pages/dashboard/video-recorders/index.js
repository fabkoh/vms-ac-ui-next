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
import { filterVideoByStringPlaceholder, videoRecorderCreateLink, filterRecorderByString, getVideoRecorderIdsEditLink, filterRecorderByStatus } from "../../../utils/video-recorder";
<<<<<<< HEAD
=======
import Script from 'next/script'
>>>>>>> 4845b6f844cd459845023c6646fd82ec2b60981e
const applyFilter = createFilter({
    query: filterRecorderByString,
    status: filterRecorderByStatus
})

<<<<<<< HEAD
const RecorderList = () => {
=======
const EntranceList = () => {
>>>>>>> 4845b6f844cd459845023c6646fd82ec2b60981e
    // copied
    useEffect(() => {
        gtm.push({ event: "page_view" });
    })
    
    // get entrances and access groups
    const [recorders, setRecorders] = useState([]);
    const isMounted = useMounted();

    const getRecordersLocal = useCallback(async () => {
        const res = await videoRecorderApi.getRecorders();
        if (res.status != 200) {
            toast.error("Recorders info failed to load");
            return [];
        }
        const data = await res.json();
        if (isMounted()) {
            //TODO: ping isActive to get the actual status
            setRecorders(data.map((recorder) => { return { ...recorder, isActive: false } }));
        }
        return data;
    }, [isMounted]);

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
	useEffect(
		() => {
			if (selectedRecorders.length) {
				setSelectedRecorders([]);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[recorders]
    );
    
    useEffect(() => getRecordersLocal(), [getRecordersLocal]);

    return(
        <>
            <Head>
                <title>Etlas: Video Recorder List</title>
            </Head>
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
                                    <NextLink href={getVideoRecorderIdsEditLink(selectedRecorders)}
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
                        />
                    </Card>
                </Container>    
            </Box>
        </>
    )
}

<<<<<<< HEAD
RecorderList.getLayout = (page) => (
    <AuthGuard>
=======
EntranceList.getLayout = (page) => (
    <AuthGuard>
        <Head>
            <script src="/static/sdk/codebase/encryption/AES.js"></script>
                <script src="/static/sdk/codebase/encryption/cryptico.min.js"></script>
                <script src="/static/sdk/codebase/encryption/crypto-3.1.2.min.js"></script>
                <script id="videonode" src="/static/sdk/codebase/webVideoCtrl.js"></script>
        </Head>
>>>>>>> 4845b6f844cd459845023c6646fd82ec2b60981e
        <DashboardLayout>{page}</DashboardLayout>
    </AuthGuard>
);

<<<<<<< HEAD
export default RecorderList;
=======
export default EntranceList;
>>>>>>> 4845b6f844cd459845023c6646fd82ec2b60981e
