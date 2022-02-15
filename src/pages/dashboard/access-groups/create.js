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
import formUtils from "../../../utils/form-utils";

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
            toast.error("Persons not loaded");
        }
    }, [isMounted]);

    useEffect(() => {
        getPersons();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

    // stores the duplicated person ids
    const [duplicatedPerson, setDuplicatedPerson] = useState({});

    // store previous access group names
    const accessGroupNames = {};
    accessGroupApi.getAccessGroups()
        .then(async res => {
            if (res.status == 200) {
               const body = await res.json();
               body.forEach(group => accessGroupNames[group.accessGroupName] = true); 
            }
        });

    // add card logic
    //returns largest cardId + 1
    const getNewId = () => accessGroupInfoArr.map(info => info.cardId)
                                             .reduce((a, b) => Math.max(a, b), -1) + 1

    const addCard = () => {
        const newId = getNewId();
        setAccessGroupInfoArr([ ...accessGroupInfoArr, getEmptyAccessGroupInfo(newId) ]);
        setAccessGroupValidationsArr([ ...accessGroupValidationsArr, getEmptyAccessGroupValidations(newId) ]);
    }

    // helper for remove card and changeNameCheck
    // directly modifies validationArr
    const checkDuplicateName = (groupArr, validationArr) => {
        const duplicatedNames = formUtils.getDuplicates(
            groupArr
                // get access group names
                .map(group => group.accessGroupName)
                // keep the ones that are not blank strings
                .filter(name => !(/^\s*$/.test(name)))
        );
        for(let i=0; i<groupArr.length; i++) {
            validationArr[i].accessGroupNameDuplicated = groupArr[i].accessGroupName in duplicatedNames;
        }
    }

    // helper for removeCard and changePersonCheck
    // directly modifies validationArr, return newDuplicatedPerson
    const checkDuplicatePerson = (groupArr, validationArr) => {
        // stores id of duplicated persons
        const newDuplicatedPerson = formUtils.getDuplicates(
            groupArr.map(
                // get access group person
                group => group.person.map(
                    // get person id
                    person => person.personId
                )
            ).flat()
        );
        for(let i=0; i<groupArr.length; i++) {
            // equals true if 
            validationArr[i].accessGroupPersonDuplicated =
                // returns true if some person in access group is in duplicaed person
                groupArr[i].person.some(
                    person => person.personId in newDuplicatedPerson
                );           
        }
        return newDuplicatedPerson
    }

    // remove card logic
    const removeCard = (id) => {
        const newAccessGroupInfoArr = accessGroupInfoArr.filter(info => info.cardId != id);
        const newValidations = accessGroupValidationsArr.filter(validation => validation.cardId != id);

        // check name duplicated
        checkDuplicateName(newAccessGroupInfoArr, newValidations);
        
        // check person duplicated
        setDuplicatedPerson(checkDuplicatePerson(newAccessGroupInfoArr, newValidations)); 

        setAccessGroupInfoArr(newAccessGroupInfoArr);
        setAccessGroupValidationsArr(newValidations);       
    }
    
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

        // store a temp updated access group info
        const newAccessGroupInfoArr = [ ...accessGroupInfoArr ]
        newAccessGroupInfoArr.find(group => group.cardId == id).accessGroupName = accessGroupName;

        // remove submit failed
        validation.submitFailed = false;

        // check name is blank?
        validation.accessGroupNameBlank = formUtils.checkBlank(accessGroupName);

        // check name exists?
        validation.accessGroupNameExists = !!accessGroupNames[accessGroupName];

        // check name duplicated
        checkDuplicateName(newAccessGroupInfoArr, newValidations);

        setAccessGroupValidationsArr(newValidations);
    }

    const changePersonCheck = (newValue, id) => {
        // check if person has existing access group
        const validations = [ ...accessGroupValidationsArr ];
        const validation = validations.find(v => v.cardId == id);

        const newAccessGroupInfoArr = [ ...accessGroupInfoArr ];
        newAccessGroupInfoArr.find(group => group.cardId == id).person = newValue; // hold an updated copy of access group info for validation checks

        // remove submit failed
        validation.submitFailed = false;

        // some selected persons has access group already
        validation.accessGroupPersonHasAccessGroup = newValue.some(person => person.accessGroup);

        // check person duplicated
        setDuplicatedPerson(checkDuplicatePerson(newAccessGroupInfoArr, validations)); 

        setAccessGroupValidationsArr(validations);
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
                                            submitted                      ||
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