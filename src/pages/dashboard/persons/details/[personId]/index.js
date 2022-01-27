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
import { PersonBasicDetails } from '../../../../../components/dashboard/person/person-basic-details';
import StyledMenu from '../../../../../components/dashboard/styled-menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Confirmdelete } from '../../../../../components/dashboard/persons/Confirmdelete';
import toast from 'react-hot-toast';

;

const PersonDetails = () => {

  // load person details
  const isMounted = useMounted();
  const [person, setPerson] = useState(null);  
  const router = useRouter();
  const { personId } = router.query;

  useEffect(() => {
	gtm.push({ event: 'page_view' });
  }, []);

  const getPerson = useCallback(async () => {
    try {
      const res = await personApi.getPerson(personId);
      const body = await res.json();

      if(isMounted()) {
        setPerson(body);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(() => {
    getPerson();
  }, 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  []);

  // action menu open / close
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (e) => { setAnchorEl(e.currentTarget); }
  const handleClose = () => { setAnchorEl(null); }

  // link to edit page
  const editLink = "/dashboard/persons/edit?ids=" + encodeURIComponent(JSON.stringify([Number(personId)]));

  // handle delete action. put this in parent component
	const [deleteOpen, setDeleteOpen] = React.useState(false);  

	const handleDeleteOpen = () => {        
		setDeleteOpen(true);                        
	};
	const handleDeleteClose = () => {
		setDeleteOpen(false);
	}
	const handleDeleteAction = () => {
    Promise.resolve(
      personApi.deletePerson(person.personId)
    ).then((res)=>{
      if (res.status == 204){
        toast.success('Delete success');
        router.replace('/dashboard/persons');
      }
      else{
        toast.error('Delete unsuccessful')
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
			  <NextLink
				href="/dashboard/persons"
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
					{person.personFirstName + ' ' + person.personLastName}
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
                Create new person
              </MenuItem>
            </NextLink>
            <NextLink
              href={editLink}
              passHref
            >
              <MenuItem disableRipple>
                <EditIcon />
                Edit person
              </MenuItem>
            </NextLink>           
            <MenuItem disableRipple onClick={handleDeleteOpen}>
              <DeleteIcon />
              Delete person 
            </MenuItem>
            <Confirmdelete setAnchorEl={setAnchorEl} deleteOpen={deleteOpen} handleDeleteClose={handleDeleteClose}
			handleDeleteAction={handleDeleteAction}
			handleDeleteOpen={handleDeleteOpen}/>
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
