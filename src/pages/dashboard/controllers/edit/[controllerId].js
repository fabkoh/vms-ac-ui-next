import { useEffect, useState, useCallback } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { Link, Box, Container, Typography, Stack, Button, Grid } from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import AccessGroupEditForm from "../../../../components/dashboard/access-groups/forms/access-group-add-form";
import { AuthGuard } from '../../../../components/authentication/auth-guard';
import { DashboardLayout } from '../../../../components/dashboard/dashboard-layout';
import { personApi } from "../../../../api/person";
import { accessGroupApi } from "../../../../api/access-groups";
import entranceApi from "../../../../api/entrance";
import { useMounted } from "../../../../hooks/use-mounted";
import toast from "react-hot-toast";
import router from "next/router";
import formUtils from "../../../../utils/form-utils";
import accessGroupEntranceApi from "../../../../api/access-group-entrance-n-to-n";
import ControllerEditForm from "../../../../components/dashboard/controllers/controller-edit-form";
import AssignAuthDevice from "../../../../components/dashboard/controllers/assign-auth-device";
import { getControllerListLink } from "../../../../utils/controller";

const EditController = () => {

    // edited access groups logic
    const [accessGroupInfoArr, setAccessGroupInfoArr] = useState([]);
    const [accessGroupValidationsArr, 
        setAccessGroupValidationsArr] = useState([]);
    
        //         await getAccessGroups(JSON.parse(decodeURIComponent(router.query.ids)))


    useEffect( async () => {
        // try {
        //     getGroupEntrances(
        //         await getAccessGroups(JSON.parse(decodeURIComponent(router.query.ids)))
        //     );
        // } catch(e){
        //     router.replace('/dashboard/access-groups')
        // }
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
                    Etlas: Edit Controller
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
                            href={getControllerListLink()} 
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
                                    Controllers
                                </Typography>
                            </Link>
                        </NextLink>
                    </Box>
                    <Box marginBottom={3}>
                        <Typography variant="h3">
                            Edit Controller
                        </Typography>
                    </Box>
                    <form onSubmit={submitForm}>
                        <Stack spacing={3}>
                                <ControllerEditForm/>
                                <AssignAuthDevice
                                />
                                <AssignAuthDevice
                                />
                            <Grid container>
                                <Grid item marginRight={3}>
                                    <Button
                                        type="submit"
                                        size="large"
                                        variant="contained"
                                        disabled={
                                            true
                                        }
                                        // disabled={
                                        //     submitted                      ||
                                        //     accessGroupInfoArr.length == 0 || // no access groups to submit
                                        //     accessGroupValidationsArr.some( // check if validations fail
                                        //         validation => validation.accessGroupNameBlank        ||
                                        //                       validation.accessGroupNameExists       ||
                                        //                       validation.accessGroupNameDuplicated   ||
                                        //                       validation.accessGroupPersonDuplicated
                                        //     )
                                        // }
                                    >
                                        Submit
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <NextLink
                                        href={getControllerListLink()} 
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

EditController.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>
            { page }
        </DashboardLayout>
    </AuthGuard>
)

export default EditController;