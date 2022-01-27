import { useEffect, useState } from "react";
import NextLink from "next/link";
import numeral from "numeral";
import PropTypes from "prop-types";
import {
	Avatar,
	Box,
	Button,
	Checkbox,
	IconButton,
	Link,
	Menu,
	MenuItem,
	MenuList,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TablePagination,
	TableRow,
	Typography,
} from "@mui/material";
import { ArrowRight as ArrowRightIcon } from "../../../icons/arrow-right";
import { PencilAlt as PencilAltIcon } from "../../../icons/pencil-alt";
import { getInitials } from "../../../utils/get-initials";
import { Scrollbar } from "../../scrollbar";
import { Buttons1 } from "../../widgets/buttons/buttons-1";
import { Buttons2 } from "../../widgets/buttons/buttons-2";
import { Buttons3 } from "../../widgets/buttons/buttons-3";
import { Buttonfilter } from "../../widgets/buttons/buttonfilter";
import { SeverityPill } from "../../severity-pill";
import WarningIcon from '@mui/icons-material/Warning';
import { useRouter } from 'next/router'


export const PersonsListTable = (props) => {
	const {
		Persons,
		PersonsCount,
		onPageChange,
		onRowsPerPageChange,
		page,
		rowsPerPage,
		...other
	} = props;
	// const [selectedPersons, setSelectedPersons] = useState([]);



	// // Reset selected Persons when Persons change
	// useEffect(
	// 	() => {
	// 		if (selectedPersons.length) {
	// 			setSelectedPersons([]);
	// 		}
	// 	},
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// 	[Persons]
	// );

	// const handleSelectAllPersons = (event) => {
	// 	setSelectedPersons(
	// 		event.target.checked ? Persons.map((person) => person.personId) : []
	// 	);
	// };

	// const handleSelectOneperson = (event, personId) => {
	// 	if (!selectedPersons.includes(personId)) {
	// 		setSelectedPersons((prevSelected) => [...prevSelected, personId]);
	// 	} else {
	// 		setSelectedPersons((prevSelected) =>
	// 			prevSelected.filter((id) => id !== personId)
	// 		);
	// 	}
	// };

	// const enableBulkActions = selectedPersons.length > 0;
	// const selectedSomePersons =
	// 	selectedPersons.length > 0 && selectedPersons.length < Persons.length;
	// const selectedAllPersons = selectedPersons.length === Persons.length;

//   const [selectId, setSelectId] = useState([]);
// 	const handleSelectId = (event,personId) => {
//   setSelectId(personId)
//   }, [selectId]);
  
  return (
		<div {...other}>
			<Box
				sx={{
					backgroundColor: "neutral.100",
					display: "none",
					px: 2,
					py: 0.5,
				}}
			>
				<Checkbox
					checked={props.selectedAllPersons}
					indeterminate={props.selectedSomePersons}
					onChange={props.handleSelectAllPersons}
				/>
				{/* <Button size="small" sx={{ ml: 2 }}>
					Delete
				</Button>
				<Button size="small" sx={{ ml: 2 }}>
					Edit
				</Button> */}
			</Box>
			<Scrollbar>
				<Table sx={{ minWidth: 700 }}>
					<TableHead
						// sx={{ visibility: props.enableBulkActions ? "collapse" : "visible" }}
					>
						<TableRow>
							<TableCell padding="checkbox">
								<Checkbox
									checked={props.selectedAllPersons}
									indeterminate={props.selectedSomePersons}
									onChange={props.handleSelectAllPersons}
								/>
							</TableCell>
							<TableCell>Name</TableCell>
							<TableCell>Mobile number</TableCell>
							<TableCell>email</TableCell>
							<TableCell>
								<Buttonfilter
                //pass org group into array prop. should store somewhere first
									array={["ORG/DEPT", "Org group1", "Org group2"]}
									sx={{}}
								/>
							</TableCell>
							<TableCell>
								<Buttonfilter
									array={["ACCESS GROUP", "Access group1", "Access group2"]}
									sx={{}}
								/>
							</TableCell>
							<TableCell align="left">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{Persons.map((person) => {
							const isPersonselected = props.selectedPersons.includes(person.personId);

							return (
								<TableRow hover key={person.personId} selected={isPersonselected}>
									<TableCell padding="checkbox">
										<Checkbox
											checked={isPersonselected}
											onChange={(event) =>
												props.handleSelectOneperson(event, person.personId)
											}
											value={isPersonselected}
										/>
									</TableCell>
									<TableCell>
										<Box
											sx={{
												m: 1,
												alignItems: "center",
												display: "flex",
											}}
										>
											<Avatar
												src={person.avatar}
												sx={{
													height: 42,
													width: 42,
												}}
											>
												{getInitials(person.personFirstName)}
											</Avatar>
											<Box sx={{ ml: 1 }}>
												<NextLink href={"/dashboard/persons/details/" + person.personId} passHref>
													<Link color="inherit" variant="subtitle2">
														{person.personFirstName} {person.personLastName}
													</Link>
												</NextLink>
												<Typography color="textSecondary" variant="body2">
													Uid: {person.personUid}
												</Typography>
											</Box>
										</Box>
									</TableCell>
									<TableCell>
                  { person.personMobileNumber || 
                    <SeverityPill
                      color='warning'
                    >
                      <WarningIcon fontSize="small" />
                      No mobile number
                    </SeverityPill>}
                  </TableCell>
									<TableCell >{ person.personEmail || 
                    <SeverityPill
                      color='warning'
                    >
                      <WarningIcon fontSize="small" />
                      No email
                    </SeverityPill>}
                  </TableCell>
									<TableCell>{person.personOrgGroup}</TableCell>
									<TableCell>{person.PersonAccessGroup}</TableCell>

									{/* <TableCell>
                    <Typography
                      color="success.main"
                      variant="subtitle2"
                    >
                      {numeral(person.totalAmountSpent).format(`${person.currency}0,0.00`)}
                    </Typography>
                  </TableCell> */}
									<TableCell align="left">
										<NextLink href={{
										pathname: '/dashboard/persons/edit',
										query: { ids: encodeURIComponent(JSON.stringify([person.personId])) }
									}} passHref>
											<IconButton component="a">
												<PencilAltIcon fontSize="small" />
											</IconButton>
										</NextLink>
										<NextLink href={"/dashboard/persons/details/" + person.personId} passHref>
											<IconButton component="a">
												<ArrowRightIcon fontSize="small" />
											</IconButton>
										</NextLink>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</Scrollbar>
			<TablePagination
				component="div"
				count={PersonsCount}
				onPageChange={onPageChange}
				onRowsPerPageChange={onRowsPerPageChange}
				page={page}
				rowsPerPage={rowsPerPage}
				rowsPerPageOptions={[5, 10, 25]}
			/>
		</div>
	);
};

PersonsListTable.propTypes = {
	Persons: PropTypes.array.isRequired,
	PersonsCount: PropTypes.number.isRequired,
	onPageChange: PropTypes.func,
	onRowsPerPageChange: PropTypes.func,
	page: PropTypes.number.isRequired,
	rowsPerPage: PropTypes.number.isRequired,
};
