import { useState } from 'react';
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
import { ThemeProvider, createTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';

import MuiPhoneNumber from "material-ui-phone-number";

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

//change the warning colour to amber for mobileNumber & email
const theme = createTheme({
  palette: {
    error: {
      main: '#ed6c02'
    },
  },
});

export const PersonAddForm = (props) => {
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

	return (
		<Card
      className={ 
        (person.valid.firstName &&
         person.valid.lastName &&
         person.valid.uidNotRepeated &&
         person.valid.uidNotInUse &&
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
          <Button
            variant="outlined"
            color="error"
            onClick={() => removePerson(person.id)}
          >
            Remove
          </Button>
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
                    helperText={!(person.valid.uidNotRepeated && person.valid.uidNotInUse) ? "Error: Unique ID already exists" : "Company Unique Identifier Number. Auto-generated if empty."}
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
                  <ThemeProvider theme={theme}>
                    <MuiPhoneNumber
                      fullWidth
                      error={!(person.valid.mobileNumberNotRepeated && person.valid.mobileNumberNotInUse)}
                      helperText={!(person.valid.mobileNumberNotRepeated && person.valid.mobileNumberNotInUse) ? "Note: Mobile Number already exists" : person.valid.mobileNumber}
                      name="mobileNumber"
                      label="Mobile Number"
                      defaultCountry={"sg"}
                      onChange={(e) => onNumberChange(e, person.id)}
                      value={person.mobileNumber}
                      variant="outlined"
                    />
                  </ThemeProvider>
                </Grid>
                <Grid
                  item
                  md={6}
                  xs={12}
                >
                  <ThemeProvider theme={theme}>
                    <TextField
                      fullWidth
                      error={!person.valid.email || !(person.valid.emailNotRepeated && person.valid.emailNotInUse)}
                      helperText={!person.valid.email ? 'Error: Email is not valid' : !(person.valid.emailNotRepeated && person.valid.emailNotInUse) ? "Note: Email Address already exists" : person.valid.email}
                      label="Email"
                      name="email"
                      onChange={(e) => onEmailChange(e, person.id)}
                      value={person.email}
                    />
                  </ThemeProvider>
                </Grid>
              </Grid>
            </Collapse>
          </Grid>
        </Grid>
      </CardContent>
		</Card>
	)
}