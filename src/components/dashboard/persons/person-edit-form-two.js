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
import useCredentialTypes from "../../../hooks/use-credential-types";

// need person/personID
// need usePerson (?)
const PersonEditFormTwo = ({
  onClear,
  person,
  updatePersonInfo={updatePersonInfo},
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

  // Dynamically adjust credType options to user
  const [setCredTypes, credTypes, originalCredTypes] = useCredentialTypes(serverDownCode, setServerDownOpen);

  // For validating each Person's individual fields
  const FieldNames = Object.freeze({
    FIRST_NAME: "firstName",
    LAST_NAME: "lastName",
    UID: "uid",
    MOBILE_NUMBER: "mobileNumber",
    EMAIL: "email",
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
  
  // Forms are check whenever the personInfo state changes
  useEffect(() => {
    checkValidation();
  }, [personInfo]);

  const checkValidation = () => {
    const newValidation = { ...isValid };
  }

  const handleFormChange = (fieldName, value) => {
    // Update the specific field in personsInfo
    updatePersonInfo(personId, fieldName, value);
  };

  const handleFormChange = (personId, key, value) => {
    // Update the specific field in personsInfo
    updatePersonsInfo(key, id, ref);

    // Check for blanks
    if (["personFirstName", "personLastName", "personUid"].includes(key)) {
      blankCheckHelper(id, `${key}Blank`, ref.current?.value);
    }

    // Check for duplicates and in use
    if (["personUid", "personMobileNumber", "personEmail"].includes(key)) {
      let arrayOfUsedValues = [];
      let inUseKey = "";
      let duplicateKey = "";

      switch (key) {
        case "personUid":
          arrayOfUsedValues = personUids;
          inUseKey = "uidInUse";
          duplicateKey = "uidRepeated";
          break;
        case "personMobileNumber":
          arrayOfUsedValues = personMobileNumbers;
          inUseKey = "numberInUse";
          duplicateKey = "numberRepeated";
          break;
        case "personEmail":
          arrayOfUsedValues = personEmails;
          inUseKey = "emailInUse";
          duplicateKey = "emailRepeated";
          break;
        default:
          break;
      }

      checkDuplicatesAndInUseHelper(
        id,
        key,
        ref.current?.value,
        arrayOfUsedValues,
        inUseKey,
        duplicateKey,
        `${key}Original`
      );
    }

  // Check for invalid mobile number
  if (key === "personMobileNumber") {
    checkInvalidNumberHelper(
      id,
      ref.current?.value,
      "numberInvalid",
      personsValidation
    );
  }

  // Update state (if any validation has changed within the helper functions)
  setPersonsValidation([...personsValidation]);
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
   * Checks if the value is in use or is a duplicate and updates the validation state accordingly
   * Currently allows swapping of phone numbers within the same edit form
   * 
   * @param {number} id
   * @param {string} key
   * @param {string} value
   * @param {string[]} arrayOfUsedValues
   * @param {string} inUseKey
   * @param {string} duplicateKey
   * @param {string} originalKey
   * @returns {boolean} true if the validation state is changed, false otherwise
   */
  const checkDuplicatesAndInUseHelper = (
    id,
    key,
    value,
    arrayOfUsedValues,
    inUseKey,
    duplicateKey,
    originalKey
  ) => {
    let toChange = false;

    if (value != "") {
      const inUse = arrayOfUsedValues.includes(value);
      const personValidation = personsValidation.find((p) => p.personId == id);
      const personInfo = personsInfo.find((p) => p.personId == id);

      console.log(value);
      
      // second condition prevents user from not being able to change back to original value
      if (inUse != personValidation[inUseKey] && personInfo.personMobileNumber != value) {
        personValidation[inUseKey] = inUse;
        toChange = true;
      }
    }
    const duplicateKeys = getDuplicates(personsInfo.map((p) => p[key]));

    personsInfo.forEach((p, i) => {
      const v = p[key];
      const b = v != "" && v in duplicateKeys; // ignores empty strings
      if (personsValidation[i][duplicateKey] != b) {
        personsValidation[i][duplicateKey] = b;
        toChange = true;
      }
    });

    return toChange;
  };

  /**
   * Checks if the number is valid and updates the validation state accordingly
   * 
   * @param {number} personId
   * @param {string} number
   * @param {string} key
   * @param {object[]} validArr
   * @returns {boolean} true if the validation state is changed, false otherwise
   */
  const checkInvalidNumberHelper = (personId, number, key, validArr) => {
    const personValidation = validArr.find((p) => p.personId === personId);
    if (!isObject(personValidation)) {
        return false;
    }

    // If the mobile number input is + or +65 (default value), then it is valid (no error message) and the mobile number is treated as empty.
    // Currently when you try to delete the digits individually to reach +, it will by default cycle to +65
    if (number === '+' || number === '+65') {
      if (personValidation[key] !== false || personValidation.numberErrorMessage !== null) {
          personValidation[key] = false; // Mark as valid
          personValidation.numberErrorMessage = null; // Clear any existing error message
          return true; // Indicates a change in the validation state
      }
      return false; // No change needed
    }

    const { isValid, errorMessage } = validatePhoneNumber(number);
    const isInvalid = !isValid;

    // Determine if there's a change in either the validation state or the error message
    const isStateChanged = personValidation[key] !== isInvalid;
    const isErrorMessageChanged = personValidation.numberErrorMessage !== errorMessage;

    // Update if there's a change in the state or the error message
    if (isStateChanged || isErrorMessageChanged) {
        personValidation[key] = isInvalid;
        personValidation.numberErrorMessage = isInvalid ? errorMessage : null;
        return true; // Indicates a change
    }

    return false; // No change
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
      // console.log("repeatedCredIds",repeatedCredIds)
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

  const onPersonFirstNameChangeFactory = (id) => (ref) => {
    updatePersonsInfo("personFirstName", id, ref);
    const b1 = blankCheckHelper(id, "firstNameBlank", ref.current?.value);

    if (b1) {
      setPersonsValidation([...personsValidation]);
    }
  };

  const onPersonLastNameChangeFactory = (id) => (ref) => {
    updatePersonsInfo("personLastName", id, ref);
    const b1 = blankCheckHelper(id, "lastNameBlank", ref.current?.value);

    if (b1) {
      setPersonsValidation([...personsValidation]);
    }
  };

  const onPersonUidChangeFactory = (id) => (ref) => {
    updatePersonsInfo("personUid", id, ref);

    const b1 =
      checkDuplicatesAndInUseHelper(
        id,
        "personUid",
        ref.current?.value,
        personUids,
        "uidInUse",
        "uidRepeated"
      ) || blankCheckHelper(id, "uidBlank", ref.current?.value);

    if (b1) {
      setPersonsValidation([...personsValidation]);
    }
  };

  const onPersonMobileNumberChangeFactory = (id) => (ref) => {
    updatePersonsInfo("personMobileNumber", id, ref);
    const b1 = checkDuplicatesAndInUseHelper(
      id,
      "personMobileNumber",
      ref.current?.value,
      personMobileNumbers,
      "numberInUse",
      "numberRepeated"
    );
    const b2 = checkInvalidNumberHelper(
      id,
      ref.current?.value,
      "numberInvalid",
      personsValidation,
      personsInfo
    );

    if (b1 || b2) {
      setPersonsValidation([...personsValidation]);
    }
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

  const onPersonEmailChangeFactory = (id) => (ref) => {
    updatePersonsInfo("personEmail", id, ref);

    const b1 = checkDuplicatesAndInUseHelper(
      id,
      "personEmail",
      ref.current?.value,
      personEmails,
      "emailInUse",
      "emailRepeated"
    );

    if (b1) {
      setPersonsValidation([...personsValidation]);
    }
  };

  const onAccessGroupChangeFactory = (id) => (e) => {
    const newInfo = [...personsInfo];
    const value = e.target.value;
    if (value == null) {
      newInfo.find((p) => p.personId === id).accessGroup = value;
    } else {
      newInfo.find((p) => p.personId === id).accessGroup = accessGroups.find(
        (group) => group.accessGroupId === value
      );
    }
    setPersonsInfo(newInfo);
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
              onChange={(event) => handleFormChange(FieldNames.FIRST_NAME, event.target.value)}
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
