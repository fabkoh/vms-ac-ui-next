import { Add, ArrowBack } from "@mui/icons-material";
import { Box, Button, Container, Link, Stack, Typography } from "@mui/material";
import Head from "next/head";
import NextLink from "next/link";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import {
  createCounterObject,
  getDuplicates,
} from "../../../../utils/form-utils";
import { usersManagementLink } from "../../../../utils/users";
import { useCallback, useEffect, useState } from "react";
import UserAddForm from "../../../../components/account/user-add-form";
import { useMounted } from "../../../../hooks/use-mounted";
import { personApi } from "../../../../api/person";
import { arraySameContents, isObject } from "../../../../utils/utils";
import toast from "react-hot-toast";
import router from "next/router";
import {
  saveCredentialApi,
  checkCredentialApi,
} from "../../../../api/credentials";
import { getPersonName } from "../../../../utils/persons";
import { ServerDownError } from "../../../../components/dashboard/errors/server-down-error";
import { serverDownCode } from "../../../../api/api-helpers";
import { authSignUp } from "../../../../api/auth-api";
import { authGetProfile, authGetAccounts } from "../../../../api/auth-api";
import { validatePhoneNumber } from "../../../../utils/utils";

const getNextId = createCounterObject(1);

const getNewPersonInfo = (id) => ({
  personId: id,
  personFirstName: "",
  personLastName: "",
  personMobileNumber: "",
  personEmail: "",
  personPassword: "",
  personRole: [],
});

const getNewPersonValidation = (id) => ({
  personId: id,
  //error
  firstNameCharCheck: false,
  lastNameCharCheck: false,
  numberInvalid: false,
  numberErrorMessage: null,
  passwordNameCharCheck: false,
  emailBlank: false,
  roleBlank: false,
  // note
  numberInUse: false,
  numberRepeated: false,
  emailInUse: false,
  emailRepeated: false,
});

const cardError = (v) => {
  return (
    isObject(v) &&
    (v.firstNameCharCheck ||
      v.lastNameCharCheck ||
      v.emailBlank ||
      v.passwordNameCharCheck ||
      v.roleBlank ||
      v.numberInvalid ||
      v.numberRepeated ||
      v.emailRepeated)
  );
};

const CreatePersonsTwo = () => {
  // stores list of person objects
  const [personsInfo, setPersonsInfo] = useState([getNewPersonInfo(0)]);
  const [personsValidation, setPersonsValidation] = useState([
    getNewPersonValidation(0),
  ]);
  const [mobileNumbersList, setMobileNumbersList] = useState([]);
  const [usersList, setUsersList] = useState([]);

  console.log(mobileNumbersList);

  // get info
  const isMounted = useMounted();
  const getUserList = async () => {
    try {
        const res = await authGetAccounts();
        if (res.type == "success") {
            const body = res.response;
            console.log(body);

            const newList = [];
            const mobileNumbers = []; // Array to store mobile numbers

            for (const role of Object.keys(body)) {
                for (const user of body[role]) {
                    user["role"] = role;
                    newList.push(user);

                    // Add the mobile number to the mobileNumbers array
                    if (user.mobile) {
                        mobileNumbers.push(user.mobile);
                    }
                }
            }
            
            setUsersList(newList);
            setMobileNumbersList(mobileNumbers); // Assuming you have a state or method to handle this
            setIsUpdated(true);
        } else {
            if (res.status == serverDownCode) {
                setServerDownOpen(true);
            }
        }
    } catch (err) {
        console.log(err);
    }
  };


  const getInfo = useCallback(() => {
    getUserList();
  }, [isMounted]);

  useEffect(() => {
    getInfo();
  }, []);

  const [serverDownOpen, setServerDownOpen] = useState(false);

  // add / remove person logic
  const addPerson = () => {
    const id = getNextId();
    setPersonsInfo([...personsInfo, getNewPersonInfo(id)]);
    setPersonsValidation([...personsValidation, getNewPersonValidation(id)]);
  };

  // done like this as putting getNextId in useState causes getNextId to be called
  // an additional time every re-render

  const removePersonFactory = (id) => () => {
    const newPersonsInfo = personsInfo.filter((p) => p.personId != id);
    const newPersonsValidation = personsValidation.filter(
      (p) => p.personId != id
    );

    setPersonsInfo(newPersonsInfo);
    setPersonsValidation(newPersonsValidation);
  };

  // editing logic
  const changeTextField = (key, id, ref) => {
    // do not use setState to prevent rerender
    personsInfo.find((p) => p.personId === id)[key] = ref.current?.value;
  };

  // returns true if personsValidation is changed
  const blankCheckHelper = (id, key, value, validArr) => {
    let isBlank = typeof value === "string" && /^\s*$/.test(value);

    // only update if different
    const personValidation = validArr.find((p) => p.personId === id);
    if (isObject(personValidation) && personValidation[key] != isBlank) {
      personValidation[key] = isBlank; // modifies validArr, remember to setState after calling this function
      return true;
    }

    return false;
  };

  /**
   * Checks if the specified key has duplicate values in the infoArray and updates the validationArray accordingly
   * 
   * @param {string} key The key to check for duplicates
   * @param {string} duplicateKey The key in the validationArray to update if there are duplicates
   * @param {object[]} validationArray The validationArray to update
   * @param {object[]} infoArray The infoArray to check for duplicates
   * @returns {boolean} true if the validationArray is changed, false otherwise
   */
  const checkDuplicateHelper = (key, duplicateKey, validationArray, infoArray) => {
    let hasChanged = false;

    // Get a list of all duplicate values for the specified key in the infoArray
    const duplicateValues = getDuplicates(infoArray.map((data) => data[key]));
    console.log("Duplicate values for key:", key, duplicateValues);

    // Iterate through each item in the infoArray
    infoArray.forEach((dataItem, index) => {
      const currentValue = dataItem[key];
      const isDuplicate = currentValue !== "" && currentValue in duplicateValues;

      // Update the duplicate status in the validationArray if it has changed
      if (validationArray[index][duplicateKey] !== isDuplicate) {
        validationArray[index][duplicateKey] = isDuplicate;
        hasChanged = true;
      }
    });

    // Return true if any changes were made to the validationArray
    return hasChanged;
  };

  const checkInUseHelper = (
    id,
    value,
    arrayOfUsedValues,
    inUseKey,
    validArr
  ) => {
    const inUse = value != "" && arrayOfUsedValues.includes(value);
    console.log("arrayOfUsedValues", arrayOfUsedValues);
    console.log("value", value);
    console.log("inUse", inUse);
    const personValidation = validArr.find((p) => p.personId == id);
    if (isObject(personValidation) && personValidation[inUseKey] != inUse) {
      personValidation[inUseKey] = inUse;
      return true;
    }

    console.log("inusekey", personValidation[inUseKey]);
    return false;
  };

  /**
   * Checks if the number is valid and updates the validation state accordingly
   * 
   * @param {number} personId
   * @param {string} number
   * @param {string} key
   * @param {object[]} validArr
   * @returns {boolean} true if the validation state is changed, false otherwise
   */
  const checkInvalidNumberHelper = (personId, number, key, validArr) => {
    const personValidation = validArr.find((p) => p.personId === personId);
    if (!isObject(personValidation)) {
        return false;
    }

    // If the mobile number input is + or +65 (default value), then it is valid (no error message) and the mobile number is treated as empty.
    // Currently when you try to delete the digits individually to reach +, it will by default cycle to +65
    if (number === '+' || number === '+65') {
      if (personValidation[key] !== false || personValidation.numberErrorMessage !== null) {
          personValidation[key] = false; // Mark as valid
          personValidation.numberErrorMessage = null; // Clear any existing error message
          return true; // Indicates a change in the validation state
      }
      return false; // No change needed
    }

    const { isValid, errorMessage } = validatePhoneNumber(number);
    const isInvalid = !isValid;

    // Determine if there's a change in either the validation state or the error message
    const isStateChanged = personValidation[key] !== isInvalid;
    const isErrorMessageChanged = personValidation.numberErrorMessage !== errorMessage;

    // Update if there's a change in the state or the error message
    if (isStateChanged || isErrorMessageChanged) {
        personValidation[key] = isInvalid;
        personValidation.numberErrorMessage = isInvalid ? errorMessage : null;
        return true; // Indicates a change
    }

    return false; // No change
  };


  //   first and last name char size 3-20
  const validateName = (id, key, name, validArr) => {
    if (typeof name !== "string") {
      return (validArr[id][key] = false);
    }

    const trimmedName = name.trim();
    if (!(trimmedName.length >= 3 && trimmedName.length <= 20)) {
      return (validArr[id][key] = true);
    }
    return (validArr[id][key] = false);
  };

  //   PW char size 6-40
  const validatePassword = (id, key, name, validArr) => {
    if (typeof name !== "string") {
      return (validArr[id][key] = false);
    }

    const trimmedName = name.trim();
    if (!(trimmedName.length >= 6 && trimmedName.length <= 40)) {
      return (validArr[id][key] = true);
    }
    return (validArr[id][key] = false);
  };

  const onPersonFirstNameChangeFactory = (id) => (ref) => {
    changeTextField("personFirstName", id, ref);
    const b1 = blankCheckHelper(
      id,
      "firstNameCharCheck",
      ref.current?.value,
      personsValidation
    );

    const b2 = validateName(
      id,
      "firstNameCharCheck",
      ref.current?.value,
      personsValidation
    );

    if (b1 || b2) {
      setPersonsValidation([...personsValidation]);
    }
  };

  const onPersonLastNameChangeFactory = (id) => (ref) => {
    changeTextField("personLastName", id, ref);
    const b1 = blankCheckHelper(
      id,
      "lastNameCharCheck",
      ref.current?.value,
      personsValidation
    );

    const b2 = validateName(
      id,
      "lastNameCharCheck",
      ref.current?.value,
      personsValidation
    );

    if (b1 || b2) {
      setPersonsValidation([...personsValidation]);
    }
  };

  const onPersonMobileNumberChangeFactory = (id) => (ref) => {
    changeTextField("personMobileNumber", id, ref);
    const usernames = usersList.map((user) => user.mobile);

    const b1 = checkDuplicateHelper(
      "personMobileNumber",
      "numberRepeated",
      personsValidation,
      personsInfo
    );
    const b2 = checkInvalidNumberHelper(
      id,
      ref.current?.value,
      "numberInvalid",
      personsValidation,
      personsInfo
    );
    const b3 = checkInUseHelper(
      id,
      ref.current?.value,
      mobileNumbersList,
      "numberInUse",
      personsValidation
    );

    if (b1 || b2 || b3) {
      setPersonsValidation([...personsValidation]);
    }
  };

  const onPersonEmailChangeFactory = (id) => (ref) => {
    changeTextField("personEmail", id, ref);
    const b1 = blankCheckHelper(
      id,
      "emailBlank",
      ref.current?.value,
      personsValidation
    );
    const usernames = usersList.map((user) => user.email);
    const b2 = checkDuplicateHelper(
      id,
      ref.current?.value,
      "emailRepeated",
      personsValidation,
      usernames
    );
    console.log(personsValidation[0].emailRepeated);

    if (b1 || b2) {
      setPersonsValidation([...personsValidation]);
    }
  };

  const onPersonPasswordChangeFactory = (id) => (ref) => {
    changeTextField("personPassword", id, ref);

    const b1 = blankCheckHelper(
      id,
      "passwordNameCharCheck",
      ref.current?.value,
      personsValidation
    );

    const b2 = validatePassword(
      id,
      "passwordNameCharCheck",
      ref.current?.value,
      personsValidation
    );

    if (b1 || b2) {
      setPersonsValidation([...personsValidation]);
    }
  };

    const onPersonRoleChangeFactory = (id) => (e) => {
      const newInfo = [...personsInfo];
      const value = e.target.value;
      newInfo.find((p) => p.personId === id).personRole = [value];
      setPersonsInfo(newInfo);
    };

    const submitDisabled =
      personsInfo.length == 0 || personsValidation.some(cardError);

    const [disableSubmit, setDisableSubmit] = useState(false);

    // return true if the person creation was successful
    const createPerson = async (person) => {
      console.log(person, 34);
      const userSettings = {
        firstName: person.personFirstName,
        lastName: person.personLastName,
        email: person.personEmail,
        password: person.personPassword,
        role: person.personRole,
        mobile: person.personMobileNumber.slice(1),
      };
      console.log(userSettings, 12);
      try {
        const res = await authSignUp(userSettings);
        console.log(res);
        if (res.type != "success") {
          throw new Error("Unable to register User");
        }
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    };

    const submitForm = async (e) => {
      e.preventDefault();
      setDisableSubmit(true);

      // send res
      try {
        const boolArr = await Promise.all(
          personsInfo.map((p) => createPerson(p))
        );

        // success toast
        const numSuccess = boolArr.filter((b) => b).length;
        if (numSuccess) {
          toast.success(`Successfully created ${numSuccess} persons`);
        }

        // if some failed
        if (boolArr.some((b) => !b)) {
          toast.error("Unable to create persons below");
          // filter failed personsInfo and personsValidation
          setPersonsInfo(personsInfo.filter((p, i) => !boolArr[i]));
          setPersonsValidation(personsValidation.filter((v, i) => !boolArr[i]));
        } else {
          // all success
          router.replace(usersManagementLink);
        }
      } catch (e) {
        console.log("error", e);
        toast.error("Unable to submit form");
      }
      setDisableSubmit(false);
    };

    return (
      <>
        <Head>
          <title>Etlas: Create User</title>
        </Head>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: 8,
          }}
        >
          <Container maxWidth="xl">
            <Box sx={{ mb: 4 }}>
              <ServerDownError
                open={serverDownOpen}
                handleDialogClose={() => setServerDownOpen(false)}
              />
              <NextLink href={usersManagementLink} passHref>
                <Link
                  color="textPrimary"
                  component="a"
                  sx={{
                    alignItems: "center",
                    display: "flex",
                  }}
                >
                  <ArrowBack fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2">Users Management</Typography>
                </Link>
              </NextLink>
            </Box>
            <Stack spacing={3}>
              <div>
                <Typography variant="h3">Add User</Typography>
              </div>
              <form onSubmit={submitForm}>
                <Stack spacing={3}>
                  {Array.isArray(personsInfo) &&
                    personsInfo.map((p, i) => {
                      const id = p.personId;
                      return (
                        <UserAddForm
                          key={id}
                          onClear={removePersonFactory(id)}
                          person={p}
                          onPersonFirstNameChange={onPersonFirstNameChangeFactory(
                            id
                          )}
                          onPersonLastNameChange={onPersonLastNameChangeFactory(
                            id
                          )}
                          onPersonMobileNumberChange={onPersonMobileNumberChangeFactory(
                            id
                          )}
                          onPersonEmailChange={onPersonEmailChangeFactory(id)}
                          onPersonPasswordChange={onPersonPasswordChangeFactory(
                            id
                          )}
                          handlePersonRoleChange={onPersonRoleChangeFactory(id)}
                          validation={personsValidation[i]}
                          cardError={cardError}
                        />
                      );
                    })}
                  <div>
                    <Button
                      size="large"
                      sx={{ mr: 3 }}
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={addPerson}
                    >
                      Add user
                    </Button>
                  </div>
                  <div>
                    <Button
                      size="large"
                      type="submit"
                      sx={{ mr: 3 }}
                      variant="contained"
                      disabled={submitDisabled || disableSubmit}
                    >
                      Create Users
                    </Button>
                    <NextLink href={usersManagementLink} passHref>
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
            </Stack>
          </Container>
        </Box>
      </>
    );
  };

CreatePersonsTwo.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default CreatePersonsTwo;
