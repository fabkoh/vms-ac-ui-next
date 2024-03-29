import { Add, ArrowBack, Battery3BarSharp } from "@mui/icons-material";
import { Box, Button, Container, Link, Stack, Typography } from "@mui/material";
import Head from "next/head";
import NextLink from "next/link";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import formUtils, {
  createCounterObject,
  createNegativeCounterObject,
  getDuplicates,
} from "../../../../utils/form-utils";
import { getPersonName, personListLink } from "../../../../utils/persons";
import { useCallback, useEffect, useState } from "react";
import { useMounted } from "../../../../hooks/use-mounted";
import { accessGroupApi } from "../../../../api/access-groups";
import { personApi } from "../../../../api/person";
import { arraySameContents, isObject } from "../../../../utils/utils";
import toast from "react-hot-toast";
import router, { useRouter } from "next/router";
import PersonEditFormTwo from "../../../../components/dashboard/persons/person-edit-form-two";
import {
  deleteCredentialApi,
  saveCredentialApi,
  getCredentialWherePersonIdApi,
} from "../../../../api/credentials";
import { getCredTypesApi } from "../../../../api/credential-types";
import { controllerApi } from "../../../../api/controllers";
import { CredTypePinID } from "../../../../utils/constants";
import { serverDownCode } from "../../../../api/api-helpers";
import { ServerDownError } from "../../../../components/dashboard/errors/server-down-error";
import { validatePhoneNumber } from "../../../../utils/utils";

// const getNextId = createCounterObject(0);
const getNextCredId = createNegativeCounterObject(-1);
const getNewCredential = (id) => ({
  credId: id,
  credTypeId: "",
  credUid: "",
  credTTL: null,
  isValid: true,
  isPerm: false,
});

const EditPersonsTwo = () => {
  const router = useRouter();
  const ids = JSON.parse(decodeURIComponent(router.query.ids));

  // stores list of person objects
  const [personsInfo, setPersonsInfo] = useState([]);
  const [personsValidation, setPersonsValidation] = useState([]);

  // access groups for access group select
  const [accessGroups, setAccessGroups] = useState([]);

  // info for checking
  const [personUids, setPersonUids] = useState([]);
  const [personMobileNumbers, setPersonMobileNumbers] = useState([]);
  const [personEmails, setPersonEmails] = useState([]);

  /**
   * credTypes dynamically stores the allowed credTypes for each person
   * 
   * If a person has a PIN credential, then the PIN credential type will be excluded from the credTypes
   * If a person does not have a PIN credential, then the originalCredTypes will be used to render the dropdown selection
   */
  const [credTypes, setCredTypes] = useState([]);
  const [originalCredTypes, setOriginalCredTypes] = useState([]);

  const [serverDownOpen, setServerDownOpen] = useState(false);

  // get info
  const isMounted = useMounted();
  useEffect(() => {
    console.log("personsinfo", personsInfo);
  }, [personsInfo]);

  const getCredTypes = async () => {
    try {
      const res = await getCredTypesApi();
      if (res.status != 200) {
        toast.error("Error loading credential types");
        setCredTypes([]);
        if (res.status == serverDownCode) {
          setServerDownOpen(true);
        }
        return;
      }
      const body = await res.json();
      setOriginalCredTypes(body);
      setCredTypes(body);
    } catch (e) {
      console.error(e);
      toast.error("Error loading credential types");
    }
  };

  const getPersonsLocal = async (ids) => {
    const personsInfoArr = [];
    const validations = [];

    // map each id to a fetch req for that access group
    const resArr = await Promise.all(ids.map((id) => personApi.getPerson(id)));
    const successfulRes = resArr.filter((res) => res.status == 200);

    // no persons to edit
    if (successfulRes.length == 0) {
      toast.error("Error editing persons. Please try again");
      router.replace("/dashboard/persons");
    }

    // some persons not found
    if (successfulRes.length != resArr.length) {
      toast.error("Some persons were not found");
    }

    const resArr2 = await Promise.all(
      ids.map((id) => getCredentialWherePersonIdApi(id))
    );
    const credArr = await Promise.all(resArr2.map((res) => res.json()));
    credArr.forEach((creds) => {
      creds.forEach((cred) => {
        cred.credTypeId = cred.credType.credTypeId;
      });
    });
    // credArr.forEach(cred =>{ cred.credTypeId=cred.credType.credTypeId})
    let credArr2 = JSON.parse(JSON.stringify(credArr));
    const bodyArr = await Promise.all(successfulRes.map((req) => req.json()));
    bodyArr.forEach((body, i) => {
      const credIdArr = [];
      credArr[i].forEach((cred) => credIdArr.push(cred.credId));
      personsInfoArr.push({
        personId: bodyArr[i].personId,
        personFirstName: bodyArr[i].personFirstName,
        personLastName: bodyArr[i].personLastName,
        personUid: bodyArr[i].personUid,
        personMobileNumber: bodyArr[i].personMobileNumber,
        personEmail: bodyArr[i].personEmail,
        personOriginalEmail: bodyArr[i].personEmail,
        personOriginalUid: bodyArr[i].personUid,
        personOriginalMobileNumber: bodyArr[i].personMobileNumber,
        accessGroup: bodyArr[i].accessGroup,
        credentials: credArr[i],
        originalCreds: credArr2[i],
      });
      
      validations.push({
        personId: bodyArr[i].personId,
        firstNameBlank: false,
        lastNameBlank: false,
        uidInUse: false,
        uidRepeated: false,
        uidBlank: false,
        credentialRepeatedIds: [],
        credentialUidRepeatedIds: [],
        credentialSubmitFailed: {},
        credentialPinInvalidLengthIds: [],
        credentialMultiplePins: false,
        numberInvalid: false,
        numberErrorMessage: null,
        // note
        numberInUse: false,
        numberRepeated: false,
        emailInUse: false,
        emailRepeated: false,

        // submit failed
        submitFailed: false,
      });
    });

    setPersonsValidation(validations);
    setPersonsInfo(personsInfoArr);
  };

  const cardError = (v) => {
    return (
      isObject(v) &&
      (v.firstNameBlank ||
        v.lastNameBlank ||
        v.uidInUse ||
        v.uidRepeated ||
        v.uidBlank ||
        v.credentialRepeatedIds.length > 0 ||
        v.credentialUidRepeatedIds.length > 0 ||
        Object.keys(v.credentialSubmitFailed).length > 0 ||
        v.credentialPinInvalidLengthIds.length > 0 ||
        v.numberInUse ||
        v.numberRepeated ||
        v.numberInvalid)
    );
  };

  const getPersons = async () => {
    try {
      const res = await personApi.getPersons();
      if (res.status != 200) {
        toast.error("Error loading person info");
        setPersonUids([]);
        setPersonMobileNumbers([]);
        setPersonEmails([]);
        if (res.status == serverDownCode) {
          setServerDownOpen(true);
        }
        return;
      }
      const body = await res.json();
      setPersonUids(body.map((p) => p.personUid));
      setPersonMobileNumbers(body.map((p) => p.personMobileNumber));
      setPersonEmails(body.map((p) => p.personEmail));
    } catch (e) {
      console.error(e);
    }
  };

  const getAccessGroups = async () => {
    try {
      const res = await accessGroupApi.getAccessGroups();
      if (res.status != 200) {
        toast.error("Error loading access groups");
        setAccessGroups([]);
        if (res.status == serverDownCode) {
          setServerDownOpen(true);
        }
        return;
      }
      const body = await res.json();
      setAccessGroups(body);
    } catch (e) {
      console.error(e);
      toast.error("Error loading access groups");
    }
  };

  const getInfo = useCallback(() => {
    // put methods here
    getPersonsLocal(ids);
    getAccessGroups();
    getPersons();
    getCredTypes();
  }, [isMounted]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(getInfo, []);

  // add / remove person logic
  // const addPerson = () => {
  //     const id = getNextId();
  //     setPersonsInfo([ ...personsInfo, getNewPersonInfo(id) ]);
  //     setPersonsValidation([ ...personsValidation, getNewPersonValidation(id)]);
  // };

  // done like this as putting getNextId in useState causes getNextId to be called
  // an additional time every re-render
  // if (personsInfo.length == 0) {
  //     addPerson();
  // }

  const removePersonFactory = (id) => () => {
    setPersonsInfo(personsInfo.filter((p) => p.personId != id));
    setPersonsValidation(personsValidation.filter((p) => p.personId != id));
    if (personsInfo.length == 1) {
      router.push("/dashboard/persons");
    }
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

  // editing logic
  const changeTextField = (key, id, ref) => {
    // do not use setState to prevent rerender
    personsInfo.find((p) => p.personId === id)[key] = ref.current?.value;
  };

  // returns true if personsValidation is changed
  const blankCheckHelper = (id, key, value) => {
    let isBlank = typeof value === "string" && /^\s*$/.test(value);

    // only update if different
    const personValidation = personsValidation.find((p) => p.personId === id);
    if (isObject(personValidation) && personValidation[key] != isBlank) {
      personValidation[key] = isBlank; // modifies personsValidation, remember to setState after calling this function
      return true;
    }

    return false;
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
    changeTextField("personFirstName", id, ref);
    const b1 = blankCheckHelper(id, "firstNameBlank", ref.current?.value);

    if (b1) {
      setPersonsValidation([...personsValidation]);
    }
  };

  const onPersonLastNameChangeFactory = (id) => (ref) => {
    changeTextField("personLastName", id, ref);
    const b1 = blankCheckHelper(id, "lastNameBlank", ref.current?.value);

    if (b1) {
      setPersonsValidation([...personsValidation]);
    }
  };

  const onPersonUidChangeFactory = (id) => (ref) => {
    changeTextField("personUid", id, ref);

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
    changeTextField("personMobileNumber", id, ref);
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
    changeTextField("personEmail", id, ref);

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

  const submitDisabled =
    personsInfo.length == 0 || personsValidation.some(cardError);

  const [disableSubmit, setDisableSubmit] = useState(false);

  // return true if the person creation was successful
  const createPerson = async (person) => {
    try {
      const res = await personApi.updatePerson(person);
      if (res.status != 200) {
        throw new Error("Unable to update person");
      }
      const body = await res.json();
      const personId = body.personId;
      const newValidations = [...personsValidation];
      const newInfo = [...personsInfo];
      const personValidation = newValidations.find(
        (p) => p.personId == personId
      );
      const personInfo = newInfo.find((p) => p.personId == personId);
      personValidation.credentialSubmitFailed = {}; // reset submit failed error
      // const toDelete = person.credentials.filter(cred=>!person.originalCredId.includes(cred.credId)).filter(credId=>credId>0)
      const newCredIds = person.credentials.map((cred) => cred.credId);
      const toDelete = person.originalCreds.filter(
        (cred) => !newCredIds.includes(cred.credId)
      );

      let hasAnyCredErrors = false;
      const delRes = await Promise.all(
        toDelete.map((cred) => deleteCredentialApi(cred.credId))
      );
      if (delRes.some((res) => res.status != 204)) {
        toast.error("Unable to delete some credentials");
      }
      const credResArr = await Promise.all(
        person.credentials.map((cred, i) =>
          saveCredentialApi(cred, personId, cred.credId < 0)
        )
      );
      let successfulCredArr = credResArr.filter(
        (res) => res.status == 201 || res.status == 200
      );
      let failedCredArr = credResArr.filter((res) => res.status > 201);
      console.log(failedCredArr, "failedCredArr");
      let newCredsToStay = [];
      let credSubmitFailed = {};
      if (failedCredArr.length > 0) {
        // some failed
        hasAnyCredErrors = true;
        for (let i = 0; i < failedCredArr.length; i++) {
          const failedCred = await failedCredArr[i].json();
          console.log(failedCred, "failedCred");
          credSubmitFailed = { ...credSubmitFailed, ...failedCred };
        }
        personValidation.credentialSubmitFailed = credSubmitFailed; // return error format { [credId]: "Error message" }
        toast.error("Unable to create credential for " + getPersonName(body));
      }
      for (let i = 0; i < successfulCredArr.length; i++) {
        let result = await successfulCredArr[i].json();
        result["credTypeId"] = result.credType.credTypeId;
        newCredsToStay.push(result);
      }

      let failedCredIdsArr = Object.keys(credSubmitFailed);
      for (let i = 0; i < personInfo.credentials.length; i++) {
        if (
          failedCredIdsArr.includes(personInfo.credentials[i].credId.toString())
        ) {
          newCredsToStay.push(personInfo.credentials[i]);
        }
      }
      personInfo.credentials = newCredsToStay;
      setPersonsInfo(newInfo);
      setPersonsValidation(newValidations);
      if (hasAnyCredErrors) {
        console.log("personsInfo", personInfo);
        return false;
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setDisableSubmit(true);

    // send res
    try {
      const boolArr = await Promise.all(
        personsInfo.map((p) => createPerson(p))
      );
      console.log("boolArr", boolArr);
      // success toast
      const numSuccess = boolArr.filter((b) => b).length;
      if (numSuccess) {
        toast.success(`Successfully edited ${numSuccess} persons`);
      }

      // if some failed
      if (boolArr.some((b) => !b)) {
        toast.error("Unable to edit persons below");
        // filter failed personsInfo and personsValidation
        setPersonsInfo(personsInfo.filter((p, i) => !boolArr[i]));
        setPersonsValidation(personsValidation.filter((p, i) => !boolArr[i]));
      } else {
        // all success
        router.replace(personListLink);
      }
    } catch {
      toast.error("Unable to submit form");
    }
    setDisableSubmit(false);
  };

  return (
    <>
      <Head>
        <title>Etlas: Edit Persons</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <ServerDownError
              open={serverDownOpen}
              handleDialogClose={() => setServerDownOpen(false)}
            />

            <Button onClick={() => router.back()} variant="subtitle2">
              <ArrowBack fontSize="small" sx={{ mr: 1 }} />
              Back
            </Button>
          </Box>
          <Stack spacing={3}>
            <div>
              <Typography variant="h3">Edit Persons</Typography>
            </div>
            <form onSubmit={submitForm}>
              <Stack spacing={3}>
                {Array.isArray(personsInfo) &&
                  personsInfo.map((p, i) => {
                    const id = p.personId;
                    return (
                      <PersonEditFormTwo
                        key={id}
                        onClear={removePersonFactory(id)}
                        person={p}
                        onPersonFirstNameChange={onPersonFirstNameChangeFactory(
                          id
                        )}
                        onPersonLastNameChange={onPersonLastNameChangeFactory(
                          id
                        )}
                        onPersonUidChange={onPersonUidChangeFactory(id)}
                        onPersonMobileNumberChange={onPersonMobileNumberChangeFactory(
                          id
                        )}
                        onPersonEmailChange={onPersonEmailChangeFactory(id)}
                        accessGroups={accessGroups}
                        handleAccessGroupChange={onAccessGroupChangeFactory(id)}
                        validation={personsValidation[i]}
                        cardError={cardError}
                        addCredential={addCredentialFactory(id)}
                        removeCredentialFactory={removeCredentialFactory(id)}
                        // To differentiate the credential entry that has Pin from the others
                        credTypes={credTypes}
                        originalCredTypes={originalCredTypes}
                        onCredTypeChangeFactory={onCredTypeChangeFactory(id)}
                        onCredUidChangeFactory={onCredUidChangeFactory(id)}
                        onCredTTLChangeFactory={onCredTTLChangeFactory(id)}
                        onCredValidChangeFactory={onCredValidChangeFactory(id)}
                        onCredPermChangeFactory={onCredPermChangeFactory(id)}
                      />
                    );
                  })}

                <div>
                  <Button
                    size="large"
                    type="submit"
                    sx={{ mr: 3 }}
                    variant="contained"
                    disabled={submitDisabled || disableSubmit}
                  >
                    Submit
                  </Button>
                  <Button
                    size="large"
                    sx={{ mr: 3 }}
                    variant="outlined"
                    color="error"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </div>
              </Stack>
            </form>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

EditPersonsTwo.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default EditPersonsTwo;
