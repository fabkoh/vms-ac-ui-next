import { Add, ArrowBack } from "@mui/icons-material";
import { Box, Button, Container, Link, Stack, Typography } from "@mui/material";
import Head from "next/head";
import NextLink from "next/link";
import { AuthGuard } from "../../components/authentication/auth-guard";
import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import { createCounterObject, getDuplicates } from "../../utils/form-utils";
import { personListLink } from "../../utils/persons";
import { useCallback, useEffect, useState } from 'react';
import PersonAddFormTwo from "../../components/dashboard/persons/person-add-form-two";
import { useMounted } from "../../hooks/use-mounted";
import { accessGroupApi } from "../../api/access-groups";
import { personApi } from '../../api/person';
import { getCredTypesApi } from "../../api/credential-types";
import { arraySameContents, isObject } from "../../utils/utils";
import toast from "react-hot-toast";
import router from "next/router";
import { saveCredentialApi, checkCredentialApi } from "../../api/credentials";
import { getPersonName } from "../../utils/persons";
import { controllerApi } from "../../api/controllers";
import { CredTypePinID } from "../../utils/constants";
import {ServerDownError} from "../../components/dashboard/errors/server-down-error";
import { serverDownCode } from "../../api/api-helpers";

const getNextId = createCounterObject(1);

const getNewPersonInfo = (id) => ({
    personId: id,
    personFirstName: '',
    personLastName: '',
    personUid: '',
    personMobileNumber: '',
    personEmail: '',
    accessGroup: null,
    credentials: []
});

const getNewPersonValidation = (id) => ({
    personId: id,
    //error
    firstNameBlank: false,
    lastNameBlank: false,
    uidInUse: false,
    uidRepeated: false,
    credentialRepeatedIds: [], // stores the ids of repeated credentials (repeated = credType and credUid same)
    credentialUidRepeatedIds: [],
    credentialCheckFailed: {},
    numberInvalid: false,
    numberErrorMessage: null,
    // note
    numberInUse: false,
    numberRepeated: false,
    emailInUse: false,
    emailRepeated: false,
});

const getNewCredential = (id) => ({
    credId: id,
    credTypeId: '',
    credUid: '',
    credTTL: null,
    isValid: true,
    isPerm: false
});

const cardError = (v) => {
    return isObject(v) && (v.firstNameBlank || v.lastNameBlank || v.uidInUse || v.uidRepeated || v.credentialRepeatedIds.length > 0 || v.credentialUidRepeatedIds.length > 0 || Object.keys(v.credentialCheckFailed).length > 0
    || v.numberInUse
    || v.numberRepeated
    || v.numberInvalid)
};

const CreatePersonsTwo = () => {

    // stores list of person objects
    const [personsInfo, setPersonsInfo] = useState([getNewPersonInfo(0)]);
    const [personsValidation, setPersonsValidation] = useState([getNewPersonValidation(0)]);

    // access groups for access group select
    const [accessGroups, setAccessGroups] = useState([]);

    // info for checking
    const [personUids, setPersonUids] = useState([]);
    const [personMobileNumbers, setPersonMobileNumbers] = useState([]);
    const [personEmails, setPersonEmails] = useState([]);

    // credTypes
    const [credTypes, setCredTypes] = useState([]);

    // get info
    const isMounted = useMounted(); 

    const [serverDownOpen, setServerDownOpen] = useState(false);
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
        } catch(e) {
            console.error(e);
            toast.error("Error loading credential types");
        }
    }

    const getPersons = async () => {
        try {
            const res = await personApi.getPersons();
            if (res.status != 200) {
                setPersonUids([]);
                setPersonMobileNumbers([]);
                setPersonEmails([]);
                toast.error("Error loading persons");
                if (res.status == serverDownCode) {
                    setServerDownOpen(true);
                }
                return;
            }
            const body = await res.json();
            setPersonUids(body.map(p => p.personUid));
            setPersonMobileNumbers(body.map(p => p.personMobileNumber));
            setPersonEmails(body.map(p => p.personEmail));
        } catch(e) {
            console.error(e)
        }
    }

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
        } catch(e) {
            console.error(e);
            toast.error("Error loading access groups");
        }
    };

    const getInfo = useCallback(() => {
        // put methods here
        getCredTypes();
        getAccessGroups();
        getPersons();
    }, [isMounted]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(getInfo, []);

    // add / remove person logic
    const addPerson = () => {
        const id = getNextId();
        setPersonsInfo([ ...personsInfo, getNewPersonInfo(id) ]);
        setPersonsValidation([ ...personsValidation, getNewPersonValidation(id)]);
    };

    // done like this as putting getNextId in useState causes getNextId to be called 
    // an additional time every re-render

    const removePersonFactory = (id) => () => {
        const newPersonsInfo = personsInfo.filter(p => p.personId != id);
        const newPersonsValidation = personsValidation.filter(p => p.personId != id);

        checkDuplicateHelper("personUid", "uidRepeated", newPersonsValidation, newPersonsInfo);
        checkDuplicateHelper("personMobileNumber", "numberRepeated", newPersonsValidation, newPersonsInfo);
        checkDuplicateHelper("personEmail", "emailRepeated", newPersonsValidation, newPersonsInfo);

        setPersonsInfo(newPersonsInfo);
        setPersonsValidation(newPersonsValidation);
    };

    //add / remove credential logic
    const addCredentialFactory = (personId) => () => {
        const newPersons = [ ...personsInfo ];
        newPersons.find(p => p.personId == personId).credentials.push(getNewCredential(getNextId()));
        setPersonsInfo(newPersons);
    };
    
    const removeCredentialFactory = (personId) => (credId) => () => {
        const newPersons = [ ...personsInfo ];
        const person = newPersons.find(p => p.personId == personId);
        person.credentials = person.credentials.filter(c => c.credId != credId);
        setPersonsInfo(newPersons);

        const newValidations = [...personsValidation];

        newPersons.forEach(
            (person, i) => {
                newValidations[i].credentialCheckFailed = {}
            }
        );
        setPersonsValidation(newValidations);

        const b1 = checkCredRepeatedHelper(newPersons, personsValidation);
        const b2 = checkCredUidRepeatedForNotPinTypeCred(newPersons, personsValidation);
        if(b1 || b2) { setPersonsValidation([ ...personsValidation ]); }
    };

    // editing logic
    const changeTextField = (key, id, ref) => {
        // do not use setState to prevent rerender
        personsInfo.find(p => p.personId === id)[key] = ref.current?.value;
    };

    // returns true if personsValidation is changed
    const blankCheckHelper = (id, key, value, validArr) => {
        let isBlank = typeof(value) === 'string' && /^\s*$/.test(value);

        // only update if different
        const personValidation = validArr.find(p => p.personId === id);
        if (isObject(personValidation) && personValidation[key] != isBlank) {
            personValidation[key] = isBlank; // modifies validArr, remember to setState after calling this function
            return true;
        }

        return false;
    };

    // returns if validArr is changed
    const checkInUseHelper = (id, value, arrayOfUsedValues, inUseKey, validArr) => {
        const inUse = value != "" && arrayOfUsedValues.includes(value);
        const personValidation = validArr.find(p => p.personId == id);
        if (isObject(personValidation) && personValidation[inUseKey] != inUse) {
            personValidation[inUseKey] = inUse;
            return true;
        }
        return false;
    };

    // returns if validArr is changed
    const checkDuplicateHelper = (key, duplicateKey, validArr, infoArr) => {
        let toChange = false;

        const duplicateKeys = getDuplicates(infoArr.map(p => p[key]));
        infoArr.forEach((p, i) => {
            const v = p[key];
            const b = v != "" && v != undefined && v != null && v in duplicateKeys; // ignores empty strings
            if (validArr[i][duplicateKey] != b) {
                validArr[i][duplicateKey] = b;
                toChange = true;
            }
        })
        return toChange
    }

    // returns if validArr is changed
    const checkCredRepeatedHelper = (infoArr, validArr) => {
        let toChange = false;

        const credMap = {}; // maps credTypeId to array of credUid
        const repeatedCred = []; // array of [credTypeId, credUid]
        infoArr.forEach(person => 
            person.credentials.forEach(
                cred => {
                    const credTypeId = cred.credTypeId;
                    const uid = cred.credUid;
                    if (credTypeId != '' && uid != '' && credTypeId != CredTypePinID) {
                        if (!(credTypeId in credMap)) {
                            credMap[credTypeId] = [];
                        }
                        const arr = credMap[credTypeId];
                        if (arr.some(e => e == uid)) {
                            repeatedCred.push([credTypeId, uid]);
                        } else {
                            arr.push(uid);
                        }
                    }
                }
            )
        );

        infoArr.forEach(
            (person, i) => {
                const repeatedCredIds = [];
                person.credentials.forEach(
                    cred => {
                        if (repeatedCred.some(c => c[0] == cred.credTypeId && c[1] == cred.credUid)) {
                            repeatedCredIds.push(cred.credId);
                        }
                    }
                );
                if (!arraySameContents(repeatedCredIds, validArr[i].credentialRepeatedIds)) {
                    toChange = true;
                    validArr[i].credentialRepeatedIds = repeatedCredIds;
                }
            }
        );

        return toChange;
    }

    // to check if same credUid for not pin is being repeated
    const checkCredUidRepeatedForNotPinTypeCred = (infoArr, validArr) => {
        let toChange = false;

        const credMap = {}; // maps credUidto array of a list of [persons id, cred id]
        const repeatedCredUidCredIds = []
        infoArr.forEach((person, i) => {
            person.credentials.forEach(
                cred => {
                    const credTypeId = cred.credTypeId;
                    const uid = cred.credUid;
                    if (credTypeId != '' && uid != '' && credTypeId != CredTypePinID) {
                        if (!(uid in credMap)) {
                            credMap[uid] = [person.personUid, cred.credId];
                        } else {
                            credMap[uid].push([person.personUid, cred.credId]);
                            repeatedCredUidCredIds.push(cred.credId);
                        }
                    }
                }
            )
        
            if (!arraySameContents(repeatedCredUidCredIds, validArr[i].credentialUidRepeatedIds)) {
                toChange = true;
                validArr[i].credentialUidRepeatedIds = repeatedCredUidCredIds;
            }
        });

        return toChange;
    }

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
    

    const onPersonFirstNameChangeFactory = (id) => (ref) => {
        changeTextField("personFirstName", id, ref);
        const b1 = blankCheckHelper(id, "firstNameBlank", ref.current?.value, personsValidation);

        if (b1) { setPersonsValidation([ ...personsValidation ]); }
    };

    const onPersonLastNameChangeFactory = (id) => (ref) => {
        changeTextField("personLastName", id, ref);
        const b1 = blankCheckHelper(id, "lastNameBlank", ref.current?.value, personsValidation);
        
        if (b1) { setPersonsValidation([ ...personsValidation ]); }
    };

    const onPersonUidChangeFactory = (id) => (ref) => {
        changeTextField("personUid", id, ref);

        const b1 = checkDuplicateHelper("personUid", "uidRepeated", personsValidation, personsInfo);
        const b2 = checkInUseHelper(id, ref.current?.value, personUids, "uidInUse", personsValidation);

        if (b1 || b2) { setPersonsValidation([ ...personsValidation ]); }
    };

    const onPersonMobileNumberChangeFactory = (id) => (ref) => {
        changeTextField("personMobileNumber", id, ref);

        const b1 = checkDuplicateHelper("personMobileNumber", "numberRepeated", personsValidation, personsInfo);
        const b2 = checkInUseHelper(id, ref.current?.value, personMobileNumbers, "numberInUse", personsValidation);
        const b3 = checkInvalidNumberHelper(id, ref.current?.value, "numberInvalid", personsValidation, personsInfo);

        if (b1 || b2 || b3) { setPersonsValidation([ ...personsValidation ]); }
    }

    const onPersonEmailChangeFactory = (id) => (ref) => {
        changeTextField("personEmail", id, ref);

        const b1 = checkDuplicateHelper("personEmail", "emailRepeated", personsValidation, personsInfo);
        const b2 = checkInUseHelper(id, ref.current?.value, personEmails, "emailInUse", personsValidation);

        if (b1 || b2) { setPersonsValidation([ ...personsValidation ]); }
    };

    const onAccessGroupChangeFactory = (id) => (e) => {
        const newInfo = [ ...personsInfo ];
        const value = e.target.value;
        if (value == null) {
            newInfo.find(p => p.personId === id).accessGroup = value;
        } else {
            newInfo.find(p => p.personId === id).accessGroup = accessGroups.find(group => group.accessGroupId === value);
        }
        setPersonsInfo(newInfo);
    };

    const onCredTypeChangeFactory = (personId) => (credId) => (e) => {
        const newInfo = [ ...personsInfo ];
        newInfo.find(p => p.personId == personId).credentials.find(cred => cred.credId == credId).credTypeId = e.target.value;
        setPersonsInfo(newInfo);

        const newValidations = [...personsValidation];

        newInfo.forEach(
            (person, i) => {
                newValidations[i].credentialCheckFailed = {}
            }
        );
        setPersonsValidation(newValidations);

        const b1 = checkCredRepeatedHelper(newInfo, personsValidation);
        const b2 = checkCredUidRepeatedForNotPinTypeCred(newInfo, personsValidation);
        if(b1 || b2) { setPersonsValidation([ ...personsValidation ]); }
    }

    const onCredUidChangeFactory = (personId) => (credId) => (ref) => {
        personsInfo.find(p => p.personId == personId).credentials.find(cred => cred.credId == credId).credUid = ref.current?.value;
        const newValidations = [...personsValidation];

        personsInfo.forEach(
            (person, i) => {
                newValidations[i].credentialCheckFailed = {}
            }
        );
        setPersonsValidation(newValidations);
        const b1 = checkCredRepeatedHelper(personsInfo, personsValidation);
        const b2 = checkCredUidRepeatedForNotPinTypeCred(personsInfo, personsValidation);
        if(b1 || b2) { setPersonsValidation([ ...personsValidation ]); }
    }

    const onCredValidChangeFactory = (personId) => (credId) => (bool) => {
        personsInfo.find(p => p.personId == personId).credentials.find(cred => cred.credId == credId).isValid = bool;
    }

    const onCredPermChangeFactory = (personId) => (credId) => (bool) => {
        personsInfo.find(p => p.personId == personId).credentials.find(cred => cred.credId == credId).isPerm = bool;
    }

    const onCredTTLChangeFactory = (personId) => (credId) => (dateObj) => {
        personsInfo.find(p => p.personId == personId).credentials.find(cred => cred.credId == credId).credTTL = dateObj;
    }

    const submitDisabled = (
        personsInfo.length == 0 ||
        personsValidation.some(cardError)
    );

    const [disableSubmit, setDisableSubmit] = useState(false);


    // return true if the person creation was successful
    const createPerson = async (person) => {
        const newValidations = [...personsValidation];
        const personValidation = newValidations.find(p => p.personId == person.personId);
        personValidation.credentialCheckFailed = {} // reset check failed error

        const credResArr = await Promise.all(person.credentials.map(cred => checkCredentialApi(cred, person.personId)));
        
        let failedCredArr = credResArr.filter(res => res.status > 201);
        let credCheckFailed = {};
        if (failedCredArr.length > 0) { // some failed
            for (let i = 0; i < failedCredArr.length; i++) {
                const failedCred = await failedCredArr[i].json();
                console.log(failedCred, "failedCred");
                credCheckFailed = { ...credCheckFailed, ... failedCred };
            }
            personValidation.credentialCheckFailed = credCheckFailed; // return error format { [credId]: "Error message" }
            toast.error("Credential check failed for " + person.personFirstName + " " + person.personLastName);
            return false;
        }

        try {
            const res = await personApi.createPerson(person);
            if (res.status != 201) {
                throw new Error("Unable to create person")
            }
            const body = await res.json();
            const personId = body.personId;

            // As the user will be redirected to the list page for creation (you can't redo a creation otherwise you are making multiple of the same thing)
            // and we cannot fail a person's creation due to faulty credentials either as the api call are different and you couldn't make the creds first before the person
            // credentialfailures will not be shown as error in the form

            const credResArr = await Promise.all(person.credentials.map(cred => saveCredentialApi(cred, personId, true)));
            if (credResArr.some(res => res.status > 201)) { // some failed
                toast.error("Unable to create credential for " + getPersonName(body));
            }
            setPersonsValidation(newValidations);
            return true;
        } catch(e) {
            console.error(e);
            return false;
        }
    }

    const submitForm = async (e) => {
        e.preventDefault();
        setDisableSubmit(true);

        // send res
        try {
            const boolArr = await Promise.all(personsInfo.map(p => createPerson(p)));

            // success toast
            const numSuccess = boolArr.filter(b => b).length;
            if (numSuccess) {
                toast.success(`Successfully created ${numSuccess} persons`); 
            }

            // if some failed
            if (boolArr.some(b => !b)) {
                toast.error("Unable to create persons below");    
                // filter failed personsInfo and personsValidation
                setPersonsInfo(personsInfo.filter((p, i) => !boolArr[i]));
                setPersonsValidation(personsValidation.filter((v, i) => !boolArr[i]));
            } else {
                // all success
                router.replace(personListLink);
            }
        } catch (e) {
            console.log("error", e);
            toast.error("Unable to submit form");
        }        
        setDisableSubmit(false);
    }

    return (
        <>
            <Head>
                <title>Etlas: Create Person</title>
            </Head>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8
                }}
            >
                <Container maxWidth="xl">
                    <Box sx={{ mb: 4 }}>
                        <ServerDownError
                            open={serverDownOpen} 
                            handleDialogClose={() => setServerDownOpen(false)}
					    />
                        <NextLink
                            href={personListLink}
                            passHref
                        >
                            <Link
                                color="textPrimary"
                                component="a"
                                sx={{
                                    alignItems: 'center',
                                    display: 'flex'
                                }}
                            >
                                <ArrowBack
                                    fontSize="small"
                                    sx={{ mr: 1 }}
                                />
                                <Typography variant="subtitle2">Persons</Typography>
                            </Link>
                        </NextLink>
                    </Box>
                    <Stack spacing={3}>
                        <div>
                            <Typography variant="h3">Add Persons</Typography>
                        </div>
                        <form onSubmit={submitForm}>
                            <Stack spacing={3}>
                                { 
                                    Array.isArray(personsInfo) && personsInfo.map((p,i) => {
                                        const id = p.personId;                                        
                                        return (
                                            <PersonAddFormTwo 
                                                key={id}
                                                onClear={removePersonFactory(id)}
                                                person={p}
                                                onPersonFirstNameChange={onPersonFirstNameChangeFactory(id)}
                                                onPersonLastNameChange={onPersonLastNameChangeFactory(id)}
                                                onPersonUidChange={onPersonUidChangeFactory(id)}
                                                onPersonMobileNumberChange={onPersonMobileNumberChangeFactory(id)}
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
                                        )
                                    })
                                }
                                <div>
                                    <Button
                                        size="large"
                                        sx={{ mr: 3 }}
                                        variant="outlined"
                                        startIcon={<Add />}
                                        onClick={addPerson}
                                    >
                                        Add person
                                    </Button>
                                </div>
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
                                    <NextLink
                                        href={personListLink}
                                        passHref
                                    >
                                        <Button
                                            size="large"
                                            sx={{ mr: 3 }}
                                            variant="outlined"
                                            color="error"
                                        >
                                            Cancel
                                        </Button>
                                    </NextLink>
                                </div>
                            </Stack>
                        </form>
                    </Stack>
                </Container>
            </Box>
        </>
    )
}

CreatePersonsTwo.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>
            {page}
        </DashboardLayout>
    </AuthGuard>
);

export default CreatePersonsTwo;