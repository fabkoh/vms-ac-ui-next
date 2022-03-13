import { useEffect, useState, useCallback } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { Link, Box, Container, Typography, Stack, Button, Grid } from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import EntranceEditForm from "../../../components/dashboard/entrances/forms/entrance-add-form";
import { AuthGuard } from '../../../components/authentication/auth-guard';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import { accessGroupApi } from "../../../api/access-groups";
import entranceApi from "../../../api/entrance";
import { useMounted } from "../../../hooks/use-mounted";
import toast from "react-hot-toast";
import router from "next/router";
import formUtils from "../../../utils/form-utils";
import accessGroupEntranceApi from "../../../api/access-group-entrance-n-to-n";

const EditEntrances = () => {

    // edited entrance logic
    const [entranceInfoArr, setEntranceInfoArr] = useState([]);
    const [entranceValidationsArr, 
        setEntranceValidationsArr] = useState([]);

    // load entrance to be edited
    const getEntrances = async ids => {
        const entrances = [];
        const validations = [];

        // map each id to a fetch req for that access group
        const resArr = await Promise.all(ids.map(id => entranceApi.getEntrance(id)));
        const successfulRes = resArr.filter(res => res.status == 200);

        // no entrances to edit
        if (successfulRes.length == 0) {
            toast.error('Error editing entrance. Please try again');
            router.replace('/dashboard/entrances');
        }

        // some entrances not found
        if (successfulRes.length != resArr.length) {
            toast.error('Some entrances were not found');
        }

        const bodyArr = await Promise.all(successfulRes.map(req => req.json()));

        bodyArr.forEach(body => {
            entrances.push({
                entranceId: body.entranceId,
                entranceName: body.entranceName,
                entranceDesc: body.entranceDesc,
                accessGroups: [],
                originalName: body.entranceName, // fields for validation
                originalAccessGroupIds: body.accessGroups.map(p => p.accessGroupId)
            });
            validations.push({
                entranceId: body.entranceId,
                entranceNameBlank: false,
                entranceDescBlank: false,

                // name in database (error)
                entranceNameExists: false,

                // name duplicated in form (error)
                entranceNameDuplicated: false,

                // access group has entrance (note)
                //entranceHasAccessGroup: false,

                // person in two access groups in same form (error) 
                //accessGroupPersonDuplicated: false,

                // submit failed
                submitFailed: false
            });
        });

        setEntranceValidationsArr(validations);
        setEntranceInfoArr(entrances);

        return entrances; // for extension (see useEffect() below)
    }

    const getAccessGroupsEntrances = async (entrances) => {
        const entrance = [ ...entrances ];
        const resArr = await Promise.all(entrance.map(e => accessGroupEntranceApi.getAccessGroupWhereEntranceId(e.entranceId)));
        const successfulResIndex = [];
        resArr.forEach((res, i) => {
            if (res.status == 200) {
                successfulResIndex.push(i);
            } else {
                toast.error(`Access Groups for ${entrance[i].entranceName} not loaded. Please clear to prevent changes`);
            }
        });
        const bodyArr = await Promise.all(successfulResIndex.map(i => resArr[i].json()));
        bodyArr.forEach((body, i) => {
            entrances[successfulResIndex[i]].accessGroups = body.map(group => group.accessGroup);
        })

        setEntranceInfoArr(entrances);

        return entrances; // for extension (see useEffect() below)
    }

    useEffect( async () => {
        try {
            getAccessGroupsEntrances(
                await getEntrances(JSON.parse(decodeURIComponent(router.query.ids)))
            );
        } catch(e){
            router.replace('/dashboard/entrances')
        }
    }, [])

    // fetch all access groups info
    const isAccessGroupMounted = useMounted();
    const [allAccessGroups, setAllAccessGroups] = useState([]);
    const getAccessGroups = useCallback( async() => {
        try {
            const res = await accessGroupApi.getAccessGroups();
            if (res.status == 200) {
                const body = await res.json();
                setAllAccessGroups(body);
            } else {
                throw new Error("Access Groups not loaded");
            }
        } catch(e) {
            console.error(e);
            toast.error("Access Groups info not loaded")
        }
    }, [isAccessGroupMounted]);
    
    useEffect(() => {
        getAccessGroups();    
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [])

    // stores the duplicated person ids
    //const [duplicatedPerson, setDuplicatedPerson] = useState({});

    // store previous entrance names
    const [entranceNames, setEntranceNames] = useState({});
    useEffect(() => {
        entranceApi.getEntrances()
            .then(async res => {
                const newEntranceNames = {}
                if (res.status == 200) {
                    const body = await res.json();
                    body.forEach(e => newEntranceNames[e.entranceName] = true); 
                    setEntranceNames(newEntranceNames);
                }
            })
    }, []);
    

    // helper for remove card and changeNameCheck
    // directly modifies validationArr
    const checkDuplicateName = (groupArr, validationArr) => {
        const duplicatedNames = formUtils.getDuplicates(
            groupArr
                // get entrance names
                .map(group => group.entranceName)
                // keep the ones that are not blank strings
                .filter(name => !(/^\s*$/.test(name)))
        );
        for(let i=0; i<groupArr.length; i++) {
            validationArr[i].entranceNameDuplicated = groupArr[i].entranceName in duplicatedNames;
        }
    }

    // helper for removeCard and changePersonCheck
    // directly modifies validationArr, return newDuplicatedPerson
  /*  const checkDuplicatePerson = (groupArr, validationArr) => {
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
    } */

    // remove card logic
    const removeCard = (id) => {
        const newEntranceInfoArr = entranceInfoArr.filter(info => info.entranceId != id);
        const newValidations = entranceValidationsArr.filter(validation => validation.entranceId != id);

        if (newEntranceInfoArr.length == 0) {
            router.replace('/dashboard/entrances'); // redirect if nothing left to edit
        }

        // check name duplicated
        checkDuplicateName(newEntranceInfoArr, newValidations);
        
        // check person duplicated
        //setDuplicatedPerson(checkDuplicatePerson(newAccessGroupInfoArr, newValidations)); 

        setEntranceInfoArr(newEntranceInfoArr);
        setEntranceValidationsArr(newValidations);       
    }
    
    // update methods for form inputs
    const changeTextField = (e, id) => {
        const updatedInfo = [ ...entranceInfoArr ];
        // this method is reliant on text field having a name field == key in info object ie entranceName, entranceDesc
        updatedInfo.find(info => info.entranceId == id)[e.target.name] = e.target.value;
        setEntranceInfoArr(updatedInfo);
    }

   /* const changePerson = (newValue, id) => {
        const updatedInfo = [ ...accessGroupInfoArr ];
        updatedInfo.find(info => info.accessGroupId == id).persons = newValue;
        setAccessGroupInfoArr(updatedInfo);
    } */

    // error checking methods
    const changeNameCheck = async (e, id) => {
        const entranceName = e.target.value;
        const newValidations = [ ...entranceValidationsArr ];
        const validation = newValidations.find(v => v.entranceId == id);

        // store a temp updated access group info (not for updating purposes)
        const newEntranceInfoArr = [ ...entranceInfoArr ]
        const newCurrEntrance = newEntranceInfoArr.find(e => e.entranceId == id);
        newCurrEntrance.entranceName = entranceName;

        // remove submit failed
        validation.submitFailed = false;

        // check name is blank?
        validation.entranceNameBlank = formUtils.checkBlank(entranceName);

        // check name exists?
        validation.entranceNameExists = (
            newCurrEntrance.originalName != entranceName &&
            !!entranceNames[entranceName]
        );

        // check name duplicated
        checkDuplicateName(newEntranceInfoArr, newValidations);

        setEntranceValidationsArr(newValidations);
    }

  /*  const changePersonCheck = (newValue, id) => {
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
    } */

    // access group logic
    const changeAccessGroup = (newValue, id) => {
        const updatedInfo = [ ...entranceInfoArr ];
        updatedInfo.find(info => info.entranceId == id).accessGroups = newValue;
        setEntranceInfoArr(updatedInfo);
    }

    // currying for cleaner code
    const onAccessGroupChangeFactory = (id) => (newValue) => changeAccessGroup(newValue, id);
    const onNameChangeFactory = (id) => (e) => {
        changeTextField(e, id);
        changeNameCheck(e, id);
    }
    const onDescriptionChangeFactory = (id) => (e) => changeTextField(e, id);

    const [submitted, setSubmitted] = useState(false);

    const submitForm = async e => {
        e.preventDefault(); 

        setSubmitted(true);

        const resArr = await Promise.all(entranceInfoArr.map(e => entranceApi.updateEntrance(e)));
        
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

        //assign entrance to access groups
        const entranceResArr = await Promise.all(
            successfulResIndex.map(i => {
                const entrance = entranceInfoArr[i];
                return accessGroupEntranceApi.assignAccessGroupToEntrance(
                    entrance.entranceId,
                    entrance.accessGroups.map(grp => grp.accessGroupId)
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
            toast.success(`${numEdited} entrances edited`);
            if (numEdited == resArr.length) { // all success
                router.replace('/dashboard/entrances');
                return;
            }
        }

        toast.error('Error updating the below entrances');
        setEntranceInfoArr(entranceInfoArr.filter((e, i) => !(successStatus[i])));
        setEntranceValidationsArr(entranceValidationsArr.filter((e, i) => !(successStatus[i])));
        setSubmitted(false);
    }

    return(
        <>
            <Head>
                <title>
                    Etlas: Edit Entrances
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
                            href="/dashboard/entrances"
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
                                    Entrances
                                </Typography>
                            </Link>
                        </NextLink>
                    </Box>
                    <Box marginBottom={3}>
                        <Typography variant="h3">
                            Edit Entrances
                        </Typography>
                    </Box>
                    <form onSubmit={submitForm}>
                        <Stack spacing={3}>
                            { entranceInfoArr.map((entranceInfo, i) => {
                                const id = entranceInfo.entranceId
                                return (
                                    <EntranceEditForm
                                        key={id}
                                        entranceInfo={entranceInfo}
                                        removeCard={removeCard}
                                        entranceValidations={entranceValidationsArr[i]}
                                        onNameChange={onNameChangeFactory(id)}
                                        onDescriptionChange={onDescriptionChangeFactory(id)}
                                        allAccessGroups={allAccessGroups}
                                        onAccessGroupChange={onAccessGroupChangeFactory(id)}
                                        edit
                                    />
                                )
                            })}
                            <Grid container>
                                <Grid item marginRight={3}>
                                    <Button
                                        type="submit"
                                        size="large"
                                        variant="contained"
                                        disabled={
                                            submitted                      ||
                                            entranceInfoArr.length == 0 || // no entrances to submit
                                            entranceValidationsArr.some( // check if validations fail
                                                validation => validation.entranceNameBlank        ||
                                                              validation.entranceNameExists       ||
                                                              validation.entranceDuplicated
                                            )
                                        }
                                    >
                                        Submit
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <NextLink
                                        href="/dashboard/entrances/"
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

EditEntrances.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>
            { page }
        </DashboardLayout>
    </AuthGuard>
)

export default EditEntrances;