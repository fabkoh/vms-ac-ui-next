import { Add, ArrowBack } from "@mui/icons-material";
import { Box, Button, Container, Link, Stack, Typography } from "@mui/material";
import Head from "next/head";
import NextLink from "next/link";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { createCounterObject, getDuplicates } from "../../../utils/form-utils";
import { personListLink } from "../../../utils/persons";
import { useCallback, useEffect, useState } from 'react';
import PersonAddFormTwo from "../../../components/dashboard/persons/person-add-form-two";
import { useMounted } from "../../../hooks/use-mounted";
import { accessGroupApi } from "../../../api/access-groups";
import { personApi } from '../../../api/person';
import { isObject } from "../../../utils/utils";
import toast from "react-hot-toast";
import router from "next/router";

const getNextId = createCounterObject(0);

const getNewPersonInfo = (id) => ({
    personId: id,
    personFirstName: '',
    personLastName: '',
    personUid: '',
    personMobileNumber: '',
    personEmail: '',
    accessGroup: null
});

const getNewPersonValidation = (id) => ({
    personId: id,
    //error
    firstNameBlank: false,
    lastNameBlank: false,
    uidInUse: false,
    uidRepeated: false,
    // note
    numberInUse: false,
    numberRepeated: false,
    emailInUse: false,
    emailRepeated: false,
})

const cardError = (v) => isObject(v) && (v.firstNameBlank || v.lastNameBlank || v.uidInUse || v.uidRepeated);

const CreatePersonsTwo = () => {

    // stores list of person objects
    const [personsInfo, setPersonsInfo] = useState([]);
    const [personsValidation, setPersonsValidation] = useState([]);

    // access groups for access group select
    const [accessGroups, setAccessGroups] = useState([]);

    // info for checking
    const [personUids, setPersonUids] = useState([]);
    const [personMobileNumbers, setPersonMobileNumbers] = useState([]);
    const [personEmails, setPersonEmails] = useState([]);

    // get info
    const isMounted = useMounted(); 

    const getPersons = async () => {
        try {
            const res = await personApi.getPersons();
            if (res.status != 200) {
                throw new Error("person info not loaded");
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
                throw new Error("access group info not loaded");
            }
            const body = await res.json();
            setAccessGroups(body);
        } catch(e) {
            console.error(e);
            toast.error("Access groups failed to load");
        }
    };

    const getInfo = useCallback(() => {
        // put methods here
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
    if (personsInfo.length == 0) {
        addPerson();
    }

    const removePersonFactory = (id) => () => {
        const newPersonsInfo = personsInfo.filter(p => p.personId != id);
        const newPersonsValidation = personsValidation.filter(p => p.personId != id);

        checkDuplicateHelper("personUid", "uidRepeated", newPersonsValidation, newPersonsInfo);
        checkDuplicateHelper("personMobileNumber", "numberRepeated", newPersonsValidation, newPersonsInfo);
        checkDuplicateHelper("personEmail", "emailRepeated", newPersonsValidation, newPersonsInfo);

        setPersonsInfo(newPersonsInfo);
        setPersonsValidation(newPersonsValidation);
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
        if (value != "") { // in use ignores empty strings
            const inUse = arrayOfUsedValues.includes(value);
            const personValidation = validArr.find(p => p.personId == id);
            if (isObject(personValidation) && personValidation[inUseKey] != inUse) {
                personValidation[inUseKey] = inUse;
                return true;
            }
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

        if (b1 || b2) { setPersonsValidation([ ...personsValidation ]); }
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
            newInfo.find(p => p.personId === id).accessGroup = e.target.value;
        } else {
            newInfo.find(p => p.personId === id).accessGroup = accessGroups.find(group => group.accessGroupName === value);
        }
        setPersonsInfo(newInfo);
    };

    const submitDisabled = (
        personsInfo.length == 0 ||
        personsValidation.some(cardError)
    );

    const [disableSubmit, setDisableSubmit] = useState(false);

    const submitForm = async (e) => {
        e.preventDefault();
        setDisableSubmit(true);

        // send res
        try {
            const resArr = await Promise.all(personsInfo.map(p => personApi.createPerson(p)));
            // find failed res
            const failedResIndex = [];
            resArr.forEach((res, i) => {
                if (res.status != 201) {
                    failedResIndex.push(i);
                }
            });

            // success toast
            const numSuccess = resArr.length - failedResIndex.length;
            if (numSuccess) { toast.success(`Successfully created ${numSuccess} persons`); }

            // if some failed
            if (failedResIndex.length) {
                toast.error("Unable to create persons below");    
                // filter failed personsInfo and personsValidation
                setPersonsInfo(personsInfo.filter((p, i) => failedResIndex.includes(i)));
                setPersonsValidation(personsInfo.filter((p, i) => failedResIndex.includes(i)));
            } else {
                // all success
                router.replace(personListLink);
            }
        } catch {
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