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
import videoRecorderApi from "../../../../api/videorecorder";
import { getVideoRecorderEditLink, getVideoRecorderListLink, getVideoRecorderDetailsLink, videoRecorderListLink } from "../../../../utils/video-recorder";
import { authDeviceApi } from "../../../../api/auth-devices";
import { useRouter } from "next/router";
import { serverDownCode } from "../../../../api/api-helpers";
import { ServerDownError } from "../../../../components/dashboard/errors/server-down-error";
import VideoRecorderEditForm from "../../../../components/dashboard/video-recorders/video-edit";

const EditVideoRecorder = () => {
    const router = useRouter();
    const ids = JSON.parse(decodeURIComponent(router.query.ids));
    console.log(router)
    const isMounted = useMounted();
    const [recorderInfoArr, setRecorderInfoArr] = useState([])
    const [serverDownOpen, setServerDownOpen] = useState(false);

    const getEmptyRecorderValidations = (recorderId) => ({
        recorderId,
        recorderNameBlank: false,
        recorderUsernameBlank: false,
        recorderPasswordBlank: false,
        recorderPublicIpBlank: false,
        recorderPrivateIpBlank: false,
        recorderIWSPortBlank: false,

        // Name should ideally be unique
        recorderNameExists: false,
        recorderNameDuplicated: false,

        // Port number should be unique between recorders
        recorderPortNumberExist: false,
        recorderPortNumberDuplicated: false,

        // Port number should be unique between recorders
        recorderIWSPortExist: false,
        recorderIWSPortDuplicated: false,

        // private IP address must be unique between recorders
        recorderPrivateIpExists: false,
        recorderPrivateIpDuplicated: false,

        recorderNameError: "",
        recorderUsernameError: "",
        recorderPasswordError: "",
        recorderPublicIpError: "",
        recorderPrivateIpError: "",
        recorderPortNumberError: "",
        recorderIWSPortError: "",

        submitFailed: false
    });

    // store previous video recorder names & ip addresses
    const [recorderNames, setRecorderNames] = useState({});
    const [recorderPrivateIpes, setRecorderPrivateIpes] = useState({});
    const [recorderPortNumbers, setRecorderPortNumbers] = useState({});


    useEffect(() => {
        videoRecorderApi.getRecorders()
            .then(async res => {
                const newRecorderNames = {}
                const newRecorderPrivateIpes = {}
                const newRecorderPortNumbers = {}
                if (res.status == 200) {
                    const body = await res.json();
                    body.forEach(recorder => {
                        if (!(ids.includes(recorder.recorderId))){
                        newRecorderPrivateIpes[recorder.recorderPrivateIp] = true;
                        newRecorderNames[recorder.recorderName] = true;
                        newRecorderPortNumbers[recorder.recorderPortNumber] = true;
                        newRecorderPortNumbers[recorder.recorderIWSPort] = true;
                        }
                    }); 
                    setRecorderNames(newRecorderNames);
                    setRecorderPrivateIpes(newRecorderPrivateIpes);
                    setRecorderPortNumbers(newRecorderPortNumbers);
                } else if (res.status == serverDownCode) {
                    setServerDownOpen(true);
                }
            })
    }, []);

    const [recorderValidationsArr, 
        setRecorderValidationsArr] = useState(ids.map(i => getEmptyRecorderValidations(i)));

    const getVideoRecorder = async ids => {
        console.log(ids)
        // map each id to a fetch req for that access group
        const resArr = await Promise.all(ids.map(id => videoRecorderApi.getRecorder(id)
        ));
        const successfulRes = resArr.filter(res => res.status == 200);
        
        // no persons to edit
        if (successfulRes.length == 0) {
            toast.error('Error editing recorders. Please try again');
            router.replace('/dashboard/video-recorders');
        }
        
        // some persons not found
        if (successfulRes.length != resArr.length) {
            toast.error('Some recorders were not found');
        }
        
        const bodyArr = await Promise.all(successfulRes.map(req => req.json()));

        // setPersonsValidation(validations);
        setRecorderInfoArr(bodyArr);
    }
    //  {
    //     try{
    //         Promise.resolve(videoRecorderApi.getRecorder(recorderId)) 
    //         .then( async res=>{
    //             if(res.status==200){
    //                 const data = await res.json()
    //                 setRecorderInfoArr([data])
    //                 console.log("loaded video recorder")
    //             }
    //             else {
    //                 if (res.status == serverDownCode) {
    //                     setServerDownOpen(true);
    //                 }
    //                 toast.error("Video recorder info not found")
    //                 //router.replace(getControllerListLink())
    //             }
    //         })
    //     }catch(err){console.log(err)}
    // }


    const getInfo = useCallback(() => {
        getVideoRecorder(ids)
        //getStatus()
    }, [isMounted])

    useEffect(() => {
        getInfo();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    [])

    const [submitted, setSubmitted] = useState(false);
    
    const submitDisabled = (
        recorderInfoArr.length == 0 || // no recorders to submit
        recorderValidationsArr.some( // check if validations fail
            validation => validation.recorderNameBlank ||
                validation.recorderNameDuplicated ||
                validation.recorderNameExists ||
                validation.recorderPublicIpBlank ||
                validation.recorderPublicIpExists ||
                validation.recorderPrivateIpBlank ||
                validation.recorderPrivateIpDuplicated ||
                validation.recorderPrivateIpExists ||
                validation.recorderPortNumberDuplicated ||
                validation.recorderPortNumberExist ||
                validation.recorderIWSPortDuplicated ||
                validation.recorderIWSPortExist ||
                validation.recorderUsernameBlank ||
                validation.recorderPasswordBlank
        )
    );

    const [disableSubmit, setDisableSubmit] = useState(false);


    const changeIPHandler = (e) => {
        changeIP(e);
        checkIP(e);
    }
    const [loading, setLoading] = useState(true)



    const checkDuplicateName = (groupArr, validationArr) => {
        const duplicatedNames = formUtils.getDuplicates(
            groupArr
                // get recorder names
                .map(group => group.recorderName)
                // keep the ones that are not blank strings
                .filter(name => !(/^\s*$/.test(name)))
        );
        for(let i=0; i<groupArr.length; i++) {
            validationArr[i].recorderNameDuplicated = groupArr[i].recorderName in duplicatedNames;
        }
    }

    // helper for remove card and changePrivateIpCheck
    // directly modifies validationArr
    const checkDuplicatePrivateIp = (groupArr, validationArr) => {
        const duplicatedPrivateIp = formUtils.getDuplicates(
            groupArr
                // get recorder IP address
                .map(group => group.recorderPrivateIp)
                // keep the ones that are not blank strings
                .filter(ip => !(/^\s*$/.test(ip)))
        );
        for(let i=0; i<groupArr.length; i++) {
            validationArr[i].recorderPrivateIpDuplicated = groupArr[i].recorderPrivateIp in duplicatedPrivateIp;
        }
    }

    // helper for remove card and changePortNumberCheck
    // directly modifies validationArr
    const checkDuplicatePortNumber = (groupArr, validationArr) => {
        const duplicatedPortNumber = formUtils.getDuplicates(
            groupArr
                // get recorder IP address
                .map(group => group.recorderPortNumber)
                // keep the ones that are not blank strings
                .filter(ip => !(/^\s*$/.test(ip)))
        );
        for(let i=0; i<groupArr.length; i++) {
            validationArr[i].recorderPortNumberDuplicated = groupArr[i].recorderPortNumber in duplicatedPortNumber;

        }
    }

    // helper for remove card and changeIWSPortCheck
    // directly modifies validationArr
    const checkDuplicateIWSPort = (groupArr, validationArr) => {
        const duplicatedIWSPort = formUtils.getDuplicates(
            groupArr
                // get recorder IP address
                .map(group => group.recorderIWSPort)
                // keep the ones that are not blank strings
                .filter(ip => !(/^\s*$/.test(ip)))
        );
        for(let i=0; i<groupArr.length; i++) {
            validationArr[i].recorderIWSPortDuplicated = groupArr[i].recorderIWSPort in duplicatedIWSPort;

        }
    }

    // remove card logic
    const removeCard = (id) => {
        const newEntranceInfoArr = recorderInfoArr.filter(info => info.recorderId != id);
        const newValidations = recorderValidationsArr.filter(validation => validation.recorderId != id);

        // check name duplicated
        checkDuplicateName(newEntranceInfoArr, newValidations);
        checkDuplicatePrivateIp(newEntranceInfoArr, newValidations);

        setRecorderInfoArr(newEntranceInfoArr);
        setRecorderValidationsArr(newValidations);       
    }

    const handleToggleDefaultIP = (id) => (e) => {
        const updatedInfo = [ ...recorderInfoArr ];
        // this method is reliant on text field having a name field == key in info object ie recorderName, recorderPrivateIp, etc
        updatedInfo.find(info => info.recorderId == id)["defaultIP"] = 
            !(updatedInfo.find(info => info.recorderId == id)["defaultIP"]);
        e.target.value = "118.201.255.164";
        e.target.name = "recorderPublicIp";
        onPublicIpChangeFactory(id)(e);
    }

    const handleToggleAutoPortForwarding = (id) => (e) => {
        //console.log(12345,"here");
        const updatedInfo = [ ...recorderInfoArr ];
        // this method is reliant on text field having a name field == key in info object ie recorderName, recorderPrivateIp, etc
        updatedInfo.find(info => info.recorderId == id)["autoPortForwarding"] = 
            !(updatedInfo.find(info => info.recorderId == id)["autoPortForwarding"]);
        setRecorderInfoArr(updatedInfo);
    } 

    
    // update methods for form inputs
    const changeTextField = (e, id) => {
        const updatedInfo = [ ...recorderInfoArr ];
        // this method is reliant on text field having a name field == key in info object ie recorderName, recorderPrivateIp, etc
        updatedInfo.find(info => info.recorderId == id)[e.target.name] = e.target.value;
        setRecorderInfoArr(updatedInfo);
    }

    // error checking methods
    const changeNameCheck = async (e, id) => {
        const recorderName = e.target.value;
        const newValidations = [ ...recorderValidationsArr ];
        const validation = newValidations.find(v => v.recorderId == id);

        // store a temp updated access group info
        const newRecorderInfoArr = [ ...recorderInfoArr ]
        newRecorderInfoArr.find(group => group.recorderId == id).recorderName = recorderName;

        // remove submit failed and error
        validation.submitFailed = false;
        validation.recorderNameError = "";

        // check name is blank?
        validation.recorderNameBlank = formUtils.checkBlank(recorderName);

        // check name exists?
        validation.recorderNameExists = !!recorderNames[recorderName];

        // check name duplicated
        checkDuplicateName(newRecorderInfoArr, newValidations);

        setRecorderValidationsArr(newValidations);
    }


    const onNameChangeFactory = (id) => (e) => {
        changeTextField(e, id);
        changeNameCheck(e, id);
    }

    const onPublicIpChangeFactory = (id) => (e) => {
        changeTextField(e, id);
        const recorderPublicIp = e.target.value;
        const newValidations = [...recorderValidationsArr];
        const validation = newValidations.find(v => v.recorderId == id);
        validation.recorderPublicIpBlank = formUtils.checkBlank(recorderPublicIp);
        validation.recorderPublicIpError = "";
        setRecorderValidationsArr(newValidations);
    }

    const onUsernameChangeFactory = (id) => (e) => {
        changeTextField(e, id);
        const recorderUsername = e.target.value;
        const newValidations = [...recorderValidationsArr];
        const validation = newValidations.find(v => v.recorderId == id);
        validation.recorderUsernameBlank = formUtils.checkBlank(recorderUsername);
        validation.recorderUsernameError = "";
        setRecorderValidationsArr(newValidations);
    }

    const onPasswordChangeFactory = (id) => (e) => {
        changeTextField(e, id);
        const recorderPassword = e.target.value;
        const newValidations = [...recorderValidationsArr];
        const validation = newValidations.find(v => v.recorderId == id);
        validation.recorderPasswordBlank = formUtils.checkBlank(recorderPassword);
        validation.recorderPasswordError = "";
        setRecorderValidationsArr(newValidations);
    }
    
    const changePrivateIpCheck = async (e, id) => {
        const recorderPrivateIp = e.target.value;
        const newValidations = [ ...recorderValidationsArr ];
        const validation = newValidations.find(v => v.recorderId == id);

        // store a temp updated access group info
        const newRecorderInfoArr = [ ...recorderInfoArr ]
        newRecorderInfoArr.find(group => group.recorderId == id).recorderPrivateIp = recorderPrivateIp;

        // remove submit failed and error
        validation.submitFailed = false;
        validation.recorderPrivateIpError = "";

        // check ip address blank
        validation.recorderPrivateIpBlank = formUtils.checkBlank(recorderPrivateIp);

        // check ip address exists?
        validation.recorderPrivateIpExists = !!recorderPrivateIpes[recorderPrivateIp];

        // check ip address duplicated
        checkDuplicatePrivateIp(newRecorderInfoArr, newValidations);

        setRecorderValidationsArr(newValidations);
    }
    const onPrivateIpChangeFactory = (id) => (e) => {
        changeTextField(e, id);
        changePrivateIpCheck(e, id);
    }

    const changePortNumberCheck = async (e, id) => {
        const recorderPortNumber = e.target.value;
        const newValidations = [ ...recorderValidationsArr ];
        const validation = newValidations.find(v => v.recorderId == id);

        // store a temp updated access group info
        const newRecorderInfoArr = [ ...recorderInfoArr ]
        newRecorderInfoArr.find(group => group.recorderId == id).recorderPortNumber = recorderPortNumber;

        // remove submit failed and error
        validation.submitFailed = false;
        validation.recorderPortNumberError = "";

        // check port number exists?
        validation.recorderPortNumberExists = !!recorderPortNumbers[recorderPortNumber];

        // check port number duplicated
        checkDuplicatePortNumber(newRecorderInfoArr, newValidations);

        setRecorderValidationsArr(newValidations);
    }

    const changeIWSPortCheck = async (e, id) => {
        const recorderIWSPort = e.target.value;
        const newValidations = [ ...recorderValidationsArr ];
        const validation = newValidations.find(v => v.recorderId == id);

        // store a temp updated access group info
        const newRecorderInfoArr = [ ...recorderInfoArr ]
        newRecorderInfoArr.find(group => group.recorderId == id).recorderIWSPort = recorderIWSPort;

        // remove submit failed and error
        validation.submitFailed = false;
        validation.recorderIWSPortError = "";

        // check port number exists?
        validation.recorderIWSPortExists = !!recorderPortNumbers[recorderIWSPort];

        // check port number duplicated
        checkDuplicateIWSPort(newRecorderInfoArr, newValidations);

        setRecorderValidationsArr(newValidations);
    }

    const onPortNumberChangeFactory = (id) => (e) => {
        changeTextField(e, id);
        changePortNumberCheck(e, id);
    }

    const onIWSPortChangeFactory = (id) => (e) => {
        changeTextField(e, id);
        changeIWSPortCheck(e, id);
    }

    const updateRecorderHelper = async (recorder) => {
        try {
            const res = await videoRecorderApi.updateRecorder(recorder);
            if (res.status != 200) {
                throw new Error("Unable to update recorder")
            }
            return true;
        } catch {
            return false;
        }
    }

    const submitForm = async (e) => {
        e.preventDefault();
        setSubmitted(true)

        // send res
        try {
            const boolArr = await Promise.all(recorderInfoArr.map(recorder => updateRecorderHelper(recorder)));
            console.log("boolArr",boolArr)
            // success toast
            const numSuccess = boolArr.filter(b => b).length;
            if (numSuccess) { 
                toast.success(`Successfully edited ${numSuccess} video recorders`);
            }

            // if some failed
            if (boolArr.some(b => !b)) {
                toast.error("Unable to edit video recorders below");    
                // filter failed personsInfo and personsValidation
                setRecorderInfoArr(recorderInfoArr.filter((p, i) => !boolArr[i]));
                setRecorderValidation(recorderValidationsArr.filter((p, i) => !boolArr[i]));
            } else {
                // all success
                router.replace(videoRecorderListLink);
            }
        } catch (error) {
            console.log(error)
            toast.error("Unable to submit form");
        }        
        setDisableSubmit(false);

    }

    useEffect(() => {
        console.log("video recorde info ",recorderInfoArr)
    }, [recorderInfoArr])

    return(
        <>
            <Head>
                <title>
                    Etlas: Edit Video Recorder
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
                        <ServerDownError
                        open={serverDownOpen}
                        handleDialogClose={() => setServerDownOpen(false)}
                    />
                        <NextLink
                            href={videoRecorderListLink}
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
                                <Typography variant="subtitle2">Video Recorders</Typography>
                            </Link>
                        </NextLink>
                 
                    </Box>
                    <Box marginBottom={3}>
                        <Typography variant="h3">
                            Edit Video Recorders
                        </Typography>
                    </Box>
                    <form onSubmit={submitForm}>
                            <Stack spacing={3}>
                                { 
                                    // Array.isArray(videoRecorderInfo) && videoRecorderInfo.map((p,i) => {
                                    //     console.log(p.recorderId);
                                    recorderInfoArr.map((recorderInfo,i) => {
                                        const id = recorderInfo.recorderId
                                        return (
                                        <VideoRecorderEditForm
                                            key={id}
                                            recorderInfo={recorderInfo}
                                            removeCard={removeCard}
                                            recorderValidations={recorderValidationsArr[i]}
                                            onNameChange={onNameChangeFactory(id)}
                                            onPublicIpChange = {onPublicIpChangeFactory(id)}
                                            onPrivateIpChange={onPrivateIpChangeFactory(id)}
                                            onPortNumberChange={onPortNumberChangeFactory(id)}
                                            onIWSPortChange={onIWSPortChangeFactory(id)}
                                            onUsernameChange={onUsernameChangeFactory(id)}
                                            onPasswordChange={onPasswordChangeFactory(id)}
                                            handleToggleDefaultIP={handleToggleDefaultIP(id)}
                                            handleToggleAutoPortForwarding={handleToggleAutoPortForwarding(id)}
                                        />
                                    )
                                })

                                    
                                }
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
                                        href={videoRecorderListLink}
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
                </Container>
            </Box>
        </>
    )
}

EditVideoRecorder.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>
            { page }
        </DashboardLayout>
    </AuthGuard>
)

export default EditVideoRecorder;