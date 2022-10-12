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
import { AuthGuard } from '../../../../components/authentication/auth-guard';
import { DashboardLayout } from '../../../../components/dashboard/dashboard-layout';
import { useMounted } from '../../../../hooks/use-mounted';
import { ChevronDown as ChevronDownIcon } from '../../../../icons/chevron-down';
import { gtm } from '../../../../lib/gtm';
import StyledMenu from '../../../../components/dashboard/styled-menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Confirmdelete } from '../../../../components/dashboard/persons/confirm-delete';
import toast from 'react-hot-toast';
import { ServerDownError } from '../../../../components/dashboard/errors/server-down-error';
import { serverDownCode } from '../../../../api/api-helpers';
import {eventsManagementListLink} from '../../../../utils/eventsManagement'
import {eventsManagementApi} from '../../../../api/events-management'
import { EventManagementDetails } from '../../../../components/dashboard/events-management/list/events-management-details';

const IndividualEventManagement = () => {

  // load person details
  const isMounted = useMounted();
  const [eventManagement, setEventManagement] = useState({}); 
  const router = useRouter();
  const emId = router.query;
  console.log(emId)
	const [serverDownOpen, setServerDownOpen] = useState(false);
  
  useEffect(() => {
	gtm.push({ event: 'page_view' });
  }, []);

  const getEventManagementbyId = async(emId) => {
    try {
      const res = await eventsManagementApi.getIndividualEventsManagement(emId.emId);
      if(res.status != 200) { // person not found
        toast.error("Event Management not found");
      }
      const body = await res.json();
      if (isMounted()) {
      setEventManagement(body);
    }
    } catch(err) {
      console.log(err);
    }
    };


  const getInfo = useCallback(() => {
    getEventManagementbyId(emId);
  }, [isMounted]);

  useEffect(() => {
    getInfo();
  }, []);


  // action menu open / close
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (e) => { setAnchorEl(e.currentTarget); }
  const handleClose = () => { setAnchorEl(null); }

  // handle delete action. put this in parent component
	const [deleteOpen, setDeleteOpen] = useState(false);  

	const handleDeleteOpen = () => {        
		setDeleteOpen(true);                        
	};
	const handleDeleteClose = () => {
		setDeleteOpen(false);
	}

	// const deletePersons = (e) => {
  //   e.preventDefault();
  //   Promise.resolve(
  //     personApi.deletePerson(person.personId)
  //   ).then(res => {
  //     if (res.status == 204){
  //       toast.success('Delete success');
  //       router.replace(personListLink);
  //     }
  //     else{
  //       toast.error('Delete unsuccessful');
  //       res.json().then(json => toast.info(json))
  //     }
  //   })
	// };

  // if (!eventManagement) {
  //   return null;
  // }

  console.log(eventManagement)

  return (
	<>
	  <Head>
		<title>
		  Etlas : Event Management Details
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
				href={eventsManagementListLink}
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
					Events Management
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
            {eventManagement ? eventManagement.eventsManagementName : ""}
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
              href="/dashboard/events-management/modify"
              passHref
            >
              <MenuItem disableRipple>
                <AddIcon />
                Create
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
              // deletePersons={deletePersons} 
              />
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
            <EventManagementDetails eventManagement={eventManagement} />
          </Grid>
			  </Grid>
		  </Box>
		</Container>
	  </Box>
	</>
  );
};

IndividualEventManagement.getLayout = (page) => (
  <AuthGuard>
	<DashboardLayout>
	  {page}
	</DashboardLayout>
  </AuthGuard>
);

export default IndividualEventManagement;
