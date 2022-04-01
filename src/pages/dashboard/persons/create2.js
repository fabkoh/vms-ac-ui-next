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
    emailInvalid: false,
    // note
    numberInUse: false,
    numberRepeated: false,
    emailInUse: false,
    emailRepeated: false,
})

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
        setPersonsInfo(personsInfo.filter(p => p.personId != id));
        setPersonsValidation(personsValidation.filter(p => p.personId != id));
    };

    // editing logic
    const changeTextField = (key, id, ref) => {
        // do not use setState to prevent rerender
        personsInfo.find(p => p.personId === id)[key] = ref.current?.value;
        console.log(personsInfo); // todo: DELETE THIS
    };

    const blankCheckHelper = (id, key, value) => {
        let isBlank = false;
        if (typeof(value) === 'string' && /^\s*$/.test(value)) {
            isBlank = true;
        }

        // only update if different
        if (personsValidation.find(p => p.personId === id)[key] != isBlank) {
            const newValidation = [ ...personsValidation ];
            newValidation.find(p => p.personId)[key] = isBlank;
            setPersonsValidation(newValidation);
        }
    };

    const checkDuplicatesAndInUseHelper = (id, key, value, arrayOfUsedValues, inUseKey, duplicateKey) => {
        if (value === "") return;

        const newValidations = [ ...personsValidation ];
        let toChange = false;

        const inUse = arrayOfUsedValues.includes(value);
        if (inUse != newValidations[id][inUseKey]) {
            newValidations[id][inUseKey] = inUse;
            toChange = true;
        }
        
        const duplicateKeys = getDuplicates(personsInfo.map(p => p[key]));

        personsInfo.forEach((p, i) => {
            const v = p[key] in duplicateKeys;
            if (newValidations[i][duplicateKey] != v) {
                newValidations[i][duplicateKey] = v;
                toChange = true;
            }
        })

        if (toChange) {
            setPersonsValidation(newValidations);
        }
    }

    const onPersonFirstNameChangeFactory = (id) => (ref) => {
        changeTextField("personFirstName", id, ref);
        blankCheckHelper(id, "firstNameBlank", ref.current?.value);
    };

    const onPersonLastNameChangeFactory = (id) => (ref) => {
        changeTextField("personLastName", id, ref);
        blankCheckHelper(id, "lastNameBlank", ref.current?.value);
    };

    const onPersonUidChangeFactory = (id) => (ref) => {
        changeTextField("personUid", id, ref);
    };

    const onPersonMobileNumberChangeFactory = (id) => (ref) => {
        changeTextField("personMobileNumber", id, ref)
    }

    const onPersonEmailChangeFactory = (id) => (ref) => {
        changeTextField("personEmail", id, ref)
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
                        <form onSubmit={(e) => { e.preventDefault(); console.log(e) }}>
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
                                        // disabled=
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