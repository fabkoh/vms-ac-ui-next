import { useEffect, useState, useCallback } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { Link, Box, Container, Typography, Stack, Button, Grid } from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { AccessGroupAddForm } from "../../../components/dashboard/access-groups/create/access-group-add-form";
import { AuthGuard } from '../../../components/authentication/auth-guard';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import Add from "@mui/icons-material/Add";
import { personApi } from "../../../api/person";
import { accessGroupApi } from "../../../api/access-groups";
import { useMounted } from "../../../hooks/use-mounted";
import toast from "react-hot-toast";
import router from "next/router";

const CreateAccessGroups = () => {

    // empty objects for initialisation of new card
    const getEmptyAccessGroupInfo = (cardId) => ({
        cardId,
        accessGroupName: '',
        accessGroupDesc: '',
        person: []
    });
    const getEmptyAccessGroupValidations = (cardId) => ({
        cardId,
        accessGroupNameBlank: false,
        accessGroupDescBlank: false,

        // name in database (error)
        accessGroupNameExists: false,

        // name duplicated in form (error)
        accessGroupNameDuplicated: false,

        // person has access group (note)
        accessGroupPersonHasAccessGroup: false,

        // person in two access groups in same form (error) 
        accessGroupPersonDuplicated: false,

        // submit failed
        submitFailed: false
    });

    const [accessGroupInfoArr, 
        setAccessGroupInfoArr] = useState([getEmptyAccessGroupInfo(0)]);
    const [accessGroupValidationsArr, 
        setAccessGroupValidationsArr] = useState([getEmptyAccessGroupValidations(0)]);

    // add card logic
    //returns largest cardId + 1
    const getNewId = () => accessGroupInfoArr.map(info => info.cardId)
                                             .reduce((a, b) => Math.max(a, b), -1) + 1

    const addCard = () => {
        const newId = getNewId();
        setAccessGroupInfoArr([ ...accessGroupInfoArr, getEmptyAccessGroupInfo(newId) ]);
        setAccessGroupValidationsArr([ ...accessGroupValidationsArr, getEmptyAccessGroupValidations(newId) ]);
    }

    // remove card logic
    const removeCard = (id) => {
        const newAccessGroupInfoArr = accessGroupInfoArr.filter(info => info.cardId != id);
        const newValidations = accessGroupValidationsArr.filter(validation => validation.cardId != id);

        // check name duplicated
        const nameMap = {} // maps name to the index of the first occurence of said name
        for (let i=0; i<newAccessGroupInfoArr.length; i++) {
            const accessGroupInfo = newAccessGroupInfoArr[i];

            // accessGroupInfo is not updated yet with the latest name yet, so check if name is updated
            const name = accessGroupInfo.cardId == id ? accessGroupName : accessGroupInfo.accessGroupName;

            if (/^\s*$/.test(name)) {
                newValidations[i].accessGroupNameDuplicated = false;
            } else if (name in nameMap) {
                newValidations[i].accessGroupNameDuplicated = true;
                newValidations[nameMap[name]].accessGroupNameDuplicated = true;
            } else {
                newValidations[i].accessGroupNameDuplicated = false;
                nameMap[name] = i;
            }
        }
        
        // check person duplicated
        const personIdMap = {}; // stores person id and maps to the first card id
        const newDuplicatedPerson = {}; // stores id of duplicated person
        for(let i=0; i<newAccessGroupInfoArr.length; i++) {
            const accessGroupInfo = newAccessGroupInfoArr[i];

            // accessGroupInfo is not updated yet, so check if needs updating
            const persons = accessGroupInfo.cardId == id ? newValue : accessGroupInfo.person;
            
            const currValidation = newValidations[i];
            currValidation.accessGroupPersonDuplicated = false;
            persons.forEach(person => {
                const personId = person.personId;
                if (personId in personIdMap) {
                    currValidation.accessGroupPersonDuplicated = true;
                    newValidations[personIdMap[personId]].accessGroupPersonDuplicated = true;
                    newDuplicatedPerson[personId] = true; // save duplicated person id
                } else {
                    personIdMap[personId] = i;
                }
            })
        }

        setAccessGroupInfoArr(newAccessGroupInfoArr);
        setAccessGroupValidationsArr(newValidations);
        setDuplicatedPerson(newDuplicatedPerson);        
    }
    
    // persons logic (displaying in dropdown box)
    const isMounted = useMounted();
    const [allPersons, setAllPersons] = useState([]);

    const getPersons = useCallback( async() => {
        try {
            const res = await personApi.getPersons();
            if (res.status == 200) {
                const body = await res.json();
                setAllPersons(body);
            } else {
                throw new Error("persons not loaded");
            }
        } catch(e) {
            console.error(e);
        }
    }, [isMounted]);

    useEffect(() => {
        getPersons();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [])

    // update methods for form inputs
    const changeTextField = (e, id) => {
        const updatedInfo = [ ...accessGroupInfoArr ];
        // this method is reliant on text field having a name field == key in info object ie accessGroupName, accessGroupDesc
        updatedInfo.find(info => info.cardId == id)[e.target.name] = e.target.value;
        setAccessGroupInfoArr(updatedInfo);
    }

    const changePerson = (newValue, id) => {
        const updatedInfo = [ ...accessGroupInfoArr ];
        updatedInfo.find(info => info.cardId == id).person = newValue;
        setAccessGroupInfoArr(updatedInfo);
    }

    // error checking methods
    const changeNameCheck = async (e, id) => {
        const accessGroupName = e.target.value;
        const newValidations = [ ...accessGroupValidationsArr ];
        const validation = newValidations.find(v => v.cardId == id);

        // remove submit failed
        validation.submitFailed = false;

        // check name is blank?
        if (/^\s*$/.test(accessGroupName)) {
            validation.accessGroupNameBlank = true;
        } else {
            validation.accessGroupNameBlank = false;
        }

        // check name exists?
        try {
            const res =  await accessGroupApi.nameExists(accessGroupName);
            if (res.status == 200) {
                const body = await res.json();
                if (body) {
                    validation.accessGroupNameExists = true;
                } else {
                    validation.accessGroupNameExists = false;
                }
            } else {
                throw Error("accessGroupNameExists check failed")
            }
        } catch(e) {
            console.error(e);
            // if cannot check, default to no error
            validation.accessGroupNameExists = false;
        }

        // check name duplicated
        const nameMap = {} // maps name to the index of the first occurence of said name
        for (let i=0; i<accessGroupInfoArr.length; i++) {
            const accessGroupInfo = accessGroupInfoArr[i];

            // accessGroupInfo is not updated yet with the latest name yet, so check if name is updated
            const name = accessGroupInfo.cardId == id ? accessGroupName : accessGroupInfo.accessGroupName;

            if (/^\s*$/.test(name)) {
                newValidations[i].accessGroupNameDuplicated = false;
            } else if (name in nameMap) {
                newValidations[i].accessGroupNameDuplicated = true;
                newValidations[nameMap[name]].accessGroupNameDuplicated = true;
            } else {
                newValidations[i].accessGroupNameDuplicated = false;
                nameMap[name] = i;
            }
        }

        setAccessGroupValidationsArr(newValidations);
    }

    const changeDescCheck = (e, id) => {
        const newValidations = [ ...accessGroupValidationsArr ];
        const validation = validation.find(v => v.cardId == id);

        // remove submit failed
        validation.submitfailed = false;

        // check if desc is blank
        validation.accessGroupDescBlank = /^\s+$/.test(e.target.value);

        setAccessGroupValidationsArr(newValidations);
    }

    // stores the duplicated person ids
    const [duplicatedPerson, setDuplicatedPerson] = useState({});

    const changePersonCheck = (newValue, id) => {
        // check if person has existing access group
        const validations = [ ...accessGroupValidationsArr ];
        const validation = validations.find(v => v.cardId == id);

        // remove submit failed
        validation.submitFailed = false;

        // some selected persons has access group already
        validation.accessGroupPersonHasAccessGroup = newValue.some(person => person.accessGroup);

        // check person duplicated
        const personIdMap = {}; // stores person id and maps to the first card id
        const newDuplicatedPerson = {}; // stores id of duplicated person
        for(let i=0; i<accessGroupInfoArr.length; i++) {
            const accessGroupInfo = accessGroupInfoArr[i];

            // accessGroupInfo is not updated yet, so check if needs updating
            const persons = accessGroupInfo.cardId == id ? newValue : accessGroupInfo.person;
            
            const currValidation = validations[i];
            currValidation.accessGroupPersonDuplicated = false;
            persons.forEach(person => {
                const personId = person.personId
                if (personId in personIdMap) {
                    currValidation.accessGroupPersonDuplicated = true;
                    validations[personIdMap[personId]].accessGroupPersonDuplicated = true;
                    newDuplicatedPerson[personId] = true; // save duplicated person id
                } else {
                    personIdMap[personId] = i;
                }
            })
        }

        setAccessGroupValidationsArr(validations);
        setDuplicatedPerson(newDuplicatedPerson);
    }

    const [submitted, setSubmitted] = useState(false);

    const submitForm = e => {
        e.preventDefault(); 

        setSubmitted(true);
        Promise.all(accessGroupInfoArr.map(accessGroup => accessGroupApi.createAccessGroup(accessGroup)))
               .then(resArr => {
                    const failedAccessGroup = [];
                    const failedRes = [];

                    resArr.forEach((res, i) => {
                        if (res.status != 201) {
                            failedAccessGroup.push(accessGroupInfoArr[i])
                            failedRes.push(res)
                        }
                    })

                    const numCreated = accessGroupInfoArr.length - failedAccessGroup.length
                    if (numCreated) {
                        toast.success(`${numCreated} access groups created`); 
                    }

                    if (failedAccessGroup.length) {
                        // some failed
                        toast.error('Error creating the highlighted persons');
                        Promise.all(failedRes.map(res => res.json()))
                               .then(failedObjArr => {
                                    setSubmitted(false);
                                    setAccessGroupValidationsArr(failedObjArr.map(obj => {
                                        obj.submitFailed = true;
                                        return obj;
                                    }))
                               })
                    } else {
                        // all passed
                        router.replace('/dashboard/access-groups')
                    }
               })
    }

    return(
        <>
            <Head>
                <title>
                    Etlas: Create Access Groups
                </title>
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
                            href="/dashboard/access-groups"
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
                                <Typography variant="subtitle2">
                                    Access groups
                                </Typography>
                            </Link>
                        </NextLink>
                    </Box>
                    <Box marginBottom={3}>
                        <Typography variant="h3">
                            Create Access Groups
                        </Typography>
                    </Box>
                    <form onSubmit={submitForm}>
                        <Stack spacing={3}>
                            { accessGroupInfoArr.map((accessGroupInfo, i) => (
                                <AccessGroupAddForm
                                    key={accessGroupInfo.cardId}
                                    accessGroupInfo={accessGroupInfo}
                                    removeCard={removeCard}
                                    allPersons={allPersons}
                                    accessGroupValidations={accessGroupValidationsArr[i]}
                                    changeTextField={changeTextField}
                                    changePerson={changePerson}
                                    changeNameCheck={changeNameCheck}
                                    changePersonCheck={changePersonCheck}
                                    duplicatedPerson={duplicatedPerson}
                                    changeDescCheck={changeDescCheck}
                                />
                            ))}
                            <div>
                                <Button
                                    size="large"
                                    variant="outlined"
                                    startIcon={<Add />}
                                    onClick={addCard}
                                >
                                    Add another
                                </Button>
                            </div>
                            <Grid container>
                                <Grid item marginRight={3}>
                                    <Button
                                        type="submit"
                                        size="large"
                                        variant="contained"
                                        disabled={
                                            accessGroupInfoArr.length == 0 || // no access groups to submit
                                            accessGroupValidationsArr.some( // check if validations fail
                                                validation => validation.accessGroupNameBlank        ||
                                                              validation.accessGroupNameExists       ||
                                                              validation.accessGroupNameDuplicated   ||
                                                              validation.accessGroupPersonDuplicated
                                            )
                                        }
                                    >
                                        Submit
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <NextLink
                                        href="/dashboard/access-groups/"
                                        passHref
                                    >
                                        <Button
                                            size="large"
                                            variant="outlined"
                                            color="error"
                                        >
                                            Cancel
                                        </Button>
                                    </NextLink>
                                </Grid>                              
                            </Grid>
                        </Stack>
                    </form>
                </Container>
            </Box>
        </>
    )
}

CreateAccessGroups.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>
            { page }
        </DashboardLayout>
    </AuthGuard>
)

export default CreateAccessGroups;