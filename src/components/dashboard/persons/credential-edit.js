import {
	Button,
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

	const TTLHelperText =
		endDate != null && endDate < today
			? "Note: expiry is before today"
			: "Expiry is end date inclusive";
	// const credentialInUse = validation.credentialInUseIds.includes(credId);
	// const credentialRepeated = validation.credentialRepeatedIds.includes(credId);

	// const [show, setShow] = useState(true);
	// const handleShowPasswordClick = () => setShow(!show);
	return (
		<Grid item container spacing={1}>
			<Grid item md={2} xs={4} display="flex" alignItems="center">
				<SingleSelect
					fullWidth
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
			<Grid item md={2} xs={4} display="flex" alignItems="center">
				{/* <TextField
					type={show ? "text" : "password"}
					value={credUid}
					onChange={handleCredUidChange}
					endAdornment={
						<InputAdornment position="end">
							<IconButton onClick={handleShowPasswordClick}>
								{show ? (
									<VisibilityOff fontSize="small" />
								) : (
									<Visibility fontSize="small" />
								)}
							</IconButton>
						</InputAdornment>
					}
				/> */}
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
                    // error={credentialInUse || credentialRepeated}
                    // helperText={
                    //     (credentialInUse && "Repeated type & value") ||
                    //     (credentialRepeated && "Repeated type & value in form") || ' '
                    // }
                    defaultValue={credUid}
                />
			</Grid>
			<Grid item md={2} xs={4} display="flex" alignItems="center">
				<Toggle
					checked={valid}
					handleChange={handleCredValidChange}
					label="Enabled"
				/>
			</Grid>
			<Grid item md={2} xs={4} display="flex" alignItems="center">
				<Toggle
					checked={perm}
					handleChange={handleCredPermChange}
					label="Permanent"
				/>
			</Grid>
			<Grid item md={3} xs={6} display="flex" alignItems="center">
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
			<Grid item md={1} xs={2} display="flex" alignItems="center">
				<Button variant="outlined" color="error" onClick={removeCredential}>
					Clear
				</Button>
			</Grid>
		</Grid>
	);
};

export default CredentialEdit;
