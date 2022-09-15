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
	Tooltip,
	Typography,
	Link
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import PropTypes from 'prop-types';
import DeleteIcon from '@mui/icons-material/Delete';
import { ChevronDown as ChevronDownIcon } from '../../../icons/chevron-down';
import { PersonLostDetails } from "./person-lost-and-found-basic-details";
import PersonCredentials from './person-credentials';
import StyledMenu from '../styled-menu';
import { Confirmdelete } from './confirm-delete';
import { personApi } from '../../../api/person';
import { useMounted } from "../../../hooks/use-mounted";
import { findPersonWithCredUid } from "../../../api/credentials";
import { getPersonName, getPersonsEditLink, personListLink, filterPersonByCredentialsPlaceholder} from '../../../utils/persons';
import { getCredentialWherePersonIdApi } from '../../../api/credentials';



export const PersonLostDetailsCard = (props) => {
	const isMounted = useMounted();
	const [person, setPerson] = useState({ 
		personId: null,
		personFirstName: null, 
		personLastName: null, 
		personUid: null, 
		personMobileNumber: null, 
		personEmail: null,
		accessGroup: null
	  }); 
	const [credentials, setCredentials] = useState([]);
	const router = useRouter();

	const getLostPerson = async() => {
		try {
		const res = await findPersonWithCredUid(props.lostCredUid);
		if(res.status != 200) { // person not found
			toast.error("Person not found");
			return;
		}
		const body = await res.json();
		console.log(body);
		if(isMounted()) {
			setPerson(body);
			getCredentials(body.personId);
		}
		} catch(err) {
		console.log(err);
		}
		
	}

	//get full credentials of person with lost card
	const getCredentials = async(personId) => {
		try {
			console.log(personId)
			const res = await getCredentialWherePersonIdApi(personId);
			if (res.status != 200) { // credentials not found
				toast.error("Error loading credentials");
				setCredentials([]);
				if (res.status == serverDownCode) {
				setServerDownOpen(true);
				}
				return;
			}
			console.log("12345678")
			const body = await res.json();
			if (isMounted()) {
				setCredentials(body);
			}
			} catch (err) {
			console.log(err);
			// toast.error("Error loading credentials");
			}
		}
		

  // action menu open / close
	const [anchorEl, setAnchorEl] = useState(null);
	const open = Boolean(anchorEl);
	const handleClick = (e) => { setAnchorEl(e.currentTarget); }
	const handleClose = () => { setAnchorEl(null); }
	
	// link to edit page
	const editLink = getPersonsEditLink([person]);

	// handle delete action. put this in parent component
	const [deleteOpen, setDeleteOpen] = useState(false);  

	const handleDeleteOpen = () => {        
		setDeleteOpen(true);                        
	};
	const handleDeleteClose = () => {
		setDeleteOpen(false);
	}
	const deletePersons = (e) => {
		e.preventDefault();
		Promise.resolve(
			personApi.deletePerson(person.personId)
			).then(res => {
			if (res.status == 204){
				toast.success('Delete success');
				router.replace(personListLink);
			}
			else{
				toast.error('Delete unsuccessful');
				res.json().then(json => toast.info(json))
			}
		})
	};

	const getInfo = useCallback( () => {
		getLostPerson();
	}, [isMounted]);
	
	useEffect(() => {
		getInfo();
	}, 
	[]);

  	return (
    	<div>
			<Grid
				container
				justifyContent="space-between"
				spacing={3}
				>
				<Grid
					item
					sx={{
					alignItems: 'center',
					display: 'flex',
					overflow: 'hidden',
					mt: 4, 
					ml: 10
					}}
				>
					<div>
						<Typography variant="h4">
							{/* !!!! */}
							{ getPersonName(person) }
						</Typography>
					</div>
				</Grid>
				<Grid
					item
					sx={{ mt:4, mr: 8 }}
				>
					<Button
						endIcon={(
						<ChevronDownIcon fontSize="small" />
						)}
						sx={{ m: 1 }}
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
						<NextLink
						href={editLink}
						passHref
						>
							<MenuItem disableRipple>
								<EditIcon />
								Edit
							</MenuItem>
						</NextLink>           
						<MenuItem disableRipple
							onClick={handleDeleteOpen}>
							<DeleteIcon />
							Delete
						</MenuItem>
						<Confirmdelete 
						setAnchorEl={setAnchorEl}
						open={deleteOpen}
						handleDialogClose={handleDeleteClose}
						deletePersons={deletePersons} />
					</StyledMenu>
				</Grid>
			</Grid>
			<Box sx={{ my: 4, mx: 8 }}>
				<Grid
				container
				spacing={3}
				>
					<Grid
						item
						xs={12}
					>
						<PersonLostDetails person={person} />
					</Grid>
					<Grid
						item
						xs={12}
					>
						<PersonCredentials credentials={credentials} />
					</Grid>
				</Grid>
			</Box>
		</div>
  	);
};
