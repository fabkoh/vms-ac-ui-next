import * as React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import Head from "next/head";
import NextLink from "next/link";
import router, { useRouter } from "next/router";
import {
	Box,
	Button,
	Card,
	Container,
	Divider,
	Grid,
	InputAdornment,
	MenuItem,
	Tab,
	Tabs,
	TextField,
	Typography,
} from "@mui/material";

import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { AccessGroupListTable } from "../../../components/dashboard/access-groups/access-group-list-table";
import { useMounted } from "../../../hooks/use-mounted";
import { Download as DownloadIcon } from "../../../icons/download";
import { Plus as PlusIcon } from "../../../icons/plus";
import { Search as SearchIcon } from "../../../icons/search";
import { Upload as UploadIcon } from "../../../icons/upload";
import { gtm } from "../../../lib/gtm";
import StyledMenu from "../../../components/dashboard/styled-menu";
import { ChevronDown as ChevronDownIcon } from "../../../icons/chevron-down";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { accessGroupApi } from "../../../api/access-groups";
import { accessGroupScheduleApi } from "../../../api/access-group-schedules";
import accessGroupEntranceApi from "../../../api/access-group-entrance-n-to-n";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Tooltip from '@mui/material/Tooltip'
import toast from "react-hot-toast";
import {
    CloudDone,
    CloudOff,
} from "@mui/icons-material";
import { Confirmdelete } from "../../../components/dashboard/access-groups/confirm-delete";
import ConfirmStatusUpdate from "../../../components/dashboard/access-groups/confirm-status-update";
import { filterAccessGroupByStringPlaceholder, filterAccessGroupByString, accessGroupCreateLink, getAccessGroupEditLink } from "../../../utils/access-group";
import { applyPagination, createFilter } from "../../../utils/list-utils";
import { controllerApi } from "../../../api/controllers";
import { serverDownCode } from "../../../api/api-helpers";
import { ServerDownError } from "../../../components/dashboard/errors/server-down-error";
import { _ } from "numeral";

const tabs = [
	{
		label: "All",
		value: "all",
	},
	{
		label: "Accepts Marketing",
		value: "hasAcceptedMarketing",
	},
	{
		label: "Prospect",
		value: "isProspect",
	},
	{
		label: "Returning",
		value: "isReturning",
	},
];

const sortOptions = [
	{
		label: "Last update (newest)",
		value: "updatedAt|desc",
	},
	{
		label: "Last update (oldest)",
		value: "updatedAt|asc",
	},
	{
		label: "Total orders (highest)",
		value: "orders|desc",
	},
	{
		label: "Total orders (lowest)",
		value: "orders|asc",
	},
];

/*
const applyFilters = (accessGroup, filters) =>
    accessGroup.filter((accGroup) => {
		if (filters.query) {
			let queryMatched = false;
			const properties = ["accessGroupName", "accessGroupDesc"];

			properties.forEach((property) => {
				if (
					accGroup[property].toLowerCase().includes(filters.query.toLowerCase())
				) {
					queryMatched = true;
				}
			});

			if (!queryMatched) {
				return false;
			}
		}

		// if (filters.hasAcceptedMarketing && !person.hasAcceptedMarketing) {
		// 	return false;
		// }

		// if (filters.isProspect && !person.isProspect) {
		// 	return false;
		// }

		// if (filters.isReturning && !person.isReturning) {
		// 	return false;
		// }

		return true;
	}); */

const applyFilter = createFilter({
	query: filterAccessGroupByString
})

const descendingComparator = (a, b, orderBy) => {
	if (b[orderBy] < a[orderBy]) {
		return -1;
	}

	if (b[orderBy] > a[orderBy]) {
		return 1;
	}

	return 0;
};

const getComparator = (order, orderBy) =>
	order === "desc"
		? (a, b) => descendingComparator(a, b, orderBy)
		: (a, b) => -descendingComparator(a, b, orderBy);

 const applySort = (accessGroup, sort) => {
	const [orderBy, order] = sort.split("|");
	const comparator = getComparator(order, orderBy);
	const stabilizedThis = accessGroup.map((el, index) => [el, index]);

	stabilizedThis.sort((a, b) => {
		const newOrder = comparator(a[0], b[0]);

		if (newOrder !== 0) {
			return newOrder;
		}

		return a[1] - b[1];
	});

	return stabilizedThis.map((el) => el[0]);
};

/*
const applyPagination = (accessGroup, page, rowsPerPage) =>
	accessGroup.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage); */

const AccessGroupList = () => {
	const isMounted = useMounted();
	const queryRef = useRef(null);
	const [accessGroup, setAccessGroup] = useState([]);
	// const [currentTab, setCurrentTab] = useState("all");
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [sort, setSort] = useState(sortOptions[0].value);
	const [serverDownOpen, setServerDownOpen] = useState(false);

	const [filters, setFilters] = useState({
		query: "",
		// hasAcceptedMarketing: null,
		// isProspect: null,
		// isReturning: null,
	});

	useEffect(() => {
		gtm.push({ event: "page_view" });
	}, []);

	const getAccessGroupInScheduleStatus = async () => {
        const res = await accessGroupScheduleApi.getAllAccessGroupStatus();
        if (res.status != 200) {
            if (res.status == serverDownCode) {
                setServerDownOpen(true);
            }
            toast.error("Error loading access group current statuses info");
            return {};
        }
        const data = await res.json();
        return data;
    }

	const getAccessGroupLocal = useCallback(async () => {
		try {
			//const data = await personApi.getFakePersons() 
			const res = await accessGroupApi.getAccessGroups();
			const data = await res.json();
			const entrancesRes = await Promise.all(data.map(group => accessGroupEntranceApi.getEntranceWhereAccessGroupId(group.accessGroupId)));
			const serverDownRes = entrancesRes.filter(res => res.status === serverDownCode);
			if (serverDownRes.length > 0) {
				setServerDownOpen(true);
				toast.error("Error loading entrances data");
				setAccessGroup([]);
				return;
			}
			const accessGroupWithScheduleStatus = await getAccessGroupInScheduleStatus();
			const accGroupWithSchedStatus = data.map(accessGroup=> {
                    return {
                        ...accessGroup,
                        isInSchedule: accessGroupWithScheduleStatus[accessGroup.accessGroupId]
                    }
                });
			const entrancesData = await Promise.all(entrancesRes.map(res => res.json()));
			if (isMounted()) {
				accGroupWithSchedStatus.forEach((group, i) => group.entrances = entrancesData[i]);
				console.log(accGroupWithSchedStatus, "accessGroupWithScheduleStatus");
				setAccessGroup(accGroupWithSchedStatus);
			}
		} catch (err) {
			console.error(err);
		}
	}, [isMounted]);

	useEffect(
		() => {
			getAccessGroupLocal();
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	// const handleTabsChange = (event, value) => {
	// 	const updatedFilters = {
	// 		...filters,
	// 		hasAcceptedMarketing: null,
	// 		isProspect: null,
	// 		isReturning: null,
	// 	};

	// 	if (value !== "all") {
	// 		updatedFilters[value] = true;
	// 	}

	// 	setFilters(updatedFilters);
	// 	setCurrentTab(value);
	// };

	//query filter
	const handleQueryChange = (event) => {
		event.preventDefault();
		setFilters((prevState) => ({
			...prevState,
			query: queryRef.current?.value,
		}));
	};
	
	// const handleSortChange = (event) => {
	// 	setSort(event.target.value);
	// };

	const handlePageChange = (event, newPage) => setPage(newPage);

	const handleRowsPerPageChange = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
	};

	// Usually query is done on backend with indexing solutions
	// rn it's for search query 
	const filteredAccessGroup = applyFilter(accessGroup, filters);
	//const sortedAccessGroup = applySort(filteredAccessGroup, sort);
	const paginatedAccessGroup = applyPagination(
		filteredAccessGroup,
		page,
		rowsPerPage
	);

  //for actions button
	const [anchorEl, setAnchorEl] = React.useState(null);
	const open = Boolean(anchorEl);
	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};
	//for access-group-list-table
	const [selectedAccessGroup, setSelectedAccessGroup] = useState([]);
	const handleSelectAllAccessGroup = (event) => {
		setSelectedAccessGroup(
			event.target.checked ? accessGroup.map((accGroup) => accGroup.accessGroupId) : []
		);
	};

	const handleSelectOneAccessGroup = (event, accessGroupId) => {
		if (!selectedAccessGroup.includes(accessGroupId)) {
			setSelectedAccessGroup((prevSelected) => [...prevSelected, accessGroupId]);
		} else {
			setSelectedAccessGroup((prevSelected) =>
				prevSelected.filter((id) => id !== accessGroupId)
			);
		}
	};

	const enableBulkActions = selectedAccessGroup.length > 0;
	const selectedSomeAccessGroup =
        selectedAccessGroup.length > 0 && selectedAccessGroup.length < accessGroup.length;
	const selectedAllAccessGroup = selectedAccessGroup.length === accessGroup.length;
	
	

	// Reset selected Persons when Persons change
	useEffect(
		() => {
			if (selectedAccessGroup.length) {
				setSelectedAccessGroup([]);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[accessGroup]
	);
	
	// for updating status of access group (active/ non-active)
	const [statusUpdateIds, setStatusUpdateIds] = useState([]);
	const [statusUpdateDialogOpen, setStatusUpdateDialogOpen] = useState(false);
	const [updateStatus, setUpdateStatus] = useState(null);
    const openStatusUpdateDialog = (accessGroupIds, updatedStatus) => {
        setStatusUpdateIds(accessGroupIds);
        setUpdateStatus(updatedStatus);
        setStatusUpdateDialogOpen(true);
    }
    const handleStatusUpdateDialogClose = () => {
        setStatusUpdateDialogOpen(false);
    }
    const handleMultipleUpdate = (updateStatus) => openStatusUpdateDialog([ ...selectedAccessGroup ], updateStatus);
    const handleMultiActivate = () => handleMultipleUpdate(true);
    const handleMultiDeactivate = () => handleMultipleUpdate(false);
    const handleStatusUpdate = async (accessGroupIds, updatedStatus) => {
        handleStatusUpdateDialogClose();

        const resArr = await Promise.all(accessGroupIds.map(accessGroupId => accessGroupApi.updateAccessGroupStatus(accessGroupId, updatedStatus)));
        
        let successCount = 0;
        const someFailed = false;
        resArr.forEach(res => {
            if (res.status == 200) {
                successCount++;
            } else {
                someFailed = true;
            }
        })

        if (someFailed) { toast.error("Failed to " + (updatedStatus ? "activate" : "deactivate") + " some access groups"); }
        if (successCount) { toast.success("Successfully " + (updatedStatus ? "activated" : "deactivate") + " " + (successCount > 1 ? successCount + " access groups" : "1 access group")); }

        const newAccessGroups = [ ...accessGroup ];
        newAccessGroups.forEach(acc => {
            if (accessGroupIds.includes(acc.accessGroupId)) {
                //TODO: look into this logic again, I believe regardless of whether this is successful or not, it will be updated
                acc.isActive = updatedStatus;
            }
        })
        setAccessGroup(newAccessGroups);
    }

	//for delete action button
	const [deleteOpen, setDeleteOpen] = React.useState(false);  
/* 	const [text, setText] = React.useState("");
	const [deleteBlock, setDeleteBlock] = React.useState(true);
	const handleTextChange = (e) => {
		setText(e.target.value);
	};
	useEffect(() => {
	//  console.log(text); 
	 (text=='DELETE')? setDeleteBlock(false):setDeleteBlock(true)
	}); */
	
	//Set to true if an access group is selected. controls form input visibility.
	/*const [selectedState, setselectedState] = useState(false);
	const checkSelected = () => {
	  if(selectedAccessGroup.length>=1){
		 setselectedState(true)
	  }
	};
	useEffect(() => {
		checkSelected()
	}, [selectedAccessGroup]); */
	

	const handleDeleteOpen = () => {        
		setDeleteOpen(true);                        
	};
	const handleDeleteClose = () => {
		setDeleteOpen(false);
	}
	const deleteAccessGroups = async(e) => {
		e.preventDefault();
		Promise.all(selectedAccessGroup.map(id=>{
			return accessGroupApi.deleteAccessGroup(id)
		})).then( resArr => {
			resArr.filter(res=>{
				if(res.status == 204){
					toast.success('Delete success',{duration:2000},);
				}
				else{
					toast.error('Delete unsuccessful' )
				}
			});
			getAccessGroupLocal();
		})
		setDeleteOpen(false);
	};

	//blank out edit and delete if no people selected
	const [buttonBlock, setbuttonBlock] = useState(true);
	useEffect(() => {
		if(selectedAccessGroup.length<1){
			setbuttonBlock(true);
		}
		else{
			setbuttonBlock(false);
		}
		
	}, [selectedAccessGroup]);
	
	
	
	return (
		<>
			<Head>
				<title>Etlas : Access-Group List</title>
			</Head>
            <ConfirmStatusUpdate
                accessGroupIds={statusUpdateIds}
                open={statusUpdateDialogOpen}
                handleDialogClose={handleStatusUpdateDialogClose}
                updateStatus={updateStatus}
                handleStatusUpdate={handleStatusUpdate}
            />
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					py: 8,
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
								sx={{m:2.5}}>
								<Typography variant="h4">Access Groups</Typography>
							</Grid>
							<Grid item>
								<Button
									endIcon={<ChevronDownIcon fontSize="small" />}
									sx={{ m: 2 }}
									variant="contained"
									onClick={handleClick}
								>
									Actions
								</Button>
								<StyledMenu
									anchorEl={anchorEl}
									open={open}
									onClose={handleClose}
								>
									<NextLink href={"/dashboard/access-groups/create"}
										passHref>
										<MenuItem disableRipple>
											<AddIcon />
											&#8288;Create
										</MenuItem>
									</NextLink>
									<NextLink href={{
										pathname: '/dashboard/access-groups/edit',
										query: { ids: encodeURIComponent(JSON.stringify(selectedAccessGroup)) }
									}}
										passHref>
										<MenuItem disableRipple
											disabled={buttonBlock}>
											<EditIcon />
											&#8288;Edit
										</MenuItem>
									</NextLink>
									<MenuItem disableRipple
										onClick={handleMultiActivate}
										disabled={buttonBlock}>
										<CloudDone />
										&#8288;Activate
									</MenuItem>
									<MenuItem disableRipple
										onClick={handleMultiDeactivate}
										disabled={buttonBlock}>
										<CloudOff />
										&#8288;De-Activate
									</MenuItem>
									<MenuItem disableRipple
										onClick={handleDeleteOpen}
										disabled={buttonBlock}>
										<DeleteIcon />
										&#8288;Delete
									</MenuItem>
									<Confirmdelete 
									setAnchorEl={setAnchorEl}
									open={deleteOpen} 
									handleDialogClose={handleDeleteClose}
									deleteAccessGroups={deleteAccessGroups} />
								</StyledMenu>
							</Grid>
						</Grid>
						{/* <Box
							sx={{
								m: -1,
								mt: 3,
							}}
						>
							<Button startIcon={<UploadIcon fontSize="small" />}
								sx={{ m: 1 }}>
								Import
							</Button>
							<Button
								startIcon={<DownloadIcon fontSize="small" />}
								sx={{ m: 1 }}
							>
								Export
							</Button>
							<Tooltip  title='Excel template can be found at {}'
							enterTouchDelay={0}
								placement ='top'
								sx={{
									m: -0.5,
									mt: 3,
								}}>
								<HelpOutlineIcon />
							</Tooltip>
						</Box> */}
					</Box>
					<Card>
						{/* <Tabs
							indicatorColor="primary"
							onChange={handleTabsChange}
							scrollButtons="auto"
							sx={{ px: 3 }}
							textColor="primary"
							value={currentTab}
							variant="scrollable"
						>
							{tabs.map((tab) => (
								<Tab key={tab.value} label={tab.label} value={tab.value} />
							))}
						</Tabs> */}
						<Divider />
						<Box
							sx={{
								alignItems: "center",
								display: "flex",
								flexWrap: "wrap",
								m: -1.5,
								p: 3,
							}}
						>
							<Box
								component="form"
								onChange={handleQueryChange}
								sx={{
									flexGrow: 1,
									m: 1.5,
								}}
							>
								<TextField
									defaultValue=""
									fullWidth
									inputProps={{ ref: queryRef }}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<SearchIcon fontSize="small" />
											</InputAdornment>
										),
									}}
									placeholder={filterAccessGroupByStringPlaceholder}
								/>
							</Box>
							{/* <TextField
								label="Sort By"
								name="sort"
								onChange={handleSortChange}
								select
								SelectProps={{ native: true }}
								sx={{ m: 1.5 }}
								value={sort}
							>
								{sortOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</TextField> */}
						</Box>
						<AccessGroupListTable
							enableBulkActions={enableBulkActions}
							selectedAllAccessGroup={selectedAllAccessGroup}
							selectedAccessGroup={selectedAccessGroup}
							selectedSomeAccessGroup={selectedSomeAccessGroup}
							handleSelectAllAccessGroup={handleSelectAllAccessGroup}
							handleSelectOneAccessGroup={handleSelectOneAccessGroup}
							accessGroup={paginatedAccessGroup}
							accessGroupCount={filteredAccessGroup.length}
							onPageChange={handlePageChange}
							onRowsPerPageChange={handleRowsPerPageChange}
							rowsPerPage={rowsPerPage}
							page={page}
						/>
					</Card>
				</Container>
			</Box>
		</>
	);
};

AccessGroupList.getLayout = (page) => (
	<AuthGuard>
		<DashboardLayout>{page}</DashboardLayout>
	</AuthGuard>
);

export default AccessGroupList;
