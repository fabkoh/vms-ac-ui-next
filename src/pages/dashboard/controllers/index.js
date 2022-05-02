import { BuildCircle, Delete, HelpOutline, Refresh, Search } from "@mui/icons-material";
import { Box, Button, Card, Container, Divider, Grid, IconButton, InputAdornment, MenuItem, TextField, Tooltip, Typography } from "@mui/material";
import Head from "next/head"
import { useRef, useState, useEffect } from "react";
import { AuthGuard } from "../../../components/authentication/auth-guard"
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout"
import StyledMenu from "../../../components/dashboard/styled-menu";
import { ChevronDown } from "../../../icons/chevron-down";
import { Upload } from "../../../icons/upload"; 
import { Download } from "../../../icons/download";
import ControllerListTable from "../../../components/dashboard/controllers/list/controller-list";
import { applyPagination, createFilter } from "../../../utils/list-utils";
import { filterControllerByString, filterControllerByStringPlaceholder } from "../../../utils/controller";
import { Confirmdelete } from "../../../components/dashboard/controllers/confirm-delete";
import { ConfirmReset } from "../../../components/dashboard/controllers/confirm-reset";
import { controllerApi } from "../../../api/controllers";
import toast from "react-hot-toast";

const testData = [   {
    "controllerId": 5,
    "controllerIPStatic": true,
    "controllerName": "1233",
    "controllerIP": "2,",
    "controllerMAC": "2,",
    "controllerSerialNo": "1233",
    "lastOnline": "2022-04-26T12:01:38.147703",
    "pinAssignmentConfig": "testpin",
    "settingsConfig": "testsettings",
    "authDevices": [
        {
            "authDeviceId": 1,
            "authDeviceName": "Auth Device 1",
            "authDeviceDirection": "E1 IN",
            "lastOnline": null,
            "masterpin": true,
            "defaultAuthMethod": "CardAndPin",
            "entrance": null
        },
        {
            "authDeviceId": 2,
            "authDeviceName": "Auth Device 2",
            "authDeviceDirection": "E1 OUT",
            "lastOnline": null,
            "masterpin": true,
            "defaultAuthMethod": "CardAndPin",
            "entrance": null
        },
        {
            "authDeviceId": 3,
            "authDeviceName": "Auth Device 3",
            "authDeviceDirection": "E2 IN",
            "lastOnline": null,
            "masterpin": true,
            "defaultAuthMethod": "CardAndPin",
            "entrance": null
        },
        {
            "authDeviceId": 4,
            "authDeviceName": "Auth Device 4",
            "authDeviceDirection": "E2 OUT",
            "lastOnline": null,
            "masterpin": true,
            "defaultAuthMethod": "CardAndPin",
            "entrance": null
        }
    ]
}, 
{
    "controllerId": 6,
    "controllerIPStatic": true,
    "controllerName": "1233",
    "controllerIP": "2,",
    "controllerMAC": "2,",
    "controllerSerialNo": "1233",
    "lastOnline": "2022-04-26T12:01:38.147703",
    "pinAssignmentConfig": "testpin",
    "settingsConfig": "testsettings",
    "authDevices": [
        {
            "authDeviceId": 1,
            "authDeviceName": "Auth Device 1",
            "authDeviceDirection": "E1 IN",
            "lastOnline": null,
            "masterpin": true,
            "defaultAuthMethod": "CardAndPin",
            "entrance": {
                "entranceId": 2,
                "entranceName": "MainDoor2",
                "entranceDesc": "123",
                "isActive": true,
                "deleted": false
            }
        },
        {
            "authDeviceId": 2,
            "authDeviceName": "Auth Device 2",
            "authDeviceDirection": "E1 OUT",
            "lastOnline": null,
            "masterpin": true,
            "defaultAuthMethod": "CardAndPin",
            "entrance": {
                "entranceId": 2,
                "entranceName": "MainDoor2",
                "entranceDesc": "123",
                "isActive": true,
                "deleted": false
            }
        },
        {
            "authDeviceId": 3,
            "authDeviceName": "Auth Device 3",
            "authDeviceDirection": "E2 IN",
            "lastOnline": null,
            "masterpin": true,
            "defaultAuthMethod": "CardAndPin",
            "entrance": null
        },
        {
            "authDeviceId": 4,
            "authDeviceName": "Auth Device 4",
            "authDeviceDirection": "E2 OUT",
            "lastOnline": null,
            "masterpin": true,
            "defaultAuthMethod": "CardAndPin",
            "entrance": null
        }
    ]}];

const applyFilter = createFilter({
    query: filterControllerByString
})

const ControllerList = () => {

    // for actions button
    const [actionAnchor, setActionAnchor] = useState(null);
    const actionOpen = Boolean(actionAnchor);
    const handleActionClick = (e) => setActionAnchor(e.currentTarget);
    const handleActionClose = () => setActionAnchor(null);

    // to change
    const controllers = testData;

    // for selection of checkboxes
    const [selectedControllers, setSelectedControllers] = useState([]); // stores the ids of selected
    const selectedAllControllers = selectedControllers.length == controllers.length;
    const selectedSomeControllers = selectedControllers.length > 0 && !selectedAllControllers;
    const handleSelectAllControllers = (e) => setSelectedControllers(e.target.checked ? controllers.map(c => c.controllerId) : []);
    const handleSelectFactory = (controllerId) => () => {
        if (selectedControllers.includes(controllerId)) {
            setSelectedControllers(selectedControllers.filter(id => id !== controllerId))
        } else {
            setSelectedControllers([ ...selectedControllers, controllerId ]);
        }
    }

    //disable action button if no controller is being selected
    const actionDisabled = selectedControllers.length == 0;

    // for filtering
    const [filters, setFilters] = useState({
        query: ""
    });
    const queryRef = useRef(null);
    const handleQueryChange = (e) => {
        e.preventDefault();
        setFilters((prevState) => ({
            ...prevState,
            query: queryRef.current?.value
        }));
    };
    const filteredControllers = applyFilter(controllers, filters);

    // for pagination
    const [page, setPage] = useState(0);
    const handlePageChange = (e, newPage) => setPage(newPage);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const handleRowsPerPageChange = (e) => setRowsPerPage(parseInt(e.target.value, 10));
    const paginatedControllers = applyPagination(filteredControllers, page, rowsPerPage);

    //for delete action button
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedState, setSelectedState] = useState(false);
    const checkSelected = () => {
        if(selectedControllers.length>=1){
           setSelectedState(true)
        }
    };
    useEffect(() => {
        checkSelected()
    }, [selectedControllers]);

    const handleDeleteOpen = () => {        
		setDeleteOpen(true);           
	};
	const handleDeleteClose = () => {
		setDeleteOpen(false);
	}
	const deleteControllers = async() => {
		Promise.all(selectedControllers.map(id=>{
			return controllerApi.deleteController(id)
		})).then( resArr => {
			resArr.filter(res=>{
				if(res.status == 204){
					toast.success('Delete success',{duration:2000},);
				}
				else{
					toast.error('Delete unsuccessful' )
				}
			})
			getInfo();
		})
		setDeleteOpen(false);
	};
    
    // Reset selectedControllers when controllers change
	useEffect(
		() => {
			if (selectedControllers.length) {
				setSelectedControllers([]);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[controllers]
	);

    //for reset controllers
    const [resetOpen, setResetOpen] = useState(false);

    const handleResetOpen = () => {        
		setResetOpen(true);           
	};
	const handleResetClose = () => {
		setResetOpen(false);
	}
	const resetControllers = async() => {
		Promise.all(selectedControllers.map(id=>{
			return controllerApi.resetController(id)
		})).then( resArr => {
			resArr.filter(res=>{
				if(res.status == 204){
					toast.success('Reset success',{duration:2000},);
				}
				else{
					toast.error('Reset unsuccessful' )
				}
			})
			getInfo();
		})
		setResetOpen(false);
	};

    return (
        <>
            <Head>
                <title>Etlas: Controller List</title>
            </Head>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8
                }}
            >
                <Container maxWidth="xl">
                    <Box sx={{ mb: 4 }}>
                        <Grid
                            container
                            justifyContent="space-between"
                            spacing={3}
                        >
                            <Grid
                                item
                                sx={{ m: 2.5 }}
                            >
                                <Typography variant="h4">Controllers</Typography>
                            </Grid>
                            <Grid item>
                                <IconButton>
                                    <Refresh />
                                </IconButton>
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
                                    open={actionOpen}
                                    onClose={handleActionClose}
                                >
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
                                        selectedControllers={selectedControllers}
                                        deleteControllers={deleteControllers}
                                    /> 

                                    <MenuItem
                                        disableRipple
                                        disabled={actionDisabled}
                                        onClick={handleResetOpen}
                                    >
                                        <BuildCircle />
                                        &#8288;Reset
                                    </MenuItem>
                                    <ConfirmReset
                                        setActionAnchor={setActionAnchor}
                                        open={resetOpen} 
                                        handleDialogClose={handleResetClose}
                                        selectedControllers={selectedControllers}
                                        resetControllers={resetControllers}
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
                            <Button
                                startIcon={<Upload fontSize="small" />}
                                sx={{ m: 1 }}
                            >
                                Import
                            </Button>
                            <Button
                                startIcon={<Download fontSize="small" />}
                                sx={{ m: 1 }}
                            >
                                Export
                            </Button>
                            <Tooltip
                                title="Excel template can be found at {}"
                                enterTouchDelay={0}
                                placement="top"
                                sx={{
                                    m: -0.5,
                                    mt: 3
                                }}
                            >
                                <HelpOutline />
                            </Tooltip>
                        </Box>
                    </Box>
                    <Card>
                        <Divider />
                        <Box 
                            sx={{
                                alignItems: 'center',
                                display: 'flex',
                                flexWrap: 'wrap',
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
                                onSubmit={(e) => e.preventDefault()}
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
                                    placeholder={filterControllerByStringPlaceholder}
                                />
                            </Box>
                        </Box>
                        <ControllerListTable 
                            controllers={filteredControllers}
                            selectedAllControllers={selectedAllControllers}
                            selectedSomeControllers={selectedSomeControllers}
                            handleSelectAllControllers={handleSelectAllControllers}
                            handleSelectFactory={handleSelectFactory}
                            selectedControllers={selectedControllers}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            onPageChange={handlePageChange}
                            onRowsPerPageChange={handleRowsPerPageChange}
                        />
                    </Card>
                </Container>
            </Box>
        </>
    );
}

ControllerList.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>{page}</DashboardLayout>
    </AuthGuard>
);

export default ControllerList;