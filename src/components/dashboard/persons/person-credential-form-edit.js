import { Button, CardContent, CardHeader, Collapse, Divider, Grid, TextField } from "@mui/material"
import ExpandMore from "../shared/expand-more"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useRef, useState } from "react";
import SingleSelect from "../shared/single-select-input";
import Toggle from "../shared/toggle";
import { Add } from "@mui/icons-material";
import { getCredTypeId, getCredTypeName } from "../../../utils/credential-type";
import CredentialEdit from "./credential-edit";

const PersonCredentialEditForm = ({ personId, credInfo, credTypes, credValidations }) => {

    const creds = credInfo.find((p) => p.personId === personId);

    // expanded logic
    const [expanded, setExpanded] = useState(true);
    const onExpandedClick = () => setExpanded(!expanded);

    const [credValidation, setCredValidation] = useState([]);

    //
    


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

    return (
        <>
            <CardHeader
                avatar={
                    <ExpandMore
                        expand={expanded}
                        onClick={onExpandedClick}
                    >
                        <ExpandMoreIcon />
                    </ExpandMore>
                }
                title="Credentials"
                sx={{ width: '100%' }}
            />
            <Divider />
            <CardContent>
                <Collapse in={expanded}>
                    <Grid 
                        container
                        spacing={3}
                    >
                        {
                            credentials.map(cred => {
                                const id = cred.credId;
                                return (
                                    <CredentialEdit
                                        key={id}
                                        onCredTypeChange={onCredTypeChangeFactory(id)}
                                        credTypes={cred.credTypeId === 4 ? originalCredTypes : credTypes}
                                        credential={cred}
                                        removeCredential={removeCredentialFactory(id)}
                                        onCredUidChange={onCredUidChangeFactory(id)}
                                        onCredTTLChange={onCredTTLChangeFactory(id)}
                                        onCredValidChange={onCredValidChangeFactory(id)}
                                        onCredPermChange={onCredPermChangeFactory(id)}
                                        validation={validation}
                                    />
                                )        
                            })                
                        }
                        <Grid item>
                            <Button
                                variant="outlined"
                                startIcon={<Add />}
                                onClick={addCredential}
                            >
                                Add credential
                            </Button>
                        </Grid>
                    </Grid>
                </Collapse>
            </CardContent>
        </>
    )
}

export default PersonCredentialEditForm;