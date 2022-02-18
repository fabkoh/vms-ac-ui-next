import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import NextLink from 'next/link';
import {
  Box,
  Container,
  Link,
  Typography,
  Stack,
  Button
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AuthGuard } from '../../../components/authentication/auth-guard';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import { PersonAddForm } from '../../../components/dashboard/person/person-add-form';
import { personApi } from '../../../api/person';
import toast from 'react-hot-toast';
import router from 'next/router';
import { accessGroupApi } from '../../../api/access-groups';
import { useMounted } from "../../../hooks/use-mounted";

const CreatePersons = () => {

  const personInfo = (id) => ({
    id,
    firstName: '',
    lastName: '',
    uid: '',
    mobileNumber: '',
    email: '',
    valid: {
      firstName: true,
      lastName: true,
      uidNotRepeated: true,
      uidNotInUse: true,
      mobileNumber: true,
      mobileNumberNotRepeated: true,
      mobileNumberNotInUse: true,
      email: true,
      emailNotRepeated: true,
      emailNotInUse: true,
      accessGroup: true,
      submitOk: true
    }
  });

  const [personsInfo, setPersonsInfo] = useState([personInfo(0)])

  const getNextId = () => {
    if(personsInfo.length == 0){
      return 0
    }
    return personsInfo.at(-1).id + 1;
  }

  const addPerson = () => {
    setPersonsInfo([ ...personsInfo, personInfo(getNextId()) ]);
  };

  const removePerson = (id) => {
    setPersonsInfo(personsInfo.filter(person => person.id != id))
  }

  const onNameChange = (e, id) => {
    const newPersonsInfo = [ ...personsInfo ];
    const newPersonInfo = newPersonsInfo.find(person => person.id == id)
    newPersonInfo[e.target.name] = e.target.value;
    
    // check if input is blank
    if(/^\s*$/.test(e.target.value)) {
      newPersonInfo.valid[e.target.name] = false;
    } else {
      newPersonInfo.valid[e.target.name] = true;
    }

    setPersonsInfo(newPersonsInfo);
  }

  const onEmailChange = async (e, id) => {
    const newPersonsInfo = [ ...personsInfo ];
    const newPersonInfo = newPersonsInfo.find(person => person.id == id);
    newPersonInfo.email = e.target.value;

    // test if email is valid
    newPersonInfo.valid.email = (

      //to prevent matching multiple @ signs
      e.target.value == "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)
    );

    // test if email are repeated
    // maps email to the first occurrence of email in new persons info
    const emailMap = {}
    for(let i=0; i<newPersonsInfo.length; i++) {
      if(newPersonsInfo[i].email == "") {
        newPersonsInfo[i].valid.emailNotRepeated = true;
        continue;
      }

      const email = newPersonsInfo[i].email;
      if(email in emailMap) {
        newPersonsInfo[i].valid.emailNotRepeated = false;
        newPersonsInfo[emailMap[email]].valid.emailNotRepeated = false;
      } else {
        emailMap[email] = i;
        newPersonsInfo[i].valid.emailNotRepeated = true;
      }
    }

    // check against the db too
    newPersonInfo.valid.emailNotInUse = true;
    if(!(/^\s*$/.test(newPersonInfo.email))) {
      const res = await personApi.emailExists(newPersonInfo.email);
      const data = await res.json();
      newPersonInfo.valid.emailNotInUse = !(data);
    }

    setPersonsInfo(newPersonsInfo);
  }


  const onNumberChange = async (e, id) => {
    const newPersonsInfo = [ ...personsInfo ];
    const newPersonInfo = newPersonsInfo.find(person => person.id == id);
    newPersonInfo.mobileNumber = e;

   // newPersonInfo.valid.mobileNumber = (
   //   e.target.value == ""  || /^\+\d{1,3} \d+$/.test(e.target.value)
    //  e == "12345678"
   // );

    // test if mobile number are repeated
    // maps mobileNumber to the first occurrence of mobileNumber in new persons info
    const mobileNumberMap = {}
    for(let i=0; i<newPersonsInfo.length; i++) {

      if(newPersonsInfo[i].mobileNumber == "") {
        newPersonsInfo[i].valid.mobileNumberNotRepeated = true;
        continue;
      }

      const mobileNumber = newPersonsInfo[i].mobileNumber
      if(mobileNumber in mobileNumberMap) {
        newPersonsInfo[i].valid.mobileNumberNotRepeated = false;
        newPersonsInfo[mobileNumberMap[mobileNumber]].valid.mobileNumberNotRepeated = false;
      } else {
        mobileNumberMap[mobileNumber] = i;
        newPersonsInfo[i].valid.mobileNumberNotRepeated = true;
      }
    }

    // check against the db too
    newPersonInfo.valid.mobileNumberNotInUse = true;
    if(!(/^\s*$/.test(newPersonInfo.mobileNumber))) {
      const res = await personApi.mobileNumberExists(newPersonInfo.mobileNumber);
      const data = await res.json();
      newPersonInfo.valid.mobileNumberNotInUse = !(data);
    }

    setPersonsInfo(newPersonsInfo);
  }

  const onUidChange = async (e, id) => {
    const newPersonsInfo = [ ...personsInfo ];
    const newPersonInfo = newPersonsInfo.find(person => person.id == id);
    newPersonInfo.uid = e.target.value;

    // test if uids are repeated
    // maps uid to the first occurence of uid in new persons info
    const uidMap = {}
    for(let i=0; i<newPersonsInfo.length; i++) {

      if(newPersonsInfo[i].uid == "") { 
        newPersonsInfo[i].valid.uidNotRepeated = true;
        continue;  
      }

      const uid = newPersonsInfo[i].uid
      if(uid in uidMap) {
        newPersonsInfo[i].valid.uidNotRepeated = false;
        newPersonsInfo[uidMap[uid]].valid.uidNotRepeated = false;
      } else {
        uidMap[uid] = i;
        newPersonsInfo[i].valid.uidNotRepeated = true;
      }
    }

    // newPersonInfo.valid.uidNotInUse = !(await personApi.fakeUidExists(newPersonInfo.uid));
    newPersonInfo.valid.uidNotInUse = true;
    if(!(/^\s*$/.test(newPersonInfo.uid))) {
      const res = await personApi.uidExists(newPersonInfo.uid);
      const data = await res.json();
      newPersonInfo.valid.uidNotInUse = !(data);
    }

    setPersonsInfo(newPersonsInfo);
  }

  //access group logic (displaying in dropdownlist)
  const isMounted = useMounted();
  const [allAccessgroups, setAllAccessgroups] = useState([]);

  const getAccessGroups = useCallback(async() => {
    try {
      const res = await accessGroupApi.getAccessGroups();
      if (res.status == 200) {
        const body = await res.json();
        setAllAccessgroups(body);
      } else {
        throw new Error("Access Groups not loaded");
      } 
    } catch(e) {
      console.error(e);
      toast.error("Access Groups not loaded");
    }
  }, [isMounted]);

  useEffect(() => {
    getAccessGroups();
  },
  []);

  const [submitted, setSubmitted] = useState(false);

  const submitForm = e => {
    e.preventDefault();
    

    setSubmitted(true);
    Promise.all(personsInfo.map(person => {
      person.valid.submitOk = true;
      return personApi.createPerson({
        personFirstName: person.firstName,
        personLastName: person.lastName,
        personUid: person.uid,
        personMobileNumber: person.mobileNumber,
        personEmail: person.email
      })
    })).then(values => {
      let allSuccess = true;

      values.forEach((res, i) => {
        if (res.status != 201) {
          allSuccess = false;
          personsInfo[i].valid.submitOk = false;
        }
      })
      
      if(allSuccess) {
        toast.success('Persons created')
        router.replace('/dashboard/persons')
      } else {
        toast.error('Error creating the highlighted persons')
        setSubmitted(false);
      }
    })
  }

  return (
    <>
      <Head>
        <title>
          Etlas: Create Persons
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
              href="/dashboard/persons"
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
                <ArrowBackIcon
                  fontSize="small"
                  sx={{ mr: 1 }}
                />
                <Typography variant="subtitle2">
                  Persons
                </Typography>
              </Link>
            </NextLink>
          </Box>
          <Stack spacing={3}>
            <div>
              <Typography variant="h3">
                Add Persons
              </Typography>
            </div>
            <form onSubmit={submitForm}>
              <Stack spacing={3}>
                {personsInfo.map(person => (
                  <PersonAddForm
                    person={person}
                    removePerson={removePerson}
                    onUidChange={onUidChange}
                    onNameChange={onNameChange}
                    onNumberChange={onNumberChange}
                    onEmailChange={onEmailChange}
                    key={person.id}
                    allAccessgroups={allAccessgroups}
                  />
                ))}
                <div>
                  <Button
                    size="large"
                    sx={{ mr: 3 }}
                    variant="contained"
                    startIcon={(
                      <AddIcon />
                    )}
                    onClick={addPerson}
                  >
                      Add person
                  </Button>
                </div>
                <div>
                  <Button
                    size="large"
                    type="submit"
                    sx={{ mr: 3 }}
                    variant="contained"
                    disabled={
                      submitted ||
                      personsInfo.length == 0 ||
                      !personsInfo.every(person => person.valid.firstName &&
                                                  person.valid.lastName &&
                                                  person.valid.uidNotRepeated &&
                                                  person.valid.uidNotInUse &&
                                                  person.valid.mobileNumber &&
                                                  person.valid.mobileNumberNotRepeated &&
                                                  person.valid.mobileNumberNotInUse &&
                                                  person.valid.email &&
                                                  person.valid.emailNotRepeated &&
                                                  person.valid.emailNotInUse &&
                                                  person.valid.accessGroup)}
                  >
                      Submit
                  </Button>
                  <NextLink
                    href="/dashboard/persons"
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
          </Stack>
        </Container>
      </Box>
    </>
  );
};

CreatePersons.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>
      {page}
    </DashboardLayout>
  </AuthGuard>
);

export default CreatePersons;
