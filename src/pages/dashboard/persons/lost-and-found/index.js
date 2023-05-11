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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { ChevronDown as ChevronDownIcon } from '../../../../icons/chevron-down';
import { Search as SearchIcon } from "../../../../icons/search";
import toast from 'react-hot-toast';
import { useMounted } from "../../../../hooks/use-mounted";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { PersonLostDetails } from "../../../../components/dashboard/persons/person-lost-and-found-basic-details";
import { PersonLostDetailsCard } from "../../../../components/dashboard/persons/person-lost-and-found-full-details";
import PersonCredentials from '../../../../components/dashboard/persons/person-credentials';
import StyledMenu from '../../../../components/dashboard/styled-menu';
import { Confirmdelete } from '../../../../components/dashboard/persons/confirm-delete';
import { ServerDownError } from '../../../../components/dashboard/errors/server-down-error';
import { getPersonName, getPersonsEditLink, personListLink, filterPersonByCredentialsPlaceholder} from '../../../../utils/persons';
import { personApi } from '../../../../api/person';
import { findPersonWithCredUid } from "../../../../api/credentials";
import { serverDownCode } from '../../../../api/api-helpers';


const LostPerson = () => {
	const trialperson = { 
		personId: 1,
		personFirstName: "B", 
		personLastName: "M", 
		personUid: "123jads", 
		personMobileNumber: null, 
		personEmail: "abc@id.com",
		accessGroup: null
		}

	const isMounted = useMounted();
	const queryRef = useRef(null);
	const [lostId, setLostId] = useState(null); 
	const router = useRouter();
	const [isSubmitted, setisSubmitted] = useState(false);
	

	const handleSubmit = (event) => {
		event.preventDefault();
		setisSubmitted(true);
        return;}

	const getInfo = useCallback( () => {
		}, [isMounted]);
		
		useEffect(() => {
			getInfo();
		}, 
		[]);
	return (
		<>
			<Head>
				<title>Etlas : Lost And Found</title>
			</Head>
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					py: 8,
				}}
			>
				<Container maxWidth="xl">
						<Box sx={{ mb: 4 }}>
							<ServerDownError
								handleDialogClose={() => setServerDownOpen(false)}
							/>
							<NextLink
								href={personListLink}
								passHref
							>
								<Link
								color="textPrimary"
								component="a"
								sx={{
									alignItems: 'center',
									display: 'flex'
								}}
								>
									<ArrowBackIcon
										fontSize="small"
										sx={{ mr: 1 }}
									/>
									<Typography variant="subtitle2">
										Persons
									</Typography>
								</Link>
							</NextLink>
						</Box>
						<Box sx={{ mb: 4 }}>
							<Grid container
									justifyContent="space-between"
									spacing={3}>
								<Grid item
										sx={{m:2.5}}>
									<Typography variant="h4">Lost & Found
										<Tooltip  title='Change Access for Persons with Lost Credentials'
											enterTouchDelay={0}
											placement="right"
											sx={{
												m: 1,
											}}>
											<HelpOutlineIcon />
										</Tooltip>
									</Typography>
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
									onSubmit={handleSubmit}
									sx={{
										flexGrow: 1,
										m: 1.5,
									}}
								>
									<Grid container
									justifyContent="space-around"
									spacing={1}>
										<Grid item sx={{
										flexGrow: 1,
										m: 1.5,
										}}>
											<TextField
												defaultValue=""
												fullWidth
												inputProps={{ref: queryRef}}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<SearchIcon fontSize="small" />
														</InputAdornment>
													),
												}}
												placeholder={filterPersonByCredentialsPlaceholder}
											/>
										</Grid>
										<Grid item my="auto">
											<Button 
											color="error"
											variant="contained"
											size="large"
											onClick={handleSubmit}>
												Search
											</Button>
										</Grid>
									</Grid>
								</Box>
							</Box>
						</Card>
					{isSubmitted &&
					<PersonLostDetailsCard lostCredUid={queryRef.current.value}></PersonLostDetailsCard>
					}
				</Container>
			</Box>
		</>
	);
};

LostPerson.getLayout = (page) => (
	<AuthGuard>
		<DashboardLayout>{page}</DashboardLayout>
	</AuthGuard>
);

export default LostPerson;
