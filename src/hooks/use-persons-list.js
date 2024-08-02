import { useState, useEffect } from 'react';
import { getPerson, getCredentialWherePersonIdApi } from '../api/person';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

/**
 * Custom hook to fetch persons and their credentials based on provided IDs.
 * The alternative to this hook is to simply get all persons and iterate through them to find the ones needed.
 *
 * @param {number[]} ids - List of person IDs to fetch
 * @param {Function} setPersonsInfo - Function to update persons info state
 * @param {Function} setPersonsValidation - Function to update persons validation state
 * @param {number} serverDownCode - Status code indicating server down
 * @param {Function} setServerDownOpen - Function to handle server down state
 * @returns {Object} - Returns the loading state
 */
const usePersons = (ids, setPersonsInfo, setPersonsValidation, serverDownCode, setServerDownOpen) => {
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!ids || ids.length === 0) return; // Exit if no IDs provided

    const fetchData = async () => {
      setLoading(true);
      const personsInfoArr = [];
      const validations = [];

      try {
        const resArr = await Promise.all(ids.map((id) => getPerson(id)));
        const successfulRes = resArr.filter((res) => res.status === 200);

        if (successfulRes.length === 0) {
          toast.error("Error editing persons. Please try again");
          router.replace("/dashboard/persons");
          return;
        }

        if (successfulRes.length !== resArr.length) {
          toast.error("Some persons were not found");
        }

        const resArr2 = await Promise.all(
          ids.map((id) => getCredentialWherePersonIdApi(id))
        );
        
        const credArr = await Promise.all(resArr2.map((res) => res.json()));
        credArr.forEach((creds) => {
          creds.forEach((cred) => {
            cred.credTypeId = cred.credType.credTypeId;
          });
        });

        const credArr2 = JSON.parse(JSON.stringify(credArr));
        const bodyArr = await Promise.all(successfulRes.map((req) => req.json()));
        bodyArr.forEach((body, i) => {
          personsInfoArr.push({
            personId: body.personId,
            personFirstName: body.personFirstName,
            personLastName: body.personLastName,
            personUid: body.personUid,
            personMobileNumber: body.personMobileNumber,
            personEmail: body.personEmail,
            personOriginalEmail: body.personEmail,
            personOriginalUid: body.personUid,
            personOriginalMobileNumber: body.personMobileNumber,
            accessGroup: body.accessGroup,
            credentials: credArr[i],
            originalCreds: credArr2[i],
          });

          validations.push({
            personId: body.personId,
            firstNameBlank: false,
            lastNameBlank: false,
            uidInUse: false,
            uidRepeated: false,
            uidBlank: false,
            credentialRepeatedIds: [],
            credentialUidRepeatedIds: [],
            credentialSubmitFailed: {},
            credentialPinInvalidLengthIds: [],
            credentialMultiplePins: false,
            numberInvalid: false,
            numberErrorMessage: null,
            numberInUse: false,
            numberRepeated: false,
            emailInUse: false,
            emailRepeated: false,
            submitFailed: false,
          });
        });

        setPersonsValidation(validations);
        setPersonsInfo(personsInfoArr);
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ids, setPersonsInfo, setPersonsValidation, serverDownCode, setServerDownOpen]);

  return { loading };
};

export default usePersons;
