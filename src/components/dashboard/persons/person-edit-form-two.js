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
import CredentialEditForm from "./credential-form-edit";
import useCredentialTypes from "../../../hooks/use-credential-types";
import debounce from 'lodash.debounce';

const PersonEditFormTwo = ({
  personId,
  personsInfo,
  accessGroups,
  updatePersonInfo,
  onClear,
  onValidationChange,
}) => {
  const person = personsInfo.find((p) => p.personId === personId);

  // Dynamically adjust credType options to user
  // const [setCredTypes, credTypes, originalCredTypes] = useCredentialTypes(serverDownCode, setServerDownOpen);

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

  //add / remove credential logic
  const addCredentialFactory = (personId) => () => {
    const newPersons = [...personsInfo];
    newPersons
      .find((p) => p.personId == personId)
      .credentials.push(getNewCredential(getNextCredId()));
    setPersonsInfo(newPersons);
  };

  const removeCredentialFactory = (personId) => (credId) => () => {
    const newPersons = [...personsInfo];
    const person = newPersons.find((p) => p.personId == personId);
    person.credentials = person.credentials.filter((c) => c.credId != credId);
    setPersonsInfo(newPersons);
    const newValidations = [...personsValidation];

    newPersons.forEach((person, i) => {
      newValidations[i].credentialSubmitFailed = {};
    });
    setPersonsValidation(newValidations);

    const b1 = checkCredRepeatedHelper(newPersons, personsValidation);
    const b2 = checkCredUidRepeatedForNotPinTypeCred(
      newPersons,
      personsValidation
    );
    if (b1 || b2) {
      setPersonsValidation([...personsValidation]);
    }
  };

  /** 
   * Checks for duplicates in credentials based on a combination of credTypeId and credUid for each person.
   * 
   * @param {object[]} infoArr
   * @param {object[]} validArr
   * @returns {boolean} true if the validation state is changed, false otherwise
   */
  const checkCredRepeatedHelper = (infoArr, validArr) => {
    let toChange = false;

    const credMap = {}; // maps credTypeId to array of credUid
    const repeatedCred = []; // array of [credTypeId, credUid]
    infoArr.forEach((person) =>
      person.credentials.forEach((cred) => {
        const credTypeId = cred.credTypeId;
        const uid = cred.credUid;
        if (credTypeId != "" && uid != "" && credTypeId != CredTypePinID) {
          if (!(credTypeId in credMap)) {
            credMap[credTypeId] = [];
          }
          const arr = credMap[credTypeId];
          if (arr.some((e) => e == uid)) {
            repeatedCred.push([credTypeId, uid]);
          } else {
            arr.push(uid);
          }
        }
      })
    );

    infoArr.forEach((person, i) => {
      const repeatedCredIds = [];
      person.credentials.forEach((cred) => {
        if (
          repeatedCred.some(
            (c) => c[0] == cred.credTypeId && c[1] == cred.credUid
          )
        ) {
          repeatedCredIds.push(cred.credId);
        }
      });
      if (
        !arraySameContents(repeatedCredIds, validArr[i].credentialRepeatedIds)
      ) {
        toChange = true;
        validArr[i].credentialRepeatedIds = repeatedCredIds;
      }
    });

    return toChange;
  };

  /**
   * Checks for duplicates of credential UIDs (credUid) across all persons
   * 
   * @param {object[]} infoArr
   * @param {object[]} validArr
   * @returns {boolean} true if the validation state is changed, false otherwise
   */
  const checkCredUidRepeatedForNotPinTypeCred = (infoArr, validArr) => {
    let toChange = false;

    const credMap = {}; // maps credUidto array of a list of [persons id, cred id]
    const repeatedCredUidCredIds = [];
    infoArr.forEach((person, i) => {
      person.credentials.forEach((cred) => {
        const credTypeId = cred.credTypeId;
        const uid = cred.credUid;
        if (credTypeId != "" && uid != "" && credTypeId != CredTypePinID) {
          if (!(uid in credMap)) {
            credMap[uid] = [person.personUid, cred.credId];
          } else {
            credMap[uid].push([person.personUid, cred.credId]);
            repeatedCredUidCredIds.push(cred.credId);
          }
        }
      });

      if (
        !arraySameContents(
          repeatedCredUidCredIds,
          validArr[i].credentialUidRepeatedIds
        )
      ) {
        toChange = true;
        validArr[i].credentialUidRepeatedIds = repeatedCredUidCredIds;
      }
    });

    return toChange;
  };

  /**
   * Checks if there is only one valid (4-6 digits) PIN per person and updates the validation state accordingly
   * 
   * @param {object[]} infoArr
   * @param {object[]} validArr
   * @returns {boolean} true if the validation state is changed, false otherwise
   */
  const checkPinCredValidity = (infoArr, validArr) => {
    const pinTypeId = 4; // 4 is the ID for PIN type credentials
    let toChange = false;

    infoArr.forEach((person, i) => {
      const pinCreds = person.credentials.filter(cred => cred.credTypeId === pinTypeId);

      // Collect IDs of PIN credentials with invalid length
      const invalidPinCredIds = pinCreds
        .filter(cred => cred.credUid.length < 4 || cred.credUid.length > 6)
        .map(cred => cred.credId);

      // Check if there are any invalid PIN credentials
      if (invalidPinCredIds.length > 0) {
        validArr[i].credentialPinInvalidLengthIds = invalidPinCredIds;
        toChange = true;
      } else {
        // Reset the state if previously marked as invalid
        if (validArr[i].credentialPinInvalidLengthIds && validArr[i].credentialPinInvalidLengthIds.length > 0) {
          validArr[i].credentialPinInvalidLengthIds = [];
          toChange = true;
        }
      }
    });

    return toChange;
  };

  const PIN_CRED_TYPE = { id: 4, name: 'Pin' };

  const hasPinCred = (personCredentials) => {
    return personCredentials.some(cred => cred.credTypeId === PIN_CRED_TYPE.id);
  };

  /**
   * Updates the credential validity state and credTypes when credType changes
   * 
   * @param {number} personId
   * @param {number} credId
   * @returns {function} event handler
   */
  const onCredTypeChangeFactory = (personId) => (credId) => (e) => {
    const newInfo = [...personsInfo];
    const person = newInfo.find(p => p.personId === personId);
    const cred = person.credentials.find(cred => cred.credId === credId);

    cred.credTypeId = e.target.value;

    // Update credTypes based on the existence of a pin cred
    const hasPin = hasPinCred(person.credentials);
    if (hasPin) {
        // Exclude pin type if a pin cred already exists
        setCredTypes(credTypes.filter(credType => credType.credTypeId !== PIN_CRED_TYPE.id));
    } else {
        // Include pin type if no pin cred exists
        setCredTypes(originalCredTypes);
    }

    setPersonsInfo(newInfo);

    // Reset and update validations
    const newValidations = [...personsValidation];
    newInfo.forEach((person, i) => {
        newValidations[i].credentialSubmitFailed = {};
    });

    const b1 = checkCredRepeatedHelper(newInfo, personsValidation);
    const b2 = checkCredUidRepeatedForNotPinTypeCred(newInfo, personsValidation);
    const b3 = checkPinCredValidity(newInfo, personsValidation);

    if (b1 || b2 || b3) {
        setPersonsValidation([...personsValidation]);
    }
  };

  const onCredUidChangeFactory = (personId) => (credId) => (ref) => {
    // personsInfo.find(p => p.personId == personId).credentials.find(cred => cred.credId == credId).credUid = ref;
    personsInfo
      .find((p) => p.personId == personId)
      .credentials.find((cred) => cred.credId == credId).credUid =
      ref.current?.value;
    // console.log("uidchange,originalcreds?",personsInfo.find(p => p.personId == personId).originalCreds)

    const newValidations = [...personsValidation];

    personsInfo.forEach((person, i) => {
      newValidations[i].credentialSubmitFailed = {};
    });
    setPersonsValidation(newValidations);

    const b1 = checkCredRepeatedHelper(personsInfo, personsValidation);
    const b2 = checkCredUidRepeatedForNotPinTypeCred(personsInfo, personsValidation);
    const b3 = checkPinCredValidity(personsInfo, personsValidation);
    if (b1 || b2 || b3) {
      setPersonsValidation([...personsValidation]);
    }
  };

  const onCredValidChangeFactory = (personId) => (credId) => (bool) => {
    personsInfo
      .find((p) => p.personId == personId)
      .credentials.find((cred) => cred.credId == credId).isValid = bool;
  };

  const onCredPermChangeFactory = (personId) => (credId) => (bool) => {
    personsInfo
      .find((p) => p.personId == personId)
      .credentials.find((cred) => cred.credId == credId).isPerm = bool;
  };

  const onCredTTLChangeFactory = (personId) => (credId) => (dateObj) => {
    console.log(dateObj);
    personsInfo
      .find((p) => p.personId == personId)
      .credentials.find((cred) => cred.credId == credId).credTTL = dateObj;
  };

  const debouncedHandleFormChange = useCallback(
    debounce((fieldName, value) => {
      handleFormChange(fieldName, value);
    }, 200), // Adjust the debounce delay as needed
    []
  );

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
      <Collapse in={expanded}>
        <Divider />
        <CredentialEditForm
          credentials={person.credentials}
          addCredential={addCredential}
          removeCredentialFactory={removeCredentialFactory}
          credTypes={credTypes}
          originalCredTypes={originalCredTypes}
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
