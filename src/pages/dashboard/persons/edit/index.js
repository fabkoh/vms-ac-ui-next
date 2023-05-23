import { Add, ArrowBack } from "@mui/icons-material";
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

  // credTypes
  const [credTypes, setCredTypes] = useState([]);

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
        numberInvalid: false,
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
  useEffect(() => {
    console.log("personsvalidations", personsValidation);
  }, [personsValidation]);

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
        Object.keys(v.credentialSubmitFailed).length > 0)
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

  // returns if personsValidation is changed
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
      // const temp = arrayOfUsedValues.filter(v=>v!=value) //this allows user to set own value again
      // const inUse = temp.includes(value);                //values can thus be swapped which shouldnt be allowed.
      const inUse = arrayOfUsedValues.includes(value);
      const personValidation = personsValidation.find((p) => p.personId == id);
      if (inUse != personValidation[inUseKey]) {
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

  // returns if validArr is changed
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

  // to check if same credUid for not pin is being repeated
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
    console.log(ref.current?.value);
    console.log(typeof ref.current?.value);
    const b1 = checkDuplicatesAndInUseHelper(
      id,
      "personMobileNumber",
      ref.current?.value,
      personMobileNumbers,
      "numberInUse",
      "numberRepeated"
    );

    if (b1) {
      setPersonsValidation([...personsValidation]);
    }
  };

  const onCredTypeChangeFactory = (personId) => (credId) => (e) => {
    const newInfo = [...personsInfo];
    newInfo
      .find((p) => p.personId == personId)
      .credentials.find((cred) => cred.credId == credId).credTypeId =
      e.target.value;
    // console.log("credtypechange",newInfo.find(p => p.personId == personId).credentials.find(cred => cred.credId == credId))
    setPersonsInfo(newInfo);
    const newValidations = [...personsValidation];

    newInfo.forEach((person, i) => {
      newValidations[i].credentialSubmitFailed = {};
    });
    setPersonsValidation(newValidations);
    const b1 = checkCredRepeatedHelper(newInfo, personsValidation);
    const b2 = checkCredUidRepeatedForNotPinTypeCred(
      newInfo,
      personsValidation
    );
    if (b1 || b2) {
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
    const b2 = checkCredUidRepeatedForNotPinTypeCred(
      personsInfo,
      personsValidation
    );
    if (b1 || b2) {
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
                        credTypes={credTypes}
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
