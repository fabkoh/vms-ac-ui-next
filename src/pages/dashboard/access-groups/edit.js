import { useEffect, useState, useCallback } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { Link, Box, Container, Typography, Stack, Button, Grid } from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import AccessGroupEditForm from "../../../components/dashboard/access-groups/forms/access-group-add-form";
import { AuthGuard } from '../../../components/authentication/auth-guard';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import { personApi } from "../../../api/person";
import { accessGroupApi } from "../../../api/access-groups";
import entranceApi from "../../../api/entrance";
import { useMounted } from "../../../hooks/use-mounted";
import toast from "react-hot-toast";
import router from "next/router";
import formUtils from "../../../utils/form-utils";
import accessGroupEntranceApi from "../../../api/access-group-entrance-n-to-n";
import { controllerApi } from "../../../api/controllers";
import { serverDownCode } from "../../../api/api-helpers";

const EditAccessGroups = () => {

    // edited access groups logic
    const [accessGroupInfoArr, setAccessGroupInfoArr] = useState([]);
    const [accessGroupValidationsArr, 
        setAccessGroupValidationsArr] = useState([]);

    // load access groups to be edited
    const getAccessGroups = async ids => {
        const accessGroups = [];
        const validations = [];

        // map each id to a fetch req for that access group
        const resArr = await Promise.all(ids.map(id => accessGroupApi.getAccessGroup(id)));
        const successfulRes = resArr.filter(res => res.status == 200);
        const serverDownRes = resArr.filter(res => res.status == serverDownCode);

        if (serverDownRes.length > 0) {
            toast.error("Error editing access groups due to server is down. Please try again");
            router.replace('/dashboard/access-groups');
            return;
        }

        // no access groups to edit
        if (successfulRes.length == 0) {
            toast.error('Error editing access groups. Please try again');
            router.replace('/dashboard/access-groups');
        }

        // some groups not found
        if (successfulRes.length != resArr.length) {
            toast.error('Some access groups were not found');
        }

        const bodyArr = await Promise.all(successfulRes.map(req => req.json()));

        bodyArr.forEach(body => {
            accessGroups.push({
                accessGroupId: body.accessGroupId,
                accessGroupName: body.accessGroupName,
                accessGroupDesc: body.accessGroupDesc,
                isActive: body.isActive,
                persons: body.persons,
                entrances: [], // for now
                originalName: body.accessGroupName, // fields for validation
                originalPersonIds: body.persons.map(p => p.personId)
            });
            validations.push({
                accessGroupId: body.accessGroupId,
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
        });

        setAccessGroupValidationsArr(validations);
        setAccessGroupInfoArr(accessGroups);

        return accessGroups; // for extension (see useEffect() below)
    }

    const getGroupEntrances = async (groups) => {
        const accessGroups = [ ...groups ];
        const resArr = await Promise.all(accessGroups.map(group => accessGroupEntranceApi.getEntranceWhereAccessGroupId(group.accessGroupId)));
        const serverDownArr = resArr.filter(res => res.status == serverDownCode);

        if (serverDownArr.length > 0) {
            toast.error("Error getting entrances due to server is down. Please try again");
            router.replace('/dashboard/access-groups');
            return;
        }

        const successfulResIndex = [];
        resArr.forEach((res, i) => {
            if (res.status == 200) {
                successfulResIndex.push(i);
            } else {
                toast.error(`Entrances for ${accessGroups[i].accessGroupName} not loaded. Please clear to prevent changes to entrance`);
            }
        });
        const bodyArr = await Promise.all(successfulResIndex.map(i => resArr[i].json()));
        bodyArr.forEach((body, i) => {
            accessGroups[successfulResIndex[i]].entrances = body.map(e => e.entrance);
        })

        setAccessGroupInfoArr(accessGroups);

        return accessGroups; // for extension (see useEffect() below)
    }

    useEffect( async () => {
        try {
            getGroupEntrances(
                await getAccessGroups(JSON.parse(decodeURIComponent(router.query.ids)))
            );
        } catch(e){
            router.replace('/dashboard/access-groups')
        }
    }, [])

    // persons logic (displaying in dropdown box)
    const isPersonMounted = useMounted();
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
    }, [isPersonMounted]);

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

        if (newAccessGroupInfoArr.length == 0) {
            router.replace('/dashboard/access-groups'); // redirect if nothing left to edit
        }

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

        // store a temp updated access group info (not for updating purposes)
        const newAccessGroupInfoArr = [ ...accessGroupInfoArr ];
        const newCurrAccessGroup = newAccessGroupInfoArr.find(group => group.accessGroupId == id);
        newCurrAccessGroup.accessGroupName = accessGroupName;

        // remove submit failed
        validation.submitFailed = false;

        // check name is blank?
        validation.accessGroupNameBlank = formUtils.checkBlank(accessGroupName);

        // check name exists?
        validation.accessGroupNameExists = (
            newCurrAccessGroup.originalName != accessGroupName &&
            !!accessGroupNames[accessGroupName]
        );

        // check name duplicated
        checkDuplicateName(newAccessGroupInfoArr, newValidations);

        setAccessGroupValidationsArr(newValidations);
    }

    const changePersonCheck = (newValue, id) => {
        // check if person has existing access group
        const validations = [ ...accessGroupValidationsArr ];
        const validation = validations.find(v => v.accessGroupId == id);

        const newAccessGroupInfoArr = [ ...accessGroupInfoArr ];
        const newAccessGroupInfo = newAccessGroupInfoArr.find(group => group.accessGroupId == id);
        newAccessGroupInfo.persons = newValue; // hold an updated copy of access group info for validation checks

        // remove submit failed
        validation.submitFailed = false;

        // some selected persons has access group already
        const originalPersonIds = newAccessGroupInfo.originalPersonIds;
        validation.accessGroupPersonHasAccessGroup = newValue.some(
            person => person.accessGroup && !originalPersonIds.includes(person.personId)
        );

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

    const submitForm = async e => {
        e.preventDefault(); 

        setSubmitted(true);

        const resArr = await Promise.all(accessGroupInfoArr.map(group => accessGroupApi.updateAccessGroup(group)));
        
        const successStatus = [];
        const successfulResIndex = [];

        resArr.forEach((res, i) => {
            if(res.status == 200) {
                successStatus.push(true);
                successfulResIndex.push(i);
            } else {
                successStatus.push(false);
            }
        });

        const entranceResArr = await Promise.all(
            successfulResIndex.map(i => {
                const accessGroup = accessGroupInfoArr[i];
                return accessGroupEntranceApi.assignEntrancesToAccessGroup(
                    accessGroup.entrances.map(e => e.entranceId),
                    accessGroup.accessGroupId
                );
            })
        )
        entranceResArr.forEach((res, i) => {
            if (res.status != 204) {
                successStatus[successfulResIndex[i]] = false;
            }
        })

        const numEdited = successStatus.filter(status => status).length;
        if (numEdited) {
            toast.success(`${numEdited} access groups edited`);
            if (numEdited == resArr.length) { // all success
                router.replace('/dashboard/access-groups');
                return;
            }
        }

        toast.error('Error updating the below access groups');
        setAccessGroupInfoArr(accessGroupInfoArr.filter((e, i) => !(successStatus[i])));
        setAccessGroupValidationsArr(accessGroupValidationsArr.filter((e, i) => !(successStatus[i])));
        setSubmitted(false);
    }

    return(
        <>
            <Head>
                <title>
                    Etlas: Edit Access Groups
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
                            Edit Access Groups
                        </Typography>
                    </Box>
                    <form onSubmit={submitForm}>
                        <Stack spacing={3}>
                            { accessGroupInfoArr.map((accessGroupInfo, i) => {
                                const id = accessGroupInfo.accessGroupId
                                return (
                                    <AccessGroupEditForm
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
                                        edit
                                    />
                                )
                            })}
                            <Grid container>
                                <Grid item
marginRight={3}>
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

EditAccessGroups.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>
            { page }
        </DashboardLayout>
    </AuthGuard>
)

export default EditAccessGroups;