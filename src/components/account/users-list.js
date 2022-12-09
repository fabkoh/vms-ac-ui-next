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

import { UsersListTable } from "../account/users-list-table";
import { useMounted } from "../../hooks/use-mounted";
import { Download as DownloadIcon } from "../../icons/download";
import { Plus as PlusIcon } from "../../icons/plus";
import { Search as SearchIcon } from "../../icons/search";
import { Upload as UploadIcon } from "../../icons/upload";
import { gtm } from "../../lib/gtm";
import StyledMenu from "../../components/dashboard/styled-menu";
import { ChevronDown as ChevronDownIcon } from "../../icons/chevron-down";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { personApi } from "../../api/person";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Tooltip from '@mui/material/Tooltip'
import { Confirmdelete } from "../../components/dashboard/persons/confirm-delete";
import toast from "react-hot-toast";
import { createFilter } from "../../utils/list-utils";
import { userCreateLink, filterUserByString } from "../../utils/users";
import { ServerDownError } from "../../components/dashboard/errors/server-down-error";
import { serverDownCode } from "../../api/api-helpers";
import { authDeleteTechAdmin, authGetAccounts, authDeleteUserAdmin } from "../../api/auth-api"


export const UsersList = () => {
	const isMounted = useMounted();
	const queryRef = useRef(null);

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
	
	const applyFilter = createFilter({
		query: filterUserByString,
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
	
	const applySort = (Persons, sort) => {
		const [orderBy, order] = sort.split("|");
		const comparator = getComparator(order, orderBy);
		const stabilizedThis = Persons.map((el, index) => [el, index]);
	
		stabilizedThis.sort((a, b) => {
			const newOrder = comparator(a[0], b[0]);
	
			if (newOrder !== 0) {
				return newOrder;
			}
	
			return a[1] - b[1];
		});
	
		return stabilizedThis.map((el) => el[0]);
	};
	
	const applyPagination = (Persons, page, rowsPerPage) =>
		Persons.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
	

	const [Persons, setPersons] = useState([]);
	// const [currentTab, setCurrentTab] = useState("all");
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [sort, setSort] = useState(sortOptions[0].value);
	const [filters, setFilters] = useState({
		query: "",
	});

	useEffect(() => {
		gtm.push({ event: "page_view" });
	}, []);

	const getPersonsLocal = useCallback(async () => {
		try {
			const res = await authGetAccounts();
			if (res.type == 'success') {
				const body = res.response
				const newList = []
				for (const role of Object.keys(body)){
					for (const user of body[role]){
						user['role'] = role
						newList.push(user)
					}
				}
				setPersons(newList);
			} else {
				if (res.status == serverDownCode) {
					setServerDownOpen(true);
				}
			}
		} catch(err) {
			console.log(err);
			}
	}, [isMounted]);

	useEffect(
		() => {
			getPersonsLocal();
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	const handleQueryChange = (event) => {
		event.preventDefault();
		setFilters((prevState) => ({
			...prevState,
			query: queryRef.current?.value,
		}));
	};
	

	const handlePageChange = (event, newPage) => {
		setPage(newPage);
	};

	const handleRowsPerPageChange = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
	};

	// Usually query is done on backend with indexing solutions
	const filteredPersons = applyFilter(Persons, filters);
	const sortedPersons = applySort(filteredPersons, sort);
	const paginatedPersons = applyPagination(
		sortedPersons,
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
	//for persons-list-table
	const [selectedPersons, setSelectedPersons] = useState([]);
	const handleSelectAllPersons = (event) => {
		setSelectedPersons(
			event.target.checked ? Persons.map((person) => person.id) : []
		);
	};

	const handleSelectOneperson = (event, userId) => {
		if (!selectedPersons.includes(userId)) {
			setSelectedPersons((prevSelected) => [...prevSelected, userId]);
		} else {
			setSelectedPersons((prevSelected) =>
				prevSelected.filter((id) => id !== userId)
			);
		}
	};

	const enableBulkActions = selectedPersons.length > 0;
	const selectedSomePersons =
		selectedPersons.length > 0 && selectedPersons.length < Persons.length;
	const selectedAllPersons = selectedPersons.length === Persons.length;
	

	// Reset selected Persons when Persons change
	useEffect(
		() => {
			if (selectedPersons.length) {
				setSelectedPersons([]);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[Persons]
	);

	//for delete action button: opens the delete form
	const [deleteOpen, setDeleteOpen] = React.useState(false);
	const [serverDownOpen, setServerDownOpen] = React.useState(false);
	
	//Set to true if multiple people are selected. controls form input visibility.
	const [selectedState, setselectedState] = useState(false);
	const checkSelected = () => {
	  if(selectedPersons.length==1){
		 setselectedState(false)
	  }
	  else{
		  setselectedState(true)
	  }
	};
	useEffect(() => {
		checkSelected()
	}, [selectedPersons]);
	

	const handleDeleteOpen = () => {        
		setDeleteOpen(true);                        
	};
	const handleDeleteClose = () => {
		setDeleteOpen(false);
	}

	const deleteHelper = async(id) => {
        try {
            const res = await authDeleteUserAdmin(id)
			if (res.status != 200){
				const restwo = await authDeleteTechAdmin(id)
				if (restwo.status == 200){
					return restwo
				}
			}
			return res
        } catch(err) {
            console.log(err)
			return 'fail'
		}
    }
	const deletePersons = async(e) => {
		e.preventDefault();
		Promise.all(selectedPersons.map(id=>{
			return deleteHelper(id)
		})).then( resArr => {
			resArr.filter(res=>{
				if(res.status == 200){
					toast.success('Delete success',{duration:2000},);
				}
				else{
					toast.error('Delete unsuccessful' )
				}
			})
			getPersonsLocal();
		})
		setDeleteOpen(false);
	};
	
	//blank out edit and delete if no people selected
	const [buttonBlock, setbuttonBlock] = useState(true);
	useEffect(() => {
		if(selectedPersons.length<1){
			setbuttonBlock(true);
		}
		else{
			setbuttonBlock(false);
		}
		
	}, [selectedPersons]);
	

	return (
		<Box
			component="main"
			sx={{
				flexGrow: 1
			}}
		>
			<Container maxWidth="xl">
				<ServerDownError
					open={serverDownOpen} 
					handleDialogClose={() => setServerDownOpen(false)}
				/>
				<Box sx={{ mb: 4 }}>
					<Typography sx={[{mx:3}, {mb:6}, {mt:3}]}>This section shows you the list of all user accounts that you are able to manage. This does not pertain to Persons.</Typography>
					<Grid container
					justifyContent="space-between"
					spacing={3}>
						<Grid item>
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
								<NextLink href={userCreateLink}
									passHref>
									<MenuItem disableRipple>
										<AddIcon />
										&#8288;Create
									</MenuItem>
								</NextLink>
								<MenuItem disableRipple
									onClick={handleDeleteOpen}
									disabled={buttonBlock}>
									<DeleteIcon />
									&#8288;Delete
								</MenuItem>
								<Confirmdelete
									selectedState={selectedState}
									open={deleteOpen} 
									handleDialogClose={handleDeleteClose}
									selectedPersons={selectedPersons}
									deletePersons={deletePersons}
									setAnchorEl={setAnchorEl} />
							</StyledMenu>
						</Grid>
					</Grid>
				</Box>
				<Card>
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
								placeholder="Search for System User by Name, Role, Email or Mobile Number"
							/>
						</Box>
					</Box>
					<UsersListTable
						enableBulkActions={enableBulkActions}
						selectedAllPersons={selectedAllPersons}
						selectedPersons={selectedPersons}
						selectedSomePersons={selectedSomePersons}
						handleSelectAllPersons={handleSelectAllPersons}
						handleSelectOneperson={handleSelectOneperson}
						Persons={paginatedPersons}
						PersonsCount={filteredPersons.length}
						onPageChange={handlePageChange}
						onRowsPerPageChange={handleRowsPerPageChange}
						rowsPerPage={rowsPerPage}
						page={page}
					/>
				</Card>
			</Container>
		</Box>
	);
};
