import { Add, ArrowBack } from "@mui/icons-material";
import { Box, Button, Container, Link, Stack, Typography } from "@mui/material";
import Head from "next/head";
import NextLink from "next/link";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { createCounterObject, getDuplicates } from "../../../../utils/form-utils";
import { usersManagementLink } from "../../../../utils/users";
import { useCallback, useEffect, useState } from 'react';
import UserAddForm from "../../../../components/account/user-add-form";
import { useMounted } from "../../../../hooks/use-mounted";
import { personApi } from '../../../../api/person';
import { arraySameContents, isObject } from "../../../../utils/utils";
import toast from "react-hot-toast";
import router from "next/router";
import { saveCredentialApi, checkCredentialApi } from "../../../../api/credentials";
import { getPersonName } from "../../../../utils/persons";
import {ServerDownError} from "../../../../components/dashboard/errors/server-down-error";
import { serverDownCode } from "../../../../api/api-helpers";
import { authSignUp } from "../../../../api/auth-api";

const getNextId = createCounterObject(1);

const getNewPersonInfo = (id) => ({
    personId: id,
    personFirstName: '',
    personLastName: '',
    personMobileNumber: '',
    personEmail: '',
    personPassword: '',
    personRole: [],
});

const getNewPersonValidation = (id) => ({
    personId: id,
    //error
    firstNameBlank: false,
    lastNameBlank: false,
    numberInvalid: false,
    passwordBlank: false,
    emailBlank: false,
    roleBlank: false,
    // note
    numberInUse: false,
    numberRepeated: false,
    emailInUse: false,
    emailRepeated: false,
});


const cardError = (v) => {
    return isObject(v) && (v.firstNameBlank || v.lastNameBlank || v.emailBlank || v.passwordBlank || v.roleBlank || v.numberInvalid)
};

const CreatePersonsTwo = () => {

    // stores list of person objects
    const [personsInfo, setPersonsInfo] = useState([getNewPersonInfo(0)]);
    const [personsValidation, setPersonsValidation] = useState([getNewPersonValidation(0)]);

    // get info
    const isMounted = useMounted(); 

    const [serverDownOpen, setServerDownOpen] = useState(false);

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

    // check if phone number is a valid Singapore phone numnber
    const checkInvalidNumberHelper = (personId, number, key, validArr) => {

        const personValidation = validArr.find(p => p.personId === personId);
        const invalid = number.startsWith("+65 ") && number.length !== 13;
        console.log("invalid phone number is " + invalid);

        if (isObject(personValidation) && personValidation[key] != invalid) {
            personValidation[key] = invalid;
            return true;
        }

        return false;
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


    const onPersonMobileNumberChangeFactory = (id) => (ref) => {
        changeTextField("personMobileNumber", id, ref);

        const b1 = checkDuplicateHelper("personMobileNumber", "numberRepeated", personsValidation, personsInfo);
        const b2 = checkInvalidNumberHelper(id, ref.current?.value, "numberInvalid", personsValidation);

        if (b1 || b2) { setPersonsValidation([ ...personsValidation ]); }
    }

    const onPersonEmailChangeFactory = (id) => (ref) => {
        changeTextField("personEmail", id, ref);
        const b1 = blankCheckHelper(id, "emailBlank", ref.current?.value, personsValidation);
        const b2 = checkDuplicateHelper("personEmail", "numberRepeated", personsValidation, personsInfo);
        
        if (b1 || b2) { setPersonsValidation([ ...personsValidation ]); }
    };

    const onPersonPasswordChangeFactory = (id) => (ref) => {
        changeTextField("personPassword", id, ref);

        const b1 = blankCheckHelper(id, "passwordBlank", ref.current?.value, personsValidation);

        if (b1) { setPersonsValidation([ ...personsValidation ]); }
    };

    // const onPersonRoleChangeFactory = (id) => (ref) => {
    //     changeTextField("personRole", id, ref);

    //     const b1 = blankCheckHelper(id, "roleBlank", ref.current?.value, personsValidation);

    //     if (b1) { setPersonsValidation([ ...personsValidation ]); }
    // };

    const onPersonRoleChangeFactory = (id) => (e) => {
        const newInfo = [ ...personsInfo ];
        const value = e.target.value;
        newInfo.find(p => p.personId === id).personRole = [value];
        setPersonsInfo(newInfo);
    };

    const submitDisabled = (
        personsInfo.length == 0 ||
        personsValidation.some(cardError)
    );

    const [disableSubmit, setDisableSubmit] = useState(false);


    // return true if the person creation was successful
    const createPerson = async (person) => {
        console.log(person, 34);
        const userSettings = {
            firstName: person.personFirstName,
            lastName: person.personLastName,
            email: person.personEmail,
            password: person.personPassword,
            role: person.personRole,
            mobile: person.personMobileNumber.slice(1,)
          }
          console.log(userSettings, 12)
        try {
            const res = await authSignUp(userSettings);
            console.log(res)
            if (res.type != 'success') {
                throw new Error("Unable to register User")
            }
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
                router.replace(usersManagementLink);
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
                <title>Etlas: Create User</title>
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
                            href={usersManagementLink}
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
                                <Typography variant="subtitle2">Users Management</Typography>
                            </Link>
                        </NextLink>
                    </Box>
                    <Stack spacing={3}>
                        <div>
                            <Typography variant="h3">Add User</Typography>
                        </div>
                        <form onSubmit={submitForm}>
                            <Stack spacing={3}>
                                { 
                                    Array.isArray(personsInfo) && personsInfo.map((p,i) => {
                                        const id = p.personId;                                        
                                        return (
                                            <UserAddForm 
                                                key={id}
                                                onClear={removePersonFactory(id)}
                                                person={p}
                                                onPersonFirstNameChange={onPersonFirstNameChangeFactory(id)}
                                                onPersonLastNameChange={onPersonLastNameChangeFactory(id)}
                                                onPersonMobileNumberChange={onPersonMobileNumberChangeFactory(id)}
                                                onPersonEmailChange={onPersonEmailChangeFactory(id)}
                                                onPersonPasswordChange={onPersonPasswordChangeFactory(id)}
                                                handlePersonRoleChange={onPersonRoleChangeFactory(id)}
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
                                        Add user
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
                                        Create Users
                                    </Button>
                                    <NextLink
                                        href={usersManagementLink}
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