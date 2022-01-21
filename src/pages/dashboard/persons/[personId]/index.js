import { useCallback, useState, useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Button,
  Container,
  Divider,
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
import { personApi } from '../../../../api/person';
import { PersonBasicDetails } from '../../../../components/dashboard/person/person-basic-details';
import StyledMenu from '../../../../components/dashboard/styled-menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';;

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
      const data = await personApi.getPerson(personId);
      // const data = await personApi.getFakePerson(personId);
      if(isMounted()) {
        setPerson(data);
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

  if (!person) {
    return null;
  }
  return (
	<>
	  <Head>
		<title>
		  Etlas
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
            <MenuItem disableRipple>
              <DeleteIcon />
              Delete person 
            </MenuItem>
          </StyledMenu>
			  </Grid>
			</Grid>
		  </div>
		  <Divider />
		  <Box sx={{ mt: 3 }}>
        <Grid
          container
          spacing={3}
        >
          <Grid
            item
            xs={12}
          >
            <PersonBasicDetails
              firstName={person.personFirstName}
              lastName={person.personLastName}
              uid={person.personUid}
              mobileNumber={person.personMobileNumber}
              email={person.personEmail}
            />
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
