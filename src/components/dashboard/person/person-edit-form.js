import React, { useState } from 'react';
import {
	Card, 
  CardHeader, 
  Button, 
  Divider, 
  Grid, 
  TextField, 
  CardContent,
  Collapse
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import IconButton from '@mui/material/IconButton';
import { Confirmdelete } from '../persons/Confirmdelete';
import { personApi } from '../../../api/person';
import toast from 'react-hot-toast';

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const useStyles = makeStyles({
  root: {
    border: '1px solid #D14343'
  }
});
export const PersonEditForm = (props) => {
	const { 
    person, 
    removePerson, 
    onNameChange,
    onNumberChange,
    onEmailChange,
    onUidChange
  } = props;
  const [expanded, setExpanded] = useState(true);

  const handleExpandClick = () => setExpanded(!expanded);

  const errorStyle = useStyles();

  //form handling functions : delete person directly with delete action button
	const [deleteOpen, setDeleteOpen] = React.useState(false);

  const handleDeleteOpen = () => {
		setDeleteOpen(true);
    console.log(deleteOpen);
	};
	const handleDeleteClose = () => {
		setDeleteOpen(false);
	};

  async function handleDeleteAction() {
		setDeleteOpen(false);
		// personApi.deletePerson(selectedPersons);
  
    if (personApi.deletePerson(person.id)) {
      toast.success("Delete success");
      
      removePerson(person.id)
    } else {
      toast.error("Delete unsuccessful for" + id);
    }
		}
  
  //anchor is for menu item on list. Added here for deleting single person
  //on the edit form to prevent errors. ensures <Confirmdelete> is reusable.
  const [AnchorEl, setAnchorEl] = useState(true);

	return (
		<Card
      className={ 
        (person.valid.firstName &&
         person.valid.lastName &&
         person.valid.uidNotRepeated &&
         person.valid.uidNotInUse &&
         person.valid.mobileNumber &&
         person.valid.email &&
         person.valid.submitOk) ||
        errorStyle.root
      }
    >
      <CardHeader
        avatar={
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
          >
            <ExpandMoreIcon />
          </ExpandMore>
        }
        title="Person"
        action={
          <div>
          <Button
            variant="outlined"
            color="error"
            onClick={() => removePerson(person.id)}
            sx={{m:1}}
          >
            Remove
          </Button>
          <Button
          variant="contained"
          color="error"
          onClick={handleDeleteOpen}
          sx={{}}
        >
          Delete
        </Button>
        <Confirmdelete setAnchorEl={setAnchorEl} deleteOpen={deleteOpen} handleDeleteClose={handleDeleteClose}
			handleDeleteAction={handleDeleteAction}
			handleDeleteOpen={handleDeleteOpen}/>
        </div>
        } 
        sx={{ width: '100%' }} 
      />
      <Divider />
      <CardContent>
        <Grid
          container
          spacing={3}
        >
          <Grid
            item
            md={6}
            xs={12}
          >
            <TextField
              fullWidth
              error={!person.valid.firstName}
              helperText={person.valid.firstName || "First Name must not be blank"}
              label="First Name"
              name="firstName"
              onChange={(e) => onNameChange(e, person.id)}
              value={person.firstName}
              required
            />
          </Grid>
          <Grid
            item
            md={6}
            xs={12}
          >
            <TextField
              fullWidth
              error={!person.valid.lastName}
              helperText={person.valid.lastName || "Last Name must not be blank"}
              label="Last Name"
              name="lastName"
              onChange={(e) => onNameChange(e, person.id)}
              value={person.lastName}
              required
            />
          </Grid>
          <Grid
            item
            md={12}
            xs={12}
          >
            <Collapse in={expanded}>
              <Grid
              container
              spacing={3}
              >
                <Grid
                  item
                  md={6}
                  xs={12}
                >
                  <TextField
                    fullWidth
                    error={!(person.valid.uidNotRepeated && person.valid.uidNotInUse)}
                    helperText={(person.valid.uidNotRepeated && person.valid.uidNotInUse) || "UID taken"}
                    label="UID"
                    name="uid"
                    onChange={(e) => onUidChange(e, person.id)}
                    value={person.uid}
                  />
                </Grid>
                <Grid
                  item
                  md={6}
                  xs={12}
                >
                  <TextField
                    fullWidth
                    error={!person.valid.mobileNumber}
                    helperText={person.valid.mobileNumber || 'Mobile number must be in the format "+{code} {number}"'}
                    label="Mobile Number"
                    name="mobileNumber"
                    onChange={(e) => onNumberChange(e, person.id)}
                    value={person.mobileNumber}
                  />
                </Grid>
                <Grid
                  item
                  md={6}
                  xs={12}
                >
                  <TextField
                    fullWidth
                    error={!person.valid.email}
                    helperText={person.valid.email || "Email is not valid"}
                    label="Email"
                    name="email"
                    onChange={(e) => onEmailChange(e, person.id)}
                    value={person.email}
                  />
                </Grid>
              </Grid>
            </Collapse>
          </Grid>
        </Grid>
      </CardContent>
		</Card>
	)
}