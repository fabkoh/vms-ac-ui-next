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
import { useMounted } from "../../../hooks/use-mounted";
import toast from "react-hot-toast";
import router from "next/router";
import formUtils from "../../../utils/form-utils";

const EditAccessGroups = () => {

    // edited access groups logic
    const isAccessGroupMounted = useMounted();
    const [accessGroupInfoArr, setAccessGroupInfoArr] = useState([]);
    const [accessGroupValidationsArr, 
        setAccessGroupValidationsArr] = useState([]);

    // load access groups to be edited
    const getAccessGroups = ids => {
        // map each id to a fetch req for that access group
        Promise.all(ids.map(id => accessGroupApi.getAccessGroup(id)))
            .then(resArr => {
                // get all successful req
                const successfulReq = resArr.filter(res => res.status == 200);

                if (successfulReq.length == 0) {
                    // no access groups found
                    toast.error('Error editing access groups. Please refresh and try again');
                    router.replace('/dashboard/access-groups');
                };

                if (successfulReq.length != resArr.length) {
                    // some access groups not found
                    toast.error('Some access groups were not found.');
                };

                // get all req bodies
                Promise.all(successfulReq.map(req => req.json()))
                    .then(accessGroupArr => {                        
                        const validation = []
                        // create a validation for each access group
                        accessGroupArr.forEach(
                            group => validation.push({
                                accessGroupId: group.accessGroupId,
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
                            })
                        );
                        setAccessGroupValidationsArr(validation);
                        setAccessGroupInfoArr(
                            accessGroupArr.map(
                                group => {
                                    return {
                                        accessGroupId: group.accessGroupId,
                                        accessGroupName: group.accessGroupName,
                                        accessGroupDesc: group.accessGroupDesc,
                                        person: group.person,
                                        originalName: group.accessGroupName, // do not change original fields as they are needed for validations
                                        originalPersonIds: group.person.map(p => p.personId)
                                    }
                                }
                            )
                        );
                    })
            });
    }

    useEffect(() => {
        try {
            getAccessGroups(JSON.parse(decodeURIComponent(router.query.ids)));
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
        updatedInfo.find(info => info.accessGroupId == id).person = newValue;
        setAccessGroupInfoArr(updatedInfo);
        console.log(updatedInfo);
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
        newAccessGroupInfo.person = newValue; // hold an updated copy of access group info for validation checks

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
                            { accessGroupInfoArr.map((accessGroupInfo, i) => (
                                <AccessGroupEditForm
                                    key={accessGroupInfo.accessGroupId}
                                    accessGroupInfo={accessGroupInfo}
                                    removeCard={removeCard}
                                    allPersons={allPersons}
                                    accessGroupValidations={accessGroupValidationsArr[i]}
                                    changeTextField={changeTextField}
                                    changePerson={changePerson}
                                    changeNameCheck={changeNameCheck}
                                    changePersonCheck={changePersonCheck}
                                    duplicatedPerson={duplicatedPerson}
                                    edit
                                />
                            ))}
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

EditAccessGroups.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>
            { page }
        </DashboardLayout>
    </AuthGuard>
)

export default EditAccessGroups;