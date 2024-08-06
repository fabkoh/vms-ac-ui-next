import { ArrowBack, } from "@mui/icons-material";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import Head from "next/head";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import {
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
import { useRouter } from "next/router";
import PersonEditFormTwo from "../../../../components/dashboard/persons/person-edit-form-two";
import {
  deleteCredentialApi,
  saveCredentialApi,
  getCredentialWherePersonIdApi,
  getCredentialsApi,
} from "../../../../api/credentials";

import { CredTypePinID } from "../../../../utils/constants";
import { serverDownCode } from "../../../../api/api-helpers";
import { ServerDownError } from "../../../../components/dashboard/errors/server-down-error";
import { validatePhoneNumber } from "../../../../utils/utils";
import usePersons from "../../../../hooks/use-persons-list";

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
  const isMounted = useMounted();

  // Gets list of persons that are selected to be edited
  const personIds = JSON.parse(decodeURIComponent(router.query.ids));
  const [personIdsState, setPersonIdsState] = useState(personIds);

  const [serverDownOpen, setServerDownOpen] = useState(false);

  // Contains all personsInfo to check for duplicates and etc.
  const [personsInfo, setPersonsInfo] = useState([]);
  const [personsValidation, setPersonsValidation] = useState([]);

  // Original details of the selected persons to allow for revert when cleared from the form
  const [originalSelectedPersonsInfo, setOriginalSelectedPersonsInfo] = useState([]);

  useEffect(() => {
    console.log("originalSelectedPersonsInfo", originalSelectedPersonsInfo);
    console.log("personsInfo", personsInfo);
  }, [originalSelectedPersonsInfo]);

  const [isButtonDisabled, setButtonDisabled] = useState(false);

  // Function to update the personsInfo state, passed down to PersonEditFormTwo
  const updatePersonInfo = (newInfo) => {
    setPersonsInfo(newInfo);
  };

  // access groups for access group select
  const [accessGroups, setAccessGroups] = useState([]);

  const getPersonsWithCred = async () => {
    try {
      // Get Persons
      const res = await personApi.getPersons();
      if (res.status != 200) {
        toast.error("Error loading person info");
        setPersonsInfo([]);
        if (res.status == serverDownCode) {
          setServerDownOpen(true);
        }
        return;
      }
      const persons = await res.json();

      // Get Credentials
      const res2 = await getCredentialsApi();
      if (res2.status != 200) {
        toast.error("Error loading credentials");
        if (res2.status == serverDownCode) {
          setServerDownOpen(true);
        }
        return;
      }
      const creds = await res2.json();

      // Merge credentials with persons
      const personsWithCreds = persons.map(person => {
        const personCreds = creds.filter(cred => cred.person.personId === person.personId);
        return { ...person, credentials: personCreds };
      });

      console.log("second persons", personsWithCreds);

      setPersonsInfo(personsWithCreds);

      // Store only the selected persons
      const filteredPersons = persons.filter((p) => personIds.includes(p.personId));
      setOriginalSelectedPersonsInfo(filteredPersons);

      const initialValidation = persons.map(person => ({
        personId: person.personId,
        isValid: true,
      }));
      setPersonsValidation(initialValidation);
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
    getAccessGroups();
    getPersonsWithCred();
  }, [isMounted]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(getInfo, []);

  const clearPerson = (id) => () => {
    // Restore the original person info to personsInfo
    setPersonsInfo((prevPersons) =>
      prevPersons.map((p) => (p.personId === id ? originalSelectedPersonsInfo.find((orig) => orig.personId === id) : p))
    );
    
    // Remove the person from originalSelectedPersonsInfo and personIdsState
    setOriginalSelectedPersonsInfo((prevPersons) => prevPersons.filter((p) => p.personId !== id));
    setPersonIdsState((prevIds) => prevIds.filter((p) => p !== id));

    if (originalSelectedPersonsInfo.length == 1) {
      router.push("/dashboard/persons");
    }
  };

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
    setButtonDisabled(true);

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
    setButtonDisabled(false);
  };

  const handleValidationChange = (personId, isValid) => {
    setPersonsValidation((prev) =>
      prev.map((p) =>
        p.personId == personId ? { ...p, isValid: isValid } : p
      )
    );
  }

  // Checks if any of the persons are invalid and disables the submit button
  useEffect(() => {
    if (personsValidation.length == 0) {
      return;
    }
    const allValid = personsValidation.every((p) => p.isValid);
    setButtonDisabled(!allValid);
  }, [personsValidation]);

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
                  personsInfo
                  .filter((p) => personIdsState.includes(p.personId))
                  .map((p, i) => {
                    return (
                      <PersonEditFormTwo
                        personId={p.personId}
                        personsInfo={personsInfo}
                        accessGroups={accessGroups}
                        updatePersonInfo={updatePersonInfo}
                        onClear={clearPerson(p.personId)}
                        onValidationChange={(isValid) => handleValidationChange(p.personId, isValid)}
                      />
                    );
                  })}
                <div>
                  <Button
                    size="large"
                    type="submit"
                    sx={{ mr: 3 }}
                    variant="contained"
                    disabled={isButtonDisabled}
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
