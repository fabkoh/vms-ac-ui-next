import React, { useCallback, useState, useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Button,
  Container,
  Grid,
  Link,
  Typography
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AuthGuard } from '../../../../../components/authentication/auth-guard';
import { DashboardLayout } from '../../../../../components/dashboard/dashboard-layout';
import { useMounted } from '../../../../../hooks/use-mounted';
import { ChevronDown as ChevronDownIcon } from '../../../../../icons/chevron-down';
import { gtm } from '../../../../../lib/gtm';
import { personApi } from '../../../../../api/person';
import { PersonBasicDetails } from '../../../../../components/dashboard/persons/person-basic-details';
import StyledMenu from '../../../../../components/dashboard/styled-menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Confirmdelete } from '../../../../../components/dashboard/persons/confirm-delete';
import toast from 'react-hot-toast';
import { getPersonName, getPersonsEditLink, personListLink } from '../../../../../utils/persons';
import PersonCredentials from '../../../../../components/dashboard/persons/person-credentials';
import { getCredentialWherePersonIdApi } from '../../../../../api/credentials';
import { ServerDownError } from '../../../../../components/dashboard/errors/server-down-error';
import { serverDownCode } from '../../../../../api/api-helpers';
import { accessGroupScheduleApi } from '../../../../../api/access-group-schedules';

const PersonDetails = () => {

  // load person details
  const isMounted = useMounted();
  const [person, setPerson] = useState(null); 
  const [credentials, setCredentials] = useState([]);
  const router = useRouter();
  const { personId } = router.query;
	const [serverDownOpen, setServerDownOpen] = useState(false);

  useEffect(() => {
	gtm.push({ event: 'page_view' });
  }, []);
  const getPersonAccessGroupCurrentStatus = async (accGroupId) => {
      const res = await accessGroupScheduleApi.getAccessGroupStatusForSingleAccessGroup(accGroupId);
        if (res.status != 200) {
            if (res.status == serverDownCode) {
                setServerDownOpen(true);
            }
            toast.error("Error loading access group statuses info");
            return {};
        }
        const data = await res.json();
        return data;
    };
  const getCredentials = async() => {
    try {
      const res = await getCredentialWherePersonIdApi(personId);
      if (res.status != 200) { // credentials not found
        toast.error("Error loading credentials");
        setCredentials([]);
        if (res.status == serverDownCode) {
          setServerDownOpen(true);
        }
        return;
      }
      const body = await res.json();
      if (isMounted()) {
        setCredentials(body);
      }
    } catch (err) {
      console.log(err);
      toast.error("Error loading credentials");
    }
  }

  const getPerson = async() => {
    try {
      const res = await personApi.getPerson(personId);
      if(res.status != 200) { // person not found
        toast.error("Person not found");
        router.replace(personListLink);
        return;
      }
      const body = await res.json();
      const accessGroupStatus = body.accessGroup ? await getPersonAccessGroupCurrentStatus(body.accessGroup.accessGroupId):null;
      if (isMounted()) {
        const personWithAccGroupStatus = { ...body, accessGroupInSchedule: accessGroupStatus }
        console.log(personWithAccGroupStatus, "personWithAccGroupStatus")
        setPerson(personWithAccGroupStatus);
      }
    } catch(err) {
      console.log(err);
    }
  }

  const getInfo = useCallback( () => {
    getPerson();
    getCredentials();
  }, [isMounted]);

  useEffect(() => {
    getInfo();
  }, 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  []);

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

  if (!person) {
    return null;
  }
  return (
	<>
	  <Head>
		<title>
		  Etlas : Person Details
		</title>
	  </Head>
	  <Box
		component="main"
		sx={{
		  flexGrow: 1,
		  py: 8
		}}
	  >
		<Container maxWidth="md">
		  <div>
        <Box sx={{ mb: 4 }}>
        <ServerDownError
          open={serverDownOpen} 
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
				  overflow: 'hidden'
				}}
			  >
				<div>
				  <Typography variant="h4">
            { getPersonName(person) }
				  </Typography>
				</div>
			  </Grid>
			  <Grid
				item
				sx={{ m: -1 }}
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
              href="/dashboard/persons/create"
              passHref
            >
              <MenuItem disableRipple>
                <AddIcon />
                Create
              </MenuItem>
            </NextLink>
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
		  </div>
		  <Box sx={{ mt: 3 }}>
        <Grid
          container
          spacing={3}
        >
          <Grid
            item
            xs={12}
          >
            <PersonBasicDetails person={person} />
          </Grid>
          <Grid
            item
            xs={12}
          >
            <PersonCredentials credentials={credentials} />
          </Grid>
			  </Grid>
		  </Box>
		</Container>
	  </Box>
	</>
  );
};

PersonDetails.getLayout = (page) => (
  <AuthGuard>
	<DashboardLayout>
	  {page}
	</DashboardLayout>
  </AuthGuard>
);

export default PersonDetails;
