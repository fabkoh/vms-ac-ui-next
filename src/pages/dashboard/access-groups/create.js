import { useEffect, useState, useCallback } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { Link, Box, Container, Typography, Stack, Button, Grid } from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import AccessGroupAddForm from "../../../components/dashboard/access-groups/forms/access-group-add-form";
import { AuthGuard } from '../../../components/authentication/auth-guard';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import Add from "@mui/icons-material/Add";
import { personApi } from "../../../api/person";
import { accessGroupApi } from "../../../api/access-groups";
import accessGroupEntranceApi from "../../../api/access-group-entrance-n-to-n";
import entranceApi from "../../../api/entrance";
import { useMounted } from "../../../hooks/use-mounted";
import toast from "react-hot-toast";
import router from "next/router";
import formUtils from "../../../utils/form-utils";
import { accessGroupListLink } from "../../../utils/access-group";
import { controllerApi } from "../../../api/controllers";

const CreateAccessGroups = () => {

    // empty objects for initialisation of new card
    const getEmptyAccessGroupInfo = (accessGroupId) => ({
        accessGroupId,
        accessGroupName: '',
        accessGroupDesc: '',
        persons: [],
        entrances: []
    });
    const getEmptyAccessGroupValidations = (accessGroupId) => ({
        accessGroupId,
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
            toast.error("Persons info not loaded");
        }
    }, [isMounted]);

    useEffect(() => {
        getPersons();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

    // fetch all entrance info
    const isEntranceMounted = useMounted();
    const [allEntrances, setAllEntrances] = useState([]);
    const getEntrances = useCallback( async() => {
        try {
            const res = await entranceApi.getEntrances();
            if (res.status == 200) {
                const body = await res.json();
                setAllEntrances(body);
            } else {
                throw new Error("entrances not loaded");
            }
        } catch(e) {
            console.error(e);
            toast.error("Entrances info not loaded")
        }
    }, [isEntranceMounted]);

    useEffect(() => {
        getEntrances();
 
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [])

    // stores the duplicated person ids
    const [duplicatedPerson, setDuplicatedPerson] = useState({});

    // store previous access group names
    const [accessGroupNames, setAccessGroupNames] = useState({});
    useEffect(() => {
        accessGroupApi.getAccessGroups()
            .then(async res => {
                const newAccessGroupNames = {}
                if (res.status == 200) {
                    const body = await res.json();
                    body.forEach(group => newAccessGroupNames[group.accessGroupName] = true); 
                    setAccessGroupNames(newAccessGroupNames);
                }
            })
    }, []);

    // add card logic
    //returns largest accessGroupId + 1
    const getNewId = () => accessGroupInfoArr.map(info => info.accessGroupId)
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
                group => group.persons.map(
                    // get person id
                    person => person.personId
                )
            ).flat()
        );
        for(let i=0; i<groupArr.length; i++) {
            // equals true if 
            validationArr[i].accessGroupPersonDuplicated =
                // returns true if some person in access group is in duplicaed person
                groupArr[i].persons.some(
                    person => person.personId in newDuplicatedPerson
                );           
        }
        return newDuplicatedPerson
    }

    // remove card logic
    const removeCard = (id) => {
        const newAccessGroupInfoArr = accessGroupInfoArr.filter(info => info.accessGroupId != id);
        const newValidations = accessGroupValidationsArr.filter(validation => validation.accessGroupId != id);

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
        updatedInfo.find(info => info.accessGroupId == id)[e.target.name] = e.target.value;
        setAccessGroupInfoArr(updatedInfo);
    }

    const changePerson = (newValue, id) => {
        const updatedInfo = [ ...accessGroupInfoArr ];
        updatedInfo.find(info => info.accessGroupId == id).persons = newValue;
        setAccessGroupInfoArr(updatedInfo);
    }

    // error checking methods
    const changeNameCheck = async (e, id) => {
        const accessGroupName = e.target.value;
        const newValidations = [ ...accessGroupValidationsArr ];
        const validation = newValidations.find(v => v.accessGroupId == id);

        // store a temp updated access group info
        const newAccessGroupInfoArr = [ ...accessGroupInfoArr ]
        newAccessGroupInfoArr.find(group => group.accessGroupId == id).accessGroupName = accessGroupName;

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
        const validation = validations.find(v => v.accessGroupId == id);

        const newAccessGroupInfoArr = [ ...accessGroupInfoArr ];
        newAccessGroupInfoArr.find(group => group.accessGroupId == id).person = newValue; // hold an updated copy of access group info for validation checks

        // remove submit failed
        validation.submitFailed = false;

        // some selected persons has access group already
        validation.accessGroupPersonHasAccessGroup = newValue.some(person => person.accessGroup);

        // check person duplicated
        setDuplicatedPerson(checkDuplicatePerson(newAccessGroupInfoArr, validations)); 

        setAccessGroupValidationsArr(validations);
    }

    // entrance logic
    const changeEntrance = (newValue, id) => {
        const updatedInfo = [ ...accessGroupInfoArr ];
        updatedInfo.find(info => info.accessGroupId == id).entrances = newValue;
        setAccessGroupInfoArr(updatedInfo);
    }

    // currying for cleaner code
    const onEntranceChangeFactory = (id) => (newValue) => changeEntrance(newValue, id);
    const onNameChangeFactory = (id) => (e) => {
        changeTextField(e, id);
        changeNameCheck(e, id);
    }
    const onDescriptionChangeFactory = (id) => (e) => changeTextField(e, id);
    const onPersonChangeFactory = (id) => (newValue) => {
        changePerson(newValue, id);
        changePersonCheck(newValue, id);
    }


    const [submitted, setSubmitted] = useState(false);

    const submitForm = e => {
        e.preventDefault(); 

        setSubmitted(true);
        Promise.all(accessGroupInfoArr.map(accessGroup => accessGroupApi.createAccessGroup(accessGroup)))
               .then(resArr => {
                    const failedResIndex = []; // stores the index of the failed creations
                    const successResIndex = []; // stores the index of success creations
                    const originalAccessGroupInfoArr = [ ...accessGroupInfoArr ] // store first in case set access group info arr is executed before assignment

                    resArr.forEach((res, i) => {
                        if (res.status != 201) {
                            failedResIndex.push(i);
                        } else {
                            successResIndex.push(i);
                        }
                    })

                    // assign entrances to access group
                    Promise.all(successResIndex.map(i => resArr[i].json()))
                        .then(successResJson => {
                            const accessGroupToEntrance = []; // stores [accessGroupId, [array of entranceId]]
                            successResIndex.forEach((index, i) => {
                                const entranceIds = originalAccessGroupInfoArr[index].entrances.map(e => e.entranceId);
                                if (entranceIds.length > 0) { // there are entrances to add
                                    accessGroupToEntrance.push([
                                        successResJson[i].accessGroupId,
                                        entranceIds
                                    ])
                                }
                            });

                            Promise.all(
                                accessGroupToEntrance.map(
                                    groupToEntrance => accessGroupEntranceApi.assignEntrancesToAccessGroup(groupToEntrance[1], groupToEntrance[0])
                                )
                            ).then(
                                resArr => {
                                    resArr.forEach((res, i) => {
                                        if (res.status != 204) { // failed to assign
                                            const accessGroupName = successResJson[i].accessGroupName;
                                            toast.error(`Failed to assign entrances to ${accessGroupName}`);
                                        }
                                    })
                                }
                            )
                        })

                    const numCreated = accessGroupInfoArr.length - failedResIndex.length;
                    if (numCreated) {
                        toast.success(`${numCreated} access groups created`); 
                    }

                    if (failedResIndex.length) {
                        // some failed
                        toast.error('Error creating the highlighted access groups');
                        Promise.all(failedResIndex.map(i => resArr[i].json()))
                            .then(failedResArr => {
                                // TODO failedResArr map field errors to fields
                                setAccessGroupInfoArr(failedResIndex.map(i => accessGroupInfoArr[i])); // set failed access groups to stay
                                setAccessGroupValidationsArr(failedResIndex.map(i => accessGroupValidationsArr[i])); // set failed access group validations to stay
                            });
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
                            href={accessGroupListLink}
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
                            { accessGroupInfoArr.map((accessGroupInfo, i) => {
                                const id = accessGroupInfo.accessGroupId
                                return (
                                    <AccessGroupAddForm
                                        key={id}
                                        accessGroupInfo={accessGroupInfo}
                                        removeCard={removeCard}
                                        allPersons={allPersons}
                                        accessGroupValidations={accessGroupValidationsArr[i]}
                                        onNameChange={onNameChangeFactory(id)}
                                        onDescriptionChange={onDescriptionChangeFactory(id)}
                                        onPersonChange={onPersonChangeFactory(id)}
                                        duplicatedPerson={duplicatedPerson}
                                        allEntrances={allEntrances}
                                        onEntranceChange={onEntranceChangeFactory(id)}
                                    />
                                )
                            })}
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