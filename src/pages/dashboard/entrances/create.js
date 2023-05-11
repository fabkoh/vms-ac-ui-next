import { useEffect, useState, useCallback } from "react";
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
import EntranceAddForm from "../../../components/dashboard/entrances/forms/entrance-add-form";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import Add from "@mui/icons-material/Add";
import { accessGroupApi } from "../../../api/access-groups";
import accessGroupEntranceApi from "../../../api/access-group-entrance-n-to-n";
import entranceApi from "../../../api/entrance";
import { useMounted } from "../../../hooks/use-mounted";
import toast from "react-hot-toast";
import router from "next/router";
import formUtils from "../../../utils/form-utils";
import { entranceListLink } from "../../../utils/entrance";
import { controllerApi } from "../../../api/controllers";
import { ServerDownError } from "../../../components/dashboard/errors/server-down-error";
import { serverDownCode } from "../../../api/api-helpers";

const CreateEntrances = () => {
  const [serverDownOpen, setServerDownOpen] = useState(false);
  // empty objects for initialisation of new card
  const getEmptyEntranceInfo = (entranceId) => ({
    entranceId,
    entranceName: "",
    entranceDesc: "",
    accessGroups: [],
    thirdPartyOption: "N.A.",
  });
  const getEmptyEntranceValidations = (entranceId) => ({
    entranceId,
    entranceNameBlank: false,
    entranceDescBlank: false,

    // name in database (error)
    entranceNameExists: false,

    // name duplicated in form (error)
    entranceNameDuplicated: false,

    // person has access group (note)
    //accessGroupPersonHasAccessGroup: false,

    // person in two access groups in same form (error)
    //accessGroupPersonDuplicated: false,

    // submit failed
    submitFailed: false,
  });

  const [entranceInfoArr, setEntranceInfoArr] = useState([
    getEmptyEntranceInfo(0),
  ]);
  const [entranceValidationsArr, setEntranceValidationsArr] = useState([
    getEmptyEntranceValidations(0),
  ]);

  // fetch all access group info
  const isAccessGroupMounted = useMounted();
  const [allAccessGroups, setAllAccessGroups] = useState([]);
  const getAccessGroups = useCallback(async () => {
    try {
      const res = await accessGroupApi.getAccessGroups();
      if (res.status == 200) {
        const body = await res.json();
        setAllAccessGroups(body);
      } else {
        if (res.status == serverDownCode) {
          setServerDownOpen(true);
        }
        setAllAccessGroups([]);
        throw new Error("Access Groups not loaded");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error loading access groups info");
    }
  }, [isAccessGroupMounted]);

  useEffect(
    () => {
      getAccessGroups();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // stores the duplicated person ids
  //const [duplicatedPerson, setDuplicatedPerson] = useState({});

  // store previous entrance names
  const [entranceNames, setEntranceNames] = useState({});
  useEffect(() => {
    entranceApi.getEntrances().then(async (res) => {
      const newEntranceNames = {};
      if (res.status == 200) {
        const body = await res.json();
        body.forEach((group) => (newEntranceNames[group.entranceName] = true));
        setEntranceNames(newEntranceNames);
      } else {
        setEntranceNames({});
      }
    });
  }, []);

  // add card logic
  //returns largest entranceId + 1
  const getNewId = () =>
    entranceInfoArr
      .map((info) => info.entranceId)
      .reduce((a, b) => Math.max(a, b), -1) + 1;

  const addCard = () => {
    const newId = getNewId();
    setEntranceInfoArr([...entranceInfoArr, getEmptyEntranceInfo(newId)]);
    setEntranceValidationsArr([
      ...entranceValidationsArr,
      getEmptyEntranceValidations(newId),
    ]);
  };

  // helper for remove card and changeNameCheck
  // directly modifies validationArr
  const checkDuplicateName = (groupArr, validationArr) => {
    const duplicatedNames = formUtils.getDuplicates(
      groupArr
        // get entrance names
        .map((group) => group.entranceName)
        // keep the ones that are not blank strings
        .filter((name) => !/^\s*$/.test(name))
    );
    for (let i = 0; i < groupArr.length; i++) {
      validationArr[i].entranceNameDuplicated =
        groupArr[i].entranceName in duplicatedNames;
    }
  };

  // helper for removeCard and changePersonCheck
  // directly modifies validationArr, return newDuplicatedPerson
  /*const checkDuplicatePerson = (groupArr, validationArr) => {
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
*/
  // remove card logic
  const removeCard = (id) => {
    const newEntranceInfoArr = entranceInfoArr.filter(
      (info) => info.entranceId != id
    );
    const newValidations = entranceValidationsArr.filter(
      (validation) => validation.entranceId != id
    );

    // check name duplicated
    checkDuplicateName(newEntranceInfoArr, newValidations);

    // check person duplicated
    //setDuplicatedPerson(checkDuplicatePerson(newAccessGroupInfoArr, newValidations));

    setEntranceInfoArr(newEntranceInfoArr);
    setEntranceValidationsArr(newValidations);
  };

  // update methods for form inputs
  const changeTextField = (e, id) => {
    const updatedInfo = [...entranceInfoArr];
    // this method is reliant on text field having a name field == key in info object ie entranceName, entranceDesc
    updatedInfo.find((info) => info.entranceId == id)[e.target.name] =
      e.target.value;
    setEntranceInfoArr(updatedInfo);
  };

  /* const changePerson = (newValue, id) => {
        const updatedInfo = [ ...accessGroupInfoArr ];
        updatedInfo.find(info => info.accessGroupId == id).persons = newValue;
        setAccessGroupInfoArr(updatedInfo);
    } */

  // error checking methods
  const changeNameCheck = async (e, id) => {
    const entranceName = e.target.value;
    const newValidations = [...entranceValidationsArr];
    const validation = newValidations.find((v) => v.entranceId == id);

    // store a temp updated access group info
    const newEntranceInfoArr = [...entranceInfoArr];
    newEntranceInfoArr.find((group) => group.entranceId == id).entranceName =
      entranceName;

    // remove submit failed
    validation.submitFailed = false;

    // check name is blank?
    validation.entranceNameBlank = formUtils.checkBlank(entranceName);

    // check name exists?
    validation.entranceNameExists = !!entranceNames[entranceName];

    // check name duplicated
    checkDuplicateName(newEntranceInfoArr, newValidations);

    setEntranceValidationsArr(newValidations);
  };

  /*
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
    } */

  // access group logic
  const changeAccessGroup = (newValue, id) => {
    const updatedInfo = [...entranceInfoArr];
    updatedInfo.find((info) => info.entranceId == id).accessGroups = newValue;
    setEntranceInfoArr(updatedInfo);
  };

  // currying for cleaner code
  const onAccessGroupChangeFactory = (id) => (newValue) =>
    changeAccessGroup(newValue, id);
  const onNameChangeFactory = (id) => (e) => {
    changeTextField(e, id);
    changeNameCheck(e, id);
  };

  const changeThirdPartyOption = (e, id) => {
    const updatedInfo = [...entranceInfoArr];
    updatedInfo.find((info) => info.entranceId == id).thirdPartyOption =
      e.target.value;
    setEntranceInfoArr(updatedInfo);
  };

  const onDescriptionChangeFactory = (id) => (e) => changeTextField(e, id);
  const onThirdPartyOptionsChange = (id) => (e) =>
    changeThirdPartyOption(e, id);

  const [submitted, setSubmitted] = useState(false);

  const submitForm = (e) => {
    e.preventDefault();

    setSubmitted(true);
    Promise.all(
      entranceInfoArr.map((entrance) => entranceApi.createEntrance(entrance))
    ).then((resArr) => {
      const failedResIndex = []; // stores the index of the failed creations
      const successResIndex = []; // stores the index of success creations
      const originalEntranceInfoArr = [...entranceInfoArr]; // store first in case set entrance info arr is executed before assignment

      resArr.forEach((res, i) => {
        if (res.status != 201) {
          failedResIndex.push(i);
        } else {
          successResIndex.push(i);
        }
      });

      // assign access groups to entrance
      Promise.all(successResIndex.map((i) => resArr[i].json())).then(
        (successResJson) => {
          const entranceToAccessGroup = []; // stores [entranceId, [array of accessGroupIds]]
          successResIndex.forEach((index, i) => {
            const accessGroupIds = originalEntranceInfoArr[
              index
            ].accessGroups.map((e) => e.accessGroupId);
            if (accessGroupIds.length > 0) {
              // there are access groups to add
              entranceToAccessGroup.push([
                successResJson[i].entranceId,
                accessGroupIds,
              ]);
            }
          });

          console.log("this", entranceToAccessGroup);
          Promise.all(
            entranceToAccessGroup.map((groupToEntrance) =>
              accessGroupEntranceApi.assignAccessGroupsToEntrance(
                groupToEntrance[1],
                groupToEntrance[0]
              )
            )
          ).then((resArr) => {
            resArr.forEach((res, i) => {
              if (res.status != 204) {
                // failed to assign
                const entranceName = successResJson[i].entranceName;
                toast.error(
                  `Failed to assign access groups to ${entranceName}`
                );
              }
            });
          });
        }
      );

      const numCreated = entranceInfoArr.length - failedResIndex.length;
      if (numCreated) {
        toast.success(`${numCreated} entrances created`);
      }

      if (failedResIndex.length) {
        // some failed
        toast.error("Error creating the highlighted entrances");
        Promise.all(failedResIndex.map((i) => resArr[i].json())).then(
          (failedResArr) => {
            // TODO failedResArr map field errors to fields
            setEntranceInfoArr(failedResIndex.map((i) => entranceInfoArr[i])); // set failed entrances to stay
            setEntranceValidationsArr(
              failedResIndex.map((i) => entranceValidationsArr[i])
            ); // set failed entrance validations to stay
          }
        );
      } else {
        // all passed
        router.replace("/dashboard/entrances");
      }
    });
  };

  return (
    <>
      <Head>
        <title>Etlas: Create Entrances</title>
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
            <Typography variant="h3">Create Entrances</Typography>
          </Box>
          <form onSubmit={submitForm}>
            <Stack spacing={3}>
              {entranceInfoArr.map((entranceInfo, i) => {
                const id = entranceInfo.entranceId;
                return (
                  <EntranceAddForm
                    key={id}
                    entranceInfo={entranceInfo}
                    removeCard={removeCard}
                    entranceValidations={entranceValidationsArr[i]}
                    onNameChange={onNameChangeFactory(id)}
                    onDescriptionChange={onDescriptionChangeFactory(id)}
                    allAccessGroups={allAccessGroups}
                    onAccessGroupChange={onAccessGroupChangeFactory(id)}
                    onThirdPartyOptionsChange={onThirdPartyOptionsChange(id)}
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
                      submitted ||
                      entranceInfoArr.length == 0 || // no entrances to submit
                      entranceValidationsArr.some(
                        // check if validations fail
                        (validation) => validation.entranceNameBlank
                        //validation.accessGroupNameDuplicated   ||
                        //validation.accessGroupPersonDuplicated
                      )
                    }
                  >
                    Submit
                  </Button>
                </Grid>
                <Grid item>
                  <NextLink href="/dashboard/entrances/" passHref>
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

CreateEntrances.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default CreateEntrances;
