import { useEffect, useState } from "react";
import NextLink from "next/link";
import Head from "next/head";
import {
  Link,
  Box,
  Container,
  Typography,
  Stack,
  Button,
  Grid,
} from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import VideoRecorderAddForm from "../../../components/dashboard/video-recorders/video-add-form";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import Add from "@mui/icons-material/Add";
import videoRecorderApi from "../../../api/videorecorder";
import toast from "react-hot-toast";
import router from "next/router";
import formUtils from "../../../utils/form-utils";
import { entranceListLink } from "../../../utils/entrance";
import { ServerDownError } from "../../../components/dashboard/errors/server-down-error";
import { serverDownCode } from "../../../api/api-helpers";

const CreateRecorders = () => {
  // empty objects for initialisation of new card
  const getEmptyRecorderInfo = (recorderId) => ({
    recorderId,
    recorderSerialNumber: "",
    recorderPortNumber: "",
    recorderIWSPort: "",
    recorderName: "",
    recorderPublicIp: "",
    recorderPrivateIp: "",
    recorderUsername: "",
    recorderPassword: "",
  });
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

    // Serial number must be unique between recorders
    recorderSerialNumberExists: false,
    recorderSerialNumberDuplicated: false,

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

    submitFailed: false,
  });

  const [recorderInfoArr, setRecorderInfoArr] = useState([
    getEmptyRecorderInfo(0),
  ]);
  const [recorderValidationsArr, setRecorderValidationsArr] = useState([
    getEmptyRecorderValidations(0),
  ]);

  // store previous video recorder names & ip addresses
  const [recorderNames, setRecorderNames] = useState({});
  const [recorderPrivateIpes, setRecorderPrivateIpes] = useState({});
  const [recorderSerialNumbers, setRecorderSerialNumbers] = useState({});
  const [recorderPortNumbers, setRecorderPortNumbers] = useState({});

  const [serverDownOpen, setServerDownOpen] = useState(false);

  useEffect(() => {
    videoRecorderApi.getRecorders().then(async (res) => {
      const newRecorderNames = {};
      const newRecorderPrivateIpes = {};
      const newRecorderSerialNumbers = {};
      const newRecorderPortNumbers = {};
      if (res.status == 200) {
        const body = await res.json();
        body.forEach((recorder) => {
          newRecorderPrivateIpes[recorder.recorderPrivateIp] = true;
          newRecorderNames[recorder.recorderName] = true;
          newRecorderSerialNumbers[recorder.recorderSerialNumber] = true;
          newRecorderPortNumbers[recorder.recorderPortNumber] = true;
          newRecorderPortNumbers[recorder.recorderIWSPort] = true;
        });
        setRecorderNames(newRecorderNames);
        setRecorderPrivateIpes(newRecorderPrivateIpes);
        setRecorderSerialNumbers(newRecorderSerialNumbers);
        setRecorderPortNumbers(newRecorderPortNumbers);
      } else if (res.status == serverDownCode) {
        setServerDownOpen(true);
      }
    });
  }, []);

  // add card logic
  //returns largest recorderId + 1
  const getNewId = () =>
    recorderInfoArr
      .map((info) => info.recorderId)
      .reduce((a, b) => Math.max(a, b), -1) + 1;

  const addCard = () => {
    const newId = getNewId();
    setRecorderInfoArr([...recorderInfoArr, getEmptyRecorderInfo(newId)]);
    setRecorderValidationsArr([
      ...recorderValidationsArr,
      getEmptyRecorderValidations(newId),
    ]);
  };

  // helper for remove card and changeNameCheck
  // directly modifies validationArr
  const checkDuplicateName = (groupArr, validationArr) => {
    const duplicatedNames = formUtils.getDuplicates(
      groupArr
        // get recorder names
        .map((group) => group.recorderName)
        // keep the ones that are not blank strings
        .filter((name) => !/^\s*$/.test(name))
    );
    for (let i = 0; i < groupArr.length; i++) {
      validationArr[i].recorderNameDuplicated =
        groupArr[i].recorderName in duplicatedNames;
    }
  };

  // helper for remove card and changePrivateIpCheck
  // directly modifies validationArr
  const checkDuplicatePrivateIp = (groupArr, validationArr) => {
    const duplicatedPrivateIp = formUtils.getDuplicates(
      groupArr
        // get recorder IP address
        .map((group) => group.recorderPrivateIp)
        // keep the ones that are not blank strings
        .filter((ip) => !/^\s*$/.test(ip))
    );
    for (let i = 0; i < groupArr.length; i++) {
      validationArr[i].recorderPrivateIpDuplicated =
        groupArr[i].recorderPrivateIp in duplicatedPrivateIp;
    }
  };

  // helper for remove card and changeSerialNumberCheck
  // directly modifies validationArr
  const checkDuplicateSerialNumber = (groupArr, validationArr) => {
    const duplicatedSerialNumber = formUtils.getDuplicates(
      groupArr
        // get recorder serial number
        .map((group) => group.recorderSerialNumber)
        // keep the ones that are not blank strings
        .filter((ip) => !/^\s*$/.test(ip))
    );
    for (let i = 0; i < groupArr.length; i++) {
      validationArr[i].recorderSerialNumberDuplicated =
        groupArr[i].recorderSerialNumber in duplicatedSerialNumber;
    }
  };

  // helper for remove card and changePortNumberCheck
  // directly modifies validationArr
  const checkDuplicatePortNumber = (groupArr, validationArr) => {
    const duplicatedPortNumber = formUtils.getDuplicates(
      groupArr
        // get recorder IP address
        .map((group) => group.recorderPortNumber)
        // keep the ones that are not blank strings
        .filter((ip) => !/^\s*$/.test(ip))
    );
    for (let i = 0; i < groupArr.length; i++) {
      validationArr[i].recorderPortNumberDuplicated =
        groupArr[i].recorderPortNumber in duplicatedPortNumber;
    }
  };

  // helper for remove card and changeIWSPortCheck
  // directly modifies validationArr
  const checkDuplicateIWSPort = (groupArr, validationArr) => {
    const duplicatedIWSPort = formUtils.getDuplicates(
      groupArr
        // get recorder IP address
        .map((group) => group.recorderIWSPort)
        // keep the ones that are not blank strings
        .filter((ip) => !/^\s*$/.test(ip))
    );
    for (let i = 0; i < groupArr.length; i++) {
      validationArr[i].recorderIWSPortDuplicated =
        groupArr[i].recorderIWSPort in duplicatedIWSPort;
    }
  };

  // remove card logic
  const removeCard = (id) => {
    const newEntranceInfoArr = recorderInfoArr.filter(
      (info) => info.recorderId != id
    );
    const newValidations = recorderValidationsArr.filter(
      (validation) => validation.recorderId != id
    );

    // check name duplicated
    checkDuplicateName(newEntranceInfoArr, newValidations);
    checkDuplicatePrivateIp(newEntranceInfoArr, newValidations);

    setRecorderInfoArr(newEntranceInfoArr);
    setRecorderValidationsArr(newValidations);
  };

  // update methods for form inputs
  const changeTextField = (e, id) => {
    const updatedInfo = [...recorderInfoArr];
    // this method is reliant on text field having a name field == key in info object ie recorderName, recorderPrivateIp, etc
    updatedInfo.find((info) => info.recorderId == id)[e.target.name] =
      e.target.value;
    setRecorderInfoArr(updatedInfo);
  };

  // error checking methods
  const changeNameCheck = async (e, id) => {
    const recorderName = e.target.value;
    const newValidations = [...recorderValidationsArr];
    const validation = newValidations.find((v) => v.recorderId == id);

    // store a temp updated access group info
    const newRecorderInfoArr = [...recorderInfoArr];
    newRecorderInfoArr.find((group) => group.recorderId == id).recorderName =
      recorderName;

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
  };
  const onNameChangeFactory = (id) => (e) => {
    changeTextField(e, id);
    changeNameCheck(e, id);
  };

  const onPublicIpChangeFactory = (id) => (e) => {
    changeTextField(e, id);
    const recorderPublicIp = e.target.value;
    const newValidations = [...recorderValidationsArr];
    const validation = newValidations.find((v) => v.recorderId == id);
    validation.recorderPublicIpBlank = formUtils.checkBlank(recorderPublicIp);
    validation.recorderPublicIpError = "";
    setRecorderValidationsArr(newValidations);
  };

  const changeSerialNumberCheck = async (e, id) => {
    const recorderSerialNumber = e.target.value;
    const newValidations = [...recorderValidationsArr];
    const validation = newValidations.find((v) => v.recorderId == id);

    // store a temp updated access group info
    const newRecorderInfoArr = [...recorderInfoArr];
    newRecorderInfoArr.find(
      (group) => group.recorderId == id
    ).recorderSerialNumber = recorderSerialNumber;

    // remove submit failed and error
    validation.submitFailed = false;

    // check serial number exists?
    validation.recorderSerialNumberExists =
      !!recorderSerialNumbers[recorderSerialNumber];

    // check serial number duplicated
    checkDuplicateSerialNumber(newRecorderInfoArr, newValidations);

    setRecorderValidationsArr(newValidations);
  };
  const onSerialNumberChangeFactory = (id) => (e) => {
    changeTextField(e, id);
    changeSerialNumberCheck(e, id);
  };

  const onUsernameChangeFactory = (id) => (e) => {
    changeTextField(e, id);
    const recorderUsername = e.target.value;
    const newValidations = [...recorderValidationsArr];
    const validation = newValidations.find((v) => v.recorderId == id);
    validation.recorderUsernameBlank = formUtils.checkBlank(recorderUsername);
    validation.recorderUsernameError = "";
    setRecorderValidationsArr(newValidations);
  };

  const onPasswordChangeFactory = (id) => (e) => {
    changeTextField(e, id);
    const recorderPassword = e.target.value;
    const newValidations = [...recorderValidationsArr];
    const validation = newValidations.find((v) => v.recorderId == id);
    validation.recorderPasswordBlank = formUtils.checkBlank(recorderPassword);
    validation.recorderPasswordError = "";
    setRecorderValidationsArr(newValidations);
  };

  const changePrivateIpCheck = async (e, id) => {
    const recorderPrivateIp = e.target.value;
    const newValidations = [...recorderValidationsArr];
    const validation = newValidations.find((v) => v.recorderId == id);

    // store a temp updated access group info
    const newRecorderInfoArr = [...recorderInfoArr];
    newRecorderInfoArr.find(
      (group) => group.recorderId == id
    ).recorderPrivateIp = recorderPrivateIp;

    // remove submit failed and error
    validation.submitFailed = false;
    validation.recorderPrivateIpError = "";

    // check ip address blank
    validation.recorderPrivateIpBlank = formUtils.checkBlank(recorderPrivateIp);

    // check ip address exists?
    validation.recorderPrivateIpExists =
      !!recorderPrivateIpes[recorderPrivateIp];

    // check ip address duplicated
    checkDuplicatePrivateIp(newRecorderInfoArr, newValidations);

    setRecorderValidationsArr(newValidations);
  };
  const onPrivateIpChangeFactory = (id) => (e) => {
    changeTextField(e, id);
    changePrivateIpCheck(e, id);
  };

  const changePortNumberCheck = async (e, id) => {
    const recorderPortNumber = e.target.value;
    const newValidations = [...recorderValidationsArr];
    const validation = newValidations.find((v) => v.recorderId == id);

    // store a temp updated access group info
    const newRecorderInfoArr = [...recorderInfoArr];
    newRecorderInfoArr.find(
      (group) => group.recorderId == id
    ).recorderPortNumber = recorderPortNumber;

    // remove submit failed and error
    validation.submitFailed = false;
    validation.recorderPortNumberError = "";

    // check port number exists?
    validation.recorderPortNumberExists =
      !!recorderPortNumbers[recorderPortNumber];

    // check port number duplicated
    checkDuplicatePortNumber(newRecorderInfoArr, newValidations);

    setRecorderValidationsArr(newValidations);
  };

  const changeIWSPortCheck = async (e, id) => {
    const recorderIWSPort = e.target.value;
    const newValidations = [...recorderValidationsArr];
    const validation = newValidations.find((v) => v.recorderId == id);

    // store a temp updated access group info
    const newRecorderInfoArr = [...recorderInfoArr];
    newRecorderInfoArr.find((group) => group.recorderId == id).recorderIWSPort =
      recorderIWSPort;

    // remove submit failed and error
    validation.submitFailed = false;
    validation.recorderIWSPortError = "";

    // check port number exists?
    validation.recorderIWSPortExists = !!recorderPortNumbers[recorderIWSPort];

    // check port number duplicated
    checkDuplicateIWSPort(newRecorderInfoArr, newValidations);

    setRecorderValidationsArr(newValidations);
  };

  const onPortNumberChangeFactory = (id) => (e) => {
    changeTextField(e, id);
    changePortNumberCheck(e, id);
  };

  const onIWSPortChangeFactory = (id) => (e) => {
    changeTextField(e, id);
    changeIWSPortCheck(e, id);
  };

  const [submitted, setSubmitted] = useState(false);

  const submitForm = (e) => {
    e.preventDefault();

    setSubmitted(true);
    Promise.all(
      recorderInfoArr.map((recorder) =>
        videoRecorderApi.createVideoRecorder(recorder)
      )
    )
      .then((resArr) => {
        const failedResIndex = []; // stores the index of the failed creations
        const successResIndex = []; // stores the index of success creations

        resArr.forEach((res, i) => {
          if (res.status != 201) {
            failedResIndex.push(i);
          } else {
            successResIndex.push(i);
          }
        });

        const numCreated = recorderInfoArr.length - failedResIndex.length;
        if (numCreated) {
          toast.success(`${numCreated} recorders created`);
        }

        if (failedResIndex.length) {
          // some failed
          toast.error("Error creating the highlighted recorder(s)");
          Promise.all(failedResIndex.map((i) => resArr[i].json())).then(
            (failedResArr) => {
              setRecorderInfoArr(failedResIndex.map((i) => recorderInfoArr[i])); // set failed recorders to stay
              setRecorderValidationsArr(
                failedResIndex.map((i) => {
                  let recordValidation = recorderValidationsArr[i];
                  recordValidation.recorderNameError =
                    failedResArr.recorderName ?? "";
                  (recordValidation.recorderPublicIpError =
                    failedResArr.recorderPublicIp ?? ""),
                    (recordValidation.recorderPrivateIpError =
                      failedResArr.recorderPrivateIp ?? "");
                  recordValidation.recorderPortNumberError =
                    failedResArr.recorderPortNumber ?? "";
                  recordValidation.recorderIWSPortError =
                    failedResArr.recorderIWSPort ?? "";
                  recordValidation.recorderUsernameError =
                    failedResArr.recorderUsername ?? "";
                  recordValidation.recorderPasswordError =
                    failedResArr.recorderPassword ?? "";
                  recordValidation.submitFailed = true;
                  return recordValidation;
                })
              ); // set failed recorder validations to stay
            }
          );
        } else {
          // all passed
          router.replace("/dashboard/video-recorders");
        }
      })
      .finally(() => setSubmitted(false));
  };

  return (
    <>
      <Head>
        <title>Etlas: Add Video Recorders</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <ServerDownError
          open={serverDownOpen}
          handleDialogClose={() => setServerDownOpen(false)}
        />
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Button onClick={() => router.back()} variant="subtitle2">
              <ArrowBack fontSize="small" sx={{ mr: 1 }} />
              Back
            </Button>
          </Box>
          <Box marginBottom={3}>
            <Typography variant="h3">Add Video Recorders</Typography>
          </Box>
          <form onSubmit={submitForm}>
            <Stack spacing={3}>
              {recorderInfoArr.map((recorderInfo, i) => {
                const id = recorderInfo.recorderId;
                return (
                  <VideoRecorderAddForm
                    key={id}
                    recorderInfo={recorderInfo}
                    removeCard={removeCard}
                    recorderValidations={recorderValidationsArr[i]}
                    onNameChange={onNameChangeFactory(id)}
                    onSerialNumberChange={onSerialNumberChangeFactory(id)}
                    onPublicIpChange={onPublicIpChangeFactory(id)}
                    onPrivateIpChange={onPrivateIpChangeFactory(id)}
                    onPortNumberChange={onPortNumberChangeFactory(id)}
                    onIWSPortChange={onIWSPortChangeFactory(id)}
                    onUsernameChange={onUsernameChangeFactory(id)}
                    onPasswordChange={onPasswordChangeFactory(id)}
                  />
                );
              })}
              <div>
                <Button
                  size="large"
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={addCard}
                >
                  Add video recorder
                </Button>
              </div>
              <Grid container>
                <Grid item marginRight={3}>
                  <Button
                    type="submit"
                    size="large"
                    variant="contained"
                    disabled={
                      submitted ||
                      recorderInfoArr.length == 0 || // no recorders to submit
                      recorderValidationsArr.some(
                        // check if validations fail
                        (validation) =>
                          validation.recorderNameBlank ||
                          validation.recorderNameDuplicated ||
                          validation.recorderNameExists ||
                          validation.recorderSerialNumberExists ||
                          validation.recorderSerialNumberDuplicated ||
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
                    }
                  >
                    Submit
                  </Button>
                </Grid>
                <Grid item>
                  <NextLink href="/dashboard/video-recorders/" passHref>
                    <Button
                      size="large"
                      variant="outlined"
                      color="error"
                      onClick={() => router.back()}
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
  );
};

CreateRecorders.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default CreateRecorders;
