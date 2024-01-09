import {
  Button,
  CardContent,
  CardHeader,
  Collapse,
  Divider,
  Grid,
  TextField,
} from "@mui/material";
import ErrorCard from "../shared/error-card";
import ExpandMore from "../shared/expand-more";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MuiPhoneNumber from "material-ui-phone-number";
import { useState, useRef, useEffect } from "react";
import SingleSelect from "../shared/single-select-input";
import { getAccessGroupLabel } from "../../../utils/access-group";
import { isObject } from "../../../utils/utils";
import CredentialEditForm from "./credential-form-edit";

const PersonEditFormTwo = ({
  onClear,
  person,
  onPersonFirstNameChange,
  onPersonLastNameChange,
  onPersonMobileNumberChange,
  onPersonUidChange,
  onPersonEmailChange,
  accessGroups,
  handleAccessGroupChange,
  validation,
  cardError,
  addCredential,
  removeCredentialFactory,
  credTypes,
  onCredTypeChangeFactory,
  onCredUidChangeFactory,
  onCredTTLChangeFactory,
  onCredValidChangeFactory,
  onCredPermChangeFactory,
}) => {
  // update logic
  const personFirstNameRef = useRef(person.personFirstName);
  const personLastNameRef = useRef(person.personLastName);
  const personUidRef = useRef(person.personUid);
  const personMobileNumberRef = useRef(person.personMobileNumber);
  const personEmailRef = useRef(person.personEmail);

  const handlePersonFirstNameChange = (e) => {
    e.preventDefault();
    onPersonFirstNameChange(personFirstNameRef);
  };

  const handlePersonLastNameChange = (e) => {
    e.preventDefault();
    onPersonLastNameChange(personLastNameRef);
  };

  const handlePersonUidChange = (e) => {
    e.preventDefault();
    onPersonUidChange(personUidRef);
  };

  const handlePersonMobileNumberChange = () =>
    onPersonMobileNumberChange(personMobileNumberRef);

  const handlePersonEmailChange = (e) => {
    e.preventDefault();
    onPersonEmailChange(personEmailRef);
  };

  useEffect(() => {
    console.log("mobile number", person.personMobileNumber);
  }, []);

  // expanding card logic
  const [expanded, setExpanded] = useState(true);
  const onExpandedClick = () => setExpanded(!expanded);

  return (
    <ErrorCard error={cardError(validation)}>
      <CardHeader
        avatar={
          <ExpandMore expand={expanded} onClick={onExpandedClick}>
            <ExpandMoreIcon />
          </ExpandMore>
        }
        title="Person"
        action={
          <Button variant="outlined" color="error" onClick={onClear}>
            Clear
          </Button>
        }
        sx={{ width: "100%" }}
      />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item md={6} xs={12}>
            <TextField
              fullWidth
              label="First Name"
              name="personFirstName"
              inputProps={{ ref: personFirstNameRef }}
              onChange={handlePersonFirstNameChange}
              defaultValue={person.personFirstName}
              required
              error={validation.firstNameBlank}
              helperText={
                validation.firstNameBlank && "Error: first name cannot be blank"
              }
            />
          </Grid>
          <Grid item md={6} xs={12}>
            <TextField
              fullWidth
              label="Last Name"
              name="personLastName"
              inputProps={{ ref: personLastNameRef }}
              onChange={handlePersonLastNameChange}
              defaultValue={person.personLastName}
              required
              error={validation.lastNameBlank}
              helperText={
                validation.lastNameBlank && "Error: last name cannot be blank"
              }
            />
          </Grid>
          <Grid item md={12} xs={12}>
            <Collapse in={expanded}>
              <Grid container spacing={3}>
                <Grid item md={6} xs={12}>
                  <TextField
                    fullWidth
                    label="UID"
                    name="personUid"
                    inputProps={{ ref: personUidRef }}
                    onChange={handlePersonUidChange}
                    defaultValue={person.personUid}
                    error={
                      validation.uidInUse ||
                      validation.uidRepeated ||
                      validation.uidBlank
                    }
                    helperText={
                      (validation.uidInUse && "Error: uid taken") ||
                      (validation.uidRepeated &&
                        "Error: duplicate uid in form") ||
                      (validation.uidBlank && "Error: uid must not be blank")
                    }
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <MuiPhoneNumber
                    fullWidth
                    label="Mobile Number"
                    name="personMobileNumber"
                    onChange={handlePersonMobileNumberChange}
                    inputProps={{ ref: personMobileNumberRef }}
                    // Value is unable to handle null and empty strings because Mui is bad, might have to create a new component in the future
                    value={person.personMobileNumber || "+65"}
                    variant="outlined"
                    error={
                      validation.numberInvalid ||
                      validation.numberInUse ||
                      validation.numberRepeated
                    }
                    helperText={
                      (validation.numberInUse && "Error: number taken") ||
                      (validation.numberInvalid &&
                        `Error: ${validation.numberErrorMessage || "invalid phone number"}`) ||
                      (validation.numberRepeated &&
                        "Error: duplicate number in form")
                    }
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email"
                    name="email"
                    inputProps={{ ref: personEmailRef }}
                    onChange={handlePersonEmailChange}
                    defaultValue={person.personEmail}
                    helperText={
                      (validation.emailInUse && "Note: email taken") ||
                      (validation.emailRepeated &&
                        "Note: duplicate email in form")
                    }
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <SingleSelect
                    fullWidth
                    label="Access Group"
                    getLabel={getAccessGroupLabel}
                    onChange={handleAccessGroupChange}
                    value={
                      isObject(person.accessGroup)
                        ? person.accessGroup.accessGroupId
                        : ""
                    }
                    options={accessGroups}
                    getValue={(accessGroup) => accessGroup.accessGroupId}
                  />
                </Grid>
              </Grid>
            </Collapse>
          </Grid>
        </Grid>
      </CardContent>
      <Collapse in={expanded}>
        <Divider />
        <CredentialEditForm
          credentials={person.credentials}
          addCredential={addCredential}
          removeCredentialFactory={removeCredentialFactory}
          credTypes={credTypes}
          onCredTypeChangeFactory={onCredTypeChangeFactory}
          onCredUidChangeFactory={onCredUidChangeFactory}
          onCredTTLChangeFactory={onCredTTLChangeFactory}
          onCredValidChangeFactory={onCredValidChangeFactory}
          onCredPermChangeFactory={onCredPermChangeFactory}
          validation={validation}
        />
      </Collapse>
    </ErrorCard>
  );
};

export default PersonEditFormTwo;
