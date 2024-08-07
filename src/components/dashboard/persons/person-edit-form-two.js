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
import { useState, useEffect, useCallback } from "react";
import SingleSelect from "../shared/single-select-input";
import { getAccessGroupLabel } from "../../../utils/access-group";
import { isObject } from "../../../utils/utils";
import { validatePhoneNumber } from "../../../utils/utils";
import PersonCredentialEditForm from "./person-credential-form-edit";
import useCredentialTypes from "../../../hooks/use-credential-types";
import debounce from 'lodash.debounce';

const PersonEditFormTwo = ({
  personId,
  personsInfo,
  credTypes,
  accessGroups,
  updatePersonInfo,
  onClear,
  onValidationChange,
}) => {
  const person = personsInfo.find((p) => p.personId === personId);

  // For validating each Person's individual fields
  const FieldNames = Object.freeze({
    FIRST_NAME: "personFirstName",
    LAST_NAME: "personLastName",
    UID: "personUid",
    MOBILE_NUMBER: "personMobileNumber",
    EMAIL: "personEmail",
    ACCESS_GROUP: "accessGroup",
    CREDENTIALS: "credentials",
  });

  const [isValid, setIsValid] = useState({
    [FieldNames.FIRST_NAME]: { isValid: true, errorMessage: "" },
    [FieldNames.LAST_NAME]: { isValid: true, errorMessage: "" },
    [FieldNames.UID]: { isValid: true, errorMessage: "" },
    [FieldNames.MOBILE_NUMBER]: { isValid: true, errorMessage: "" },
    [FieldNames.EMAIL]: { isValid: true, errorMessage: "" },
    [FieldNames.ACCESS_GROUP]: { isValid: true, errorMessage: "" },
    [FieldNames.CREDENTIALS]: { isValid: true, errorMessage: "" },
  });

  // Allows for helperText to be displayed for each field and checking if form can be submitted
  const updateValidationState = (fieldName, isValid, errorMessage = "") => {
    setIsValid((prevState) => ({
      ...prevState,
      [fieldName]: { isValid, errorMessage },
    }));
  }; 

  const checkValidation = () => {
    const person = personsInfo.find((p) => p.personId === personId);

    // Checks if required fields are empty
    const checkBlank = () => {
      const isBlank = (value) => typeof value === "string" && /^\s*$/.test(value);
      if (!person) {
        return false;
      }

      if (isBlank(person.personFirstName)) {
        updateValidationState(FieldNames.FIRST_NAME, false, "First name cannot be blank");
      } else if (isBlank(person.personLastName)) {
        updateValidationState(FieldNames.LAST_NAME, false, "Last name cannot be blank");
      } else {
        updateValidationState(FieldNames.FIRST_NAME, true);
        updateValidationState(FieldNames.LAST_NAME, true);
      }
    };

    // Checks if there are duplicate fields that are supposed to be unique
    const checkDuplicate = () => {
      personsInfo.forEach((p) => {
        if (p.personId !== personId) { // Skip the current person to avoid self-check
          if (p.personMobileNumber === person.personMobileNumber) {
            updateValidationState(FieldNames.MOBILE_NUMBER, false, "Duplicate mobile number found");
          } else {
            updateValidationState(FieldNames.MOBILE_NUMBER, true);
          }

          if (p.personUid === person.personUid) {
            updateValidationState(FieldNames.UID, false, "Duplicate UID found");
          } else {
            updateValidationState(FieldNames.UID, true);
          }
        }
      });
    };

    const checkValidNumber = () => {
      const number = person.personMobileNumber

      // If the mobile number input is + or +65 (default value), then it is valid (no error message)
      // and the mobile number is treated as empty.
      if (!(number === '+' || number === '+65' || number === null || number === '')) {
        const { isValid, errorMessage } = validatePhoneNumber(number);

        if (isValid) {
          updateValidationState(FieldNames.MOBILE_NUMBER, true);
        } else {
          updateValidationState(FieldNames.MOBILE_NUMBER, false, errorMessage);
        }
      } else {
        updateValidationState(FieldNames.MOBILE_NUMBER, true);
      }
    };

    checkBlank();
    checkDuplicate();
    checkValidNumber();
  };

  // Update validation status to parent component everytime it changes
  useEffect(() => {
    const anyInvalid = Object.values(isValid).some(field => !field.isValid);
    onValidationChange(!anyInvalid);
  }, [isValid]);

  // Forms are checked whenever the personInfo state changes
  useEffect(() => {
    checkValidation();
  }, [personsInfo]);

  const handleFormChange = (fieldName, value) => {
    const newPersons = personsInfo.map((p) =>
      p.personId === personId ? { ...p, [fieldName]: value } : p
    );
    updatePersonInfo(newPersons);
  };

  const debouncedHandleFormChange = useCallback(
    debounce((fieldName, value) => {
      handleFormChange(fieldName, value);
    }, 200), // Adjust the debounce delay as needed
    []
  );

  const handleCredValidationChange = (isValid) => {
    updateValidationState(FieldNames.CREDENTIALS, isValid);
  };

  const handleCredChange = (value) => {
    handleFormChange(FieldNames.CREDENTIALS, value);
  };

  // expanding card logic
  const [expanded, setExpanded] = useState(true);
  const onExpandedClick = () => setExpanded(!expanded);

  return (
    <ErrorCard error={Object.values(isValid).some(field => !field.isValid)}>
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
              onChange={(event) => debouncedHandleFormChange(FieldNames.FIRST_NAME, event.target.value)}
              defaultValue={person.personFirstName}
              required
              error={!isValid[FieldNames.FIRST_NAME].isValid}
              helperText={isValid[FieldNames.FIRST_NAME].errorMessage}
            />
          </Grid>
          <Grid item md={6} xs={12}>
            <TextField
              fullWidth
              label="Last Name"
              name="personLastName"
              onChange={(event) => debouncedHandleFormChange(FieldNames.LAST_NAME, event.target.value)}
              defaultValue={person.personLastName}
              required
              error={!isValid[FieldNames.LAST_NAME].isValid}
              helperText={isValid[FieldNames.LAST_NAME].errorMessage}
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
                    onChange={(event) => debouncedHandleFormChange(FieldNames.UID, event.target.value)}
                    defaultValue={person.personUid}
                    error={!isValid[FieldNames.UID].isValid}
                    helperText={isValid[FieldNames.UID].errorMessage}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <MuiPhoneNumber
                    fullWidth
                    label="Mobile Number"
                    name="personMobileNumber"
                    onChange={(event) => debouncedHandleFormChange(FieldNames.MOBILE_NUMBER, event.target.value)}
                    // Value is unable to handle null and empty strings because Mui is bad, might have to create a new component in the future
                    value={person.personMobileNumber || "+65"}
                    variant="outlined"
                    error={!isValid[FieldNames.MOBILE_NUMBER].isValid}
                    helperText={isValid[FieldNames.MOBILE_NUMBER].errorMessage}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email"
                    name="email"
                    onChange={(event) => debouncedHandleFormChange(FieldNames.EMAIL, event.target.value)}
                    defaultValue={person.personEmail}
                    error={!isValid[FieldNames.EMAIL].isValid}
                    helperText={isValid[FieldNames.EMAIL].errorMessage}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <SingleSelect
                    fullWidth
                    label="Access Group"
                    getLabel={getAccessGroupLabel}
                    onChange={(event) => debouncedHandleFormChange(FieldNames.ACCESS_GROUP, event.target.value)}
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
      {/* <Collapse in={expanded}>
        <Divider />
        <PersonCredentialEditForm
          personId={person.personId}
          personsInfo={personsInfo}
          credTypes={credTypes}
          handleCredChange={handleCredChange}
          handleCredValidationChange={handleCredValidationChange}
        />
      </Collapse> */}
    </ErrorCard>
  );
};

export default PersonEditFormTwo;
