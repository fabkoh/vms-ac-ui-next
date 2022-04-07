// import { useEffect, useState } from 'react';
// import Head from 'next/head';
// import NextLink from 'next/link';
// import { useRouter } from 'next/router'
// import {
//   Box,
//   Container,
//   Link,
//   Typography,
//   Stack,
//   Button
// } from '@mui/material';
// import AddIcon from '@mui/icons-material/Add';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import { AuthGuard } from '../../../../components/authentication/auth-guard';
// import { DashboardLayout } from '../../../../components/dashboard/dashboard-layout';
// import { PersonEditForm } from '../../../../components/dashboard/persons/person-edit-form';
// import { personApi } from '../../../../api/person';
// import toast from 'react-hot-toast';
// import { accessGroupApi } from '../../../../api/access-groups';

// const EditPersons = () => {

//   const router = useRouter();
//   const ids = JSON.parse(decodeURIComponent(router.query.ids));
//   const [personsInfo, setPersonsInfo] = useState([])

//   const getPersons = ids => {
// 	Promise.all(ids.map(id => personApi.getPerson(id)))
// 	  .then(resArray => {
//       Promise.all(resArray.filter(res => res.status == 200).map( res => res.json() ))
//         .then(personArray => {
//           setPersonsInfo(personArray.map(person => {
//             if(person.accessGroup){
//             return {
//               id: person.personId,
//               firstName: person.personFirstName,
//               lastName: person.personLastName,
//               uid: person.personUid,
//               mobileNumber: person.personMobileNumber,
//               email: person.personEmail,
//               accessGroup:{
//                 accessGroupId:person.accessGroup.accessGroupId,
//                 accessGroupName:person.accessGroup.accessGroupName,
//                 accessGroupDesc:person.accessGroup.accessGroupDesc,
//               },
//               valid: {
//                 firstName: true,
//                 lastName: true,
//                 uidNotRepeated: true,
//                 uidNotInUse: true,
//                 mobileNumber: true,
//                 email: true,
//                 submitOk: true
//               }
//             }
//           }
//           return {
//             id: person.personId,
//             firstName: person.personFirstName,
//             lastName: person.personLastName,
//             uid: person.personUid,
//             mobileNumber: person.personMobileNumber,
//             email: person.personEmail,
//             accessGroup:{
//               accessGroupId:"",
//               accessGroupName:"",
//               accessGroupDesc:"",
//             },
//             valid: {
//               firstName: true,
//               lastName: true,
//               uidNotRepeated: true,
//               uidNotInUse: true,
//               mobileNumber: true,
//               email: true,
//               submitOk: true
//             }
//           }
//           }))
//         }).catch(err => console.log(err));
//     }).catch(err => console.log(err));}

//   useEffect(() => {
// 	  getPersons(ids);
//   }, [])
  

//   const getNextId = () => {
//     if(personsInfo.length == 0){
//       return 0
//     }
//     return personsInfo.at(-1).id + 1;
//   }

//   const removePerson = (id) => {
//     setPersonsInfo(personsInfo.filter(person => person.id != id))
//     // if last person is removed, redirect back to persons list
//     if(personsInfo.length == 1){
//       router.push('/dashboard/persons')
//     }
//   }

//   const onFieldChange = (e, id) => {
//     const newPersonsInfo = [ ...personsInfo ];
//     const newPersonInfo = newPersonsInfo.find(person => person.id == id);
//     newPersonInfo[e.target.name] = e.target.value;

//     setPersonsInfo(newPersonsInfo)
//   }

//   const onNameChange = (e, id) => {
//     const newPersonsInfo = [ ...personsInfo ];
//     const newPersonInfo = newPersonsInfo.find(person => person.id == id)
//     newPersonInfo[e.target.name] = e.target.value;
    
//     // check if input is blank
//     if(/^\s*$/.test(e.target.value)) {
//       newPersonInfo.valid[e.target.name] = false;
//     } else {
//       newPersonInfo.valid[e.target.name] = true;
//     }

//     setPersonsInfo(newPersonsInfo);
//   }

//   const onEmailChange = (e, id) => {
//     const newPersonsInfo = [ ...personsInfo ];
//     const newPersonInfo = newPersonsInfo.find(person => person.id == id);
//     newPersonInfo.email = e.target.value;

//     // test if email is valid
//     newPersonInfo.valid.email = (
//       e.target.value == "" || /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(e.target.value)
//     );

//     setPersonsInfo(newPersonsInfo);
//   }


//   const onNumberChange = async(e, id) => {
//     const newPersonsInfo = [ ...personsInfo ];
//     const newPersonInfo = newPersonsInfo.find(person => person.id == id);

//     newPersonInfo.mobileNumber = e;

//     // test if mobile number is valid
//     // newPersonInfo.valid.mobileNumber = (
//     //   e == ""  || /^\+\d{1,7}/.test(e)
//     // );
//     newPersonInfo.valid.mobileNumber = true;
//     if(!(/^\s*$/.test(newPersonInfo.mobileNumber))) {
//       const res = await personApi.mobileNumberExists(newPersonInfo.mobileNumber);
//       const data = await res.json();
//       newPersonInfo.valid.mobileNumber = !(data);
//     }
//     setPersonsInfo(newPersonsInfo);
//   }

//   const onUidChange = async (e, id) => {
//     const newPersonsInfo = [ ...personsInfo ];
//     const newPersonInfo = newPersonsInfo.find(person => person.id == id);
//     newPersonInfo.uid = e.target.value;

//     // test if uids are repeated
//     // maps uid to the first occurence of uid in new persons info
//     const uidMap = {}
//     for(let i=0; i<newPersonsInfo.length; i++) {

//       if(newPersonsInfo[i].uid == "") { 
//         newPersonsInfo[i].valid.uidNotRepeated = true;
//         continue;  
//       }
      
//       const uid = newPersonsInfo[i].uid
//       if(uid in uidMap) {
//         newPersonsInfo[i].valid.uidNotRepeated = false;
//         newPersonsInfo[uidMap[uid]].valid.uidNotRepeated = false;
//       } else {
//         uidMap[uid] = i;
//         newPersonsInfo[i].valid.uidNotRepeated = true;
//       }
//     }

//     newPersonInfo.valid.uidNotInUse = true;
//     // newPersonInfo.valid.uidNotInUse = !(await personApi.fakeUidExists(newPersonInfo.uid));
//     if(!(/^\s*$/.test(newPersonInfo.uid))) {
//       newPersonInfo.valid.uidNotInUse = !( await personApi.uidInUse(newPersonInfo.uid, newPersonInfo.id));
//     }

//     setPersonsInfo(newPersonsInfo);
//   }

//   const [submitted, setSubmitted] = useState(false);

//   const submitForm = (e) => {
//     e.preventDefault();
//     setSubmitted(true);
//     personsInfo.map(personInfo=> {
//       if(personInfo.accessGroup == null || personInfo.accessGroup.accessGroupId == "") {
//         personInfo.accessGroup=null;
//       }
//     })

//     Promise.all(personsInfo.map( personInfo => personApi.updatePerson({
//       personId: personInfo.id,
//       personFirstName: personInfo.firstName,
//       personLastName:personInfo.lastName,
//       personUid:personInfo.uid,
//       personMobileNumber:personInfo.mobileNumber,
//       personEmail:personInfo.email,
//       accessGroup:personInfo.accessGroup,
//     })))
//       .then( resArr => {
//         const failedPersons = [];

//         resArr.forEach((res, i) => {
//           if(res.status != 200) {
//             failedPersons.push(personsInfo[i]);
//             personsInfo[i].valid.submitOk=false;
//             setSubmitted(false);
//           }
//         })

//         const successfulEditCount = personsInfo.length - failedPersons.length;
//         if (successfulEditCount) {
//           toast.success(`Edit ${successfulEditCount == 1 ? '1 person' : `${successfulEditCount} persons`}`);
//         }

//         if (failedPersons.length) {
//           toast.error('Edit failed for highlighted persons');
//           setPersonsInfo(failedPersons);
//         } else {
//           router.replace('/dashboard/persons');
//         }

//       })
//     }

//     //reroute if empty
//     // useEffect(() => {
//     //  if(personsInfo.length==0){
//     //    router.push('/dashboard/persons')
//     //  }
//     // }, [personsInfo]);
    
//     const [allAccGroups, setAllAccGroups] = useState([])
//     const getAccGroups = async() => {
//       const res = await accessGroupApi.getAccessGroups();
//       const data = await res.json();
//       setAllAccGroups(data);
//      }
//      useEffect(() => {
//       getAccGroups();
//       personsInfo.map(person=> person.accessGroup?true:person.accessGroup="");
//      }, [])
     
//     const [accGroupName, setAccGroupName] = useState('')
//     // const handleAccGrpChg = (e,id) => {
//     //   const newPersonsInfo = [...personsInfo];
//     //   const newPersonInfo = newPersonsInfo.find(person=> person.id == id);
//     //   if(e.target.value == "clear"){
//     //     setAccGroupName("")
//     //     newPersonInfo.accessGroup = null
//     //     setPersonsInfo(newPersonsInfo)
//     //   }
//     //   else{
//     //   setAccGroupName(e.target.value)
//     //   const temp = allAccGroups.find(grp=>grp.accessGroupName==e.target.value)
//     //   console.log(typeof(e.target.value))

//     //   newPersonInfo.accessGroup.accessGroupId= temp.accessGroupId
//     //   setPersonsInfo(newPersonsInfo)
//     // }
//     // }

//     const handleAccGrpChg = (e, id) => {
//       const newPersonsInfo = [ ...personsInfo ];
//       const newPersonInfo = newPersonsInfo.find(person => person.id == id);
//       if(e.target.value == "clear") {
//         newPersonInfo.accessGroup = null
//       } else {
//         const accGroup = allAccGroups.find(grp => grp.accessGroupName == e.target.value);
//         newPersonInfo.accessGroup = accGroup
//       }
//       setPersonsInfo(newPersonsInfo)
//     }
  

//   return (
//     <>
//       <Head>
//         <title>
//           Etlas : Edit Persons
//         </title>
//       </Head>
//       <Box
//         component="main"
//         sx={{
//           flexGrow: 1,
//           py: 8
//         }}
//       >
//         <Container maxWidth="xl">
//           <Box sx={{ mb: 4 }}>
//             <NextLink
//               href="/dashboard/persons"
//               passHref
//             >
//               <Link
//                 color="textPrimary"
//                 component="a"
//                 sx={{
//                   alignItems: 'center',
//                   display: 'flex'
//                 }}
//               >
//                 <ArrowBackIcon
//                   fontSize="small"
//                   sx={{ mr: 1 }}
//                 />
//                 <Typography variant="subtitle2">
//                   Persons
//                 </Typography>
//               </Link>
//             </NextLink>
//           </Box>
//           <Stack spacing={3}>
//             <div>
//               <Typography variant="h3">
//                 Edit Persons
//               </Typography>
//             </div>
//             <form onSubmit={submitForm}>
//               <Stack spacing={3}>
//                 {personsInfo.map(person => (
//                   <PersonEditForm
//                     allAccGroups={allAccGroups}
//                     handleAccGrpChg={handleAccGrpChg}
//                     accGroupName={accGroupName}
//                     setAccGroupName={setAccGroupName}
//                     person={person}
//                     removePerson={removePerson}
//                     onFieldChange={onFieldChange}
//                     onUidChange={onUidChange}
//                     onNameChange={onNameChange}
//                     onNumberChange={onNumberChange}
//                     onEmailChange={onEmailChange}
//                     key={person.id}
//                   />
//                 ))}
//                 <div>
//                 </div>
//                 <div>
//                   <Button
//                     size="large"
//                     type="submit"
//                     sx={{ mr: 3 }}
//                     variant="contained"
//                     disabled={
//                       submitted ||
//                       personsInfo.length == 0 ||
//                       !personsInfo.every(person => person.valid.firstName &&
//                                                   person.valid.lastName &&
//                                                   person.valid.uidNotRepeated &&
//                                                   person.valid.uidNotInUse &&
//                                                   person.valid.mobileNumber &&
//                                                   person.valid.email)}
//                   >
//                       Submit
//                   </Button>
//                   <NextLink
//                     href="/dashboard/persons"
//                   >
//                     <Button
//                       size="large"
//                       sx={{ mr: 3 }}
//                       variant="outlined"
//                       color="error"
//                     >
//                         Cancel
//                     </Button>
//                   </NextLink>
//                 </div>
//               </Stack>
//             </form>
//           </Stack>
//         </Container>
//       </Box>
//     </>
//   );
// };

// EditPersons.getLayout = (page) => (
//   <AuthGuard>
//     <DashboardLayout>
//       {page}
//     </DashboardLayout>
//   </AuthGuard>
// );

// export default EditPersons;
