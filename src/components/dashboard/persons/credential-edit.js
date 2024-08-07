import {
	Button,
	Divider,
	Grid,
	IconButton,
	InputAdornment,
	TextField,
} from "@mui/material";
import SingleSelect from "../shared/single-select-input";
import Toggle from "../shared/toggle";
import { getCredTypeId, getCredTypeName } from "../../../utils/credential-type";
import { createRef, useEffect, useRef, useState } from "react";
import { toStringFromStringOrObject } from "../../../utils/credential";
import  PasswordField  from "../shared/new-password-field";
// import { PasswordField } from "../shared/password-field";

const today = new Date();
today.setHours(0, 0, 0); // since expiry date is end date inclusive (until 235959)

const CredentialEdit = ({
	onCredTypeChange,
	credTypes,
	credential,
	removeCredential,
	onCredUidChange,
	onCredTTLChange,
	onCredValidChange,
	onCredPermChange,
	validation,
    // credUidRef,
}) => {
	// console.log("thisis credential", credential);
	const {
		credId,
		credTypeId,
		credUid,
		credTTL, // Date obj
		isValid,
		isPerm,
		credType,
	} = credential;

	// seperate but equal value states for rendering help
	const [valid, setValid] = useState(isValid);
	const [perm, setPerm] = useState(isPerm);
	const [endDate, setEndDate] = useState(credTTL); // Date obj

	const credUidRef = useRef(credUid);

    // const credUidRef=test()
    // console.log("UidREF", test())
    // console.log("UidREF", credUidRef)
	const handleCredUidChange = (e) => {
		console.log("cred change")
		e.preventDefault();
		// onCredUidChange(credUidRef.current.value);
		// onCredUidChange(e.target.value);
		onCredUidChange(credUidRef);
	};

	const handleCredTTLChange = (e) => {
		const input = e.target?.value;
		if (input == "") {
			// incomplete or empty date
			onCredTTLChange(null);
			setEndDate(null);
		} else {
			const date = new Date(input);
			onCredTTLChange(date);
			setEndDate(date);
		}
	};

	const handleCredValidChange = (e) => {
		const bool = e.target.checked;
		onCredValidChange(bool);
		setValid(bool);
	};

	const handleCredPermChange = (e) => {
		const bool = e.target.checked;
		onCredPermChange(bool);
		setPerm(bool);
	};

	/** 
   * Checks for duplicates in credentials based on a combination of credTypeId and credUid for each person.
   * 
   * @param {object[]} infoArr
   * @param {object[]} validArr
   * @returns {boolean} true if the validation state is changed, false otherwise
   */
	const checkCredRepeatedHelper = (infoArr, validArr) => {
		let toChange = false;
	
		const credMap = {}; // maps credTypeId to array of credUid
		const repeatedCred = []; // array of [credTypeId, credUid]
		infoArr.forEach((person) =>
		  person.credentials.forEach((cred) => {
			const credTypeId = cred.credTypeId;
			const uid = cred.credUid;
			if (credTypeId != "" && uid != "" && credTypeId != CredTypePinID) {
			  if (!(credTypeId in credMap)) {
				credMap[credTypeId] = [];
			  }
			  const arr = credMap[credTypeId];
			  if (arr.some((e) => e == uid)) {
				repeatedCred.push([credTypeId, uid]);
			  } else {
				arr.push(uid);
			  }
			}
		  })
		);
	
		infoArr.forEach((person, i) => {
		  const repeatedCredIds = [];
		  person.credentials.forEach((cred) => {
			if (
			  repeatedCred.some(
				(c) => c[0] == cred.credTypeId && c[1] == cred.credUid
			  )
			) {
			  repeatedCredIds.push(cred.credId);
			}
		  });
		  if (
			!arraySameContents(repeatedCredIds, validArr[i].credentialRepeatedIds)
		  ) {
			toChange = true;
			validArr[i].credentialRepeatedIds = repeatedCredIds;
		  }
		});
	
		return toChange;
	  };
	
	  /**
	   * Checks for duplicates of credential UIDs (credUid) across all persons
	   * 
	   * @param {object[]} infoArr
	   * @param {object[]} validArr
	   * @returns {boolean} true if the validation state is changed, false otherwise
	   */
	  const checkCredUidRepeatedForNotPinTypeCred = (infoArr, validArr) => {
		let toChange = false;
	
		const credMap = {}; // maps credUidto array of a list of [persons id, cred id]
		const repeatedCredUidCredIds = [];
		infoArr.forEach((person, i) => {
		  person.credentials.forEach((cred) => {
			const credTypeId = cred.credTypeId;
			const uid = cred.credUid;
			if (credTypeId != "" && uid != "" && credTypeId != CredTypePinID) {
			  if (!(uid in credMap)) {
				credMap[uid] = [person.personUid, cred.credId];
			  } else {
				credMap[uid].push([person.personUid, cred.credId]);
				repeatedCredUidCredIds.push(cred.credId);
			  }
			}
		  });
	
		  if (
			!arraySameContents(
			  repeatedCredUidCredIds,
			  validArr[i].credentialUidRepeatedIds
			)
		  ) {
			toChange = true;
			validArr[i].credentialUidRepeatedIds = repeatedCredUidCredIds;
		  }
		});
	
		return toChange;
	  };
	
	  /**
	   * Checks if there is only one valid (4-6 digits) PIN per person and updates the validation state accordingly
	   * 
	   * @param {object[]} infoArr
	   * @param {object[]} validArr
	   * @returns {boolean} true if the validation state is changed, false otherwise
	   */
	  const checkPinCredValidity = (infoArr, validArr) => {
		const pinTypeId = 4; // 4 is the ID for PIN type credentials
		let toChange = false;
	
		infoArr.forEach((person, i) => {
		  const pinCreds = person.credentials.filter(cred => cred.credTypeId === pinTypeId);
	
		  // Collect IDs of PIN credentials with invalid length
		  const invalidPinCredIds = pinCreds
			.filter(cred => cred.credUid.length < 4 || cred.credUid.length > 6)
			.map(cred => cred.credId);
	
		  // Check if there are any invalid PIN credentials
		  if (invalidPinCredIds.length > 0) {
			validArr[i].credentialPinInvalidLengthIds = invalidPinCredIds;
			toChange = true;
		  } else {
			// Reset the state if previously marked as invalid
			if (validArr[i].credentialPinInvalidLengthIds && validArr[i].credentialPinInvalidLengthIds.length > 0) {
			  validArr[i].credentialPinInvalidLengthIds = [];
			  toChange = true;
			}
		  }
		});
	
		return toChange;
	  };
	
	  const PIN_CRED_TYPE = { id: 4, name: 'Pin' };
	
	  const hasPinCred = (personCredentials) => {
		return personCredentials.some(cred => cred.credTypeId === PIN_CRED_TYPE.id);
	  };
	
	  /**
	   * Updates the credential validity state and credTypes when credType changes
	   * 
	   * @param {number} personId
	   * @param {number} credId
	   * @returns {function} event handler
	   */
	  const onCredTypeChangeFactory = (personId) => (credId) => (e) => {
		const newInfo = [...personsInfo];
		const person = newInfo.find(p => p.personId === personId);
		const cred = person.credentials.find(cred => cred.credId === credId);
	
		cred.credTypeId = e.target.value;
	
		// Update credTypes based on the existence of a pin cred
		const hasPin = hasPinCred(person.credentials);
		if (hasPin) {
			// Exclude pin type if a pin cred already exists
			setCredTypes(credTypes.filter(credType => credType.credTypeId !== PIN_CRED_TYPE.id));
		} else {
			// Include pin type if no pin cred exists
			setCredTypes(originalCredTypes);
		}
	
		setPersonsInfo(newInfo);
	
		// Reset and update validations
		const newValidations = [...personsValidation];
		newInfo.forEach((person, i) => {
			newValidations[i].credentialSubmitFailed = {};
		});
	
		const b1 = checkCredRepeatedHelper(newInfo, personsValidation);
		const b2 = checkCredUidRepeatedForNotPinTypeCred(newInfo, personsValidation);
		const b3 = checkPinCredValidity(newInfo, personsValidation);
	
		if (b1 || b2 || b3) {
			setPersonsValidation([...personsValidation]);
		}
	  };
	
	  const onCredUidChangeFactory = (personId) => (credId) => (ref) => {
		// personsInfo.find(p => p.personId == personId).credentials.find(cred => cred.credId == credId).credUid = ref;
		personsInfo
		  .find((p) => p.personId == personId)
		  .credentials.find((cred) => cred.credId == credId).credUid =
		  ref.current?.value;
		// console.log("uidchange,originalcreds?",personsInfo.find(p => p.personId == personId).originalCreds)
	
		const newValidations = [...personsValidation];
	
		personsInfo.forEach((person, i) => {
		  newValidations[i].credentialSubmitFailed = {};
		});
		setPersonsValidation(newValidations);
	
		const b1 = checkCredRepeatedHelper(personsInfo, personsValidation);
		const b2 = checkCredUidRepeatedForNotPinTypeCred(personsInfo, personsValidation);
		const b3 = checkPinCredValidity(personsInfo, personsValidation);
		if (b1 || b2 || b3) {
		  setPersonsValidation([...personsValidation]);
		}
	  };
	
	  const onCredValidChangeFactory = (personId) => (credId) => (bool) => {
		personsInfo
		  .find((p) => p.personId == personId)
		  .credentials.find((cred) => cred.credId == credId).isValid = bool;
	  };
	
	  const onCredPermChangeFactory = (personId) => (credId) => (bool) => {
		personsInfo
		  .find((p) => p.personId == personId)
		  .credentials.find((cred) => cred.credId == credId).isPerm = bool;
	  };
	
	  const onCredTTLChangeFactory = (personId) => (credId) => (dateObj) => {
		console.log(dateObj);
		personsInfo
		  .find((p) => p.personId == personId)
		  .credentials.find((cred) => cred.credId == credId).credTTL = dateObj;
	  };

	const TTLHelperText =
		endDate != null && endDate < today
			? "Note: expiry is before today"
			: "Expiry is end date inclusive";
	const credentialSubmitFailed = validation.credentialSubmitFailed[credId] !== undefined;
	const credentialRepeated = validation.credentialRepeatedIds.includes(credId);
	const credentialUidRepeatedForNotPinTypeCred = validation.credentialUidRepeatedIds.includes(credId);
	const credentialPinInvalidLength = validation.credentialPinInvalidLengthIds.includes(credId);

	// const [show, setShow] = useState(true);
	// const handleShowPasswordClick = () => setShow(!show);
	return (
		<Grid item
			container>
			<Grid 
				container
				item
				display="flex"
				justifyContent="space-between"
				alignItems="start"
				flexWrap="wrap"
				md={6}
				xs={12}
				spacing={1}
				mb={1}
			>
				    <Grid
                    item
                    md={3}
                >
				<SingleSelect
					fullWidth
					sx={{ minWidth: '90px' }}
					label="Type"
					getLabel={getCredTypeName}
					onChange={onCredTypeChange}
					// value={credType ? credType.credTypeId : '' }
					value={credTypeId ? credTypeId : ""}
					options={credTypes}
					getValue={getCredTypeId}
					noclear
					required
					helperText=" "
				/>
				</Grid>
			<Grid item
                    md={5}>
				<PasswordField
                    required
                    label="Value"
                    onChange={handleCredUidChange}
                    // inputRef={credUidRef.current.value} undef
                    // inputRef={credUidRef.current?.value} undef
                    inputRef={credUidRef} //changed but initial value not displayed
                    // inputRef={credUid} //cannot create property 'current' on .../
                    // value={credUid}
                    // value={credUidRef.current.value}
                    // value={credUidRef.current.value}  undef
                    // value={credUidRef.current?.value} undef
                    error={
						credentialRepeated ||
						credentialSubmitFailed ||
						credentialUidRepeatedForNotPinTypeCred ||
						credentialPinInvalidLength
					}
					helperText={
						(credentialSubmitFailed && "Error: " + validation.credentialCheckFailed[credId]) ||
						(credentialRepeated && "Error: repeated credential type & value in form") ||
						(credentialUidRepeatedForNotPinTypeCred && "Error: credential value for non-pin credentials must be unique") ||
						(credentialPinInvalidLength && "Error: pin value has to be between 4 to 6 characters inclusive") ||
						' '
					}
                    defaultValue={credUid}
                />
			</Grid>
			<Grid item
				md={4}>
				<Toggle
					checked={valid}
					handleChange={handleCredValidChange}
					label="Enabled"
				/>
			</Grid>
			</Grid>
			<Grid            
				item
                display="flex"
                justifyContent="space-between"
                alignItems="start"
                flexWrap="wrap"
                md={6}
                xs={12}
                mb={1}
                container
                spacing={1}>
					<Grid
					  item
					  md={5}
					  mb={1}>
				<Toggle
					checked={perm}
					handleChange={handleCredPermChange}
					label="Permanent"
				/>
				</Grid>
			<Grid item
				md={5}>
				{!isPerm && (
					<TextField // ref does not work as removing and re rendering it removes the date, even though ref.current?.value still has the prev date
						fullWidth
						required
						label="Expiry Date"
						type="date"
						InputLabelProps={{ shrink: true }}
						helperText={TTLHelperText}
						onChange={handleCredTTLChange}
						value={toStringFromStringOrObject(endDate)} // this takes in yyyy-mm-dd
						// value={toDateInputString(endDate)} // this takes in yyyy-mm-dd
					/>
				)}
			</Grid>
			<Grid
			item
			md={2}>
				<Button variant="outlined"
					color="error"
					onClick={removeCredential}>
					Clear
				</Button>
		</Grid>
		</Grid>
		<Divider sx={{width:'100%'}}/>
		</Grid>
	);
};

export default CredentialEdit;