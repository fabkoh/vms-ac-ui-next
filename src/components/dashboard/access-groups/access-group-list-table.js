import { useEffect, useState } from "react";
import NextLink from "next/link";
import numeral from "numeral";
import PropTypes from "prop-types";
import {
	Avatar,
	Box,
	Button,
	Checkbox,
	Chip,
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
	Typography
} from "@mui/material";
import { ArrowRight as ArrowRightIcon } from "../../../icons/arrow-right";
import { PencilAlt as PencilAltIcon } from "../../../icons/pencil-alt";
import { Scrollbar } from "../../scrollbar";
import { Buttons1 } from "../../widgets/buttons/buttons-1";
import { Buttons2 } from "../../widgets/buttons/buttons-2";
import { Buttons3 } from "../../widgets/buttons/buttons-3";
import { Buttonfilter } from "../../widgets/buttons/buttonfilter";
import { SeverityPill } from "../../severity-pill";
import WarningIcon from "@mui/icons-material/Warning";
import { useRouter } from "next/router";
import { width } from "@mui/system";

export const AccessGroupListTable = (props) => {
	const {
		accessGroup,
		accessGroupCount,
		onPageChange,
		onRowsPerPageChange,
		page,
		rowsPerPage,
		person,
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
					checked={props.selectedAllAccessGroup}
					indeterminate={props.selectedSomeAccessGroup}
					onChange={props.handleSelectAllAccessGroup}
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
					sx={{backgroundColor: "neutral.200"}}
					>
						<TableRow>
							<TableCell padding="checkbox">
                                <Checkbox
                                    checked={props.selectedAllAccessGroup}
                                    indeterminate={props.selectedSomeAccessGroup}
                                    onChange={props.handleSelectAllAccessGroup}
                                />
							</TableCell>
							<TableCell>Access Group</TableCell>
							<TableCell>Description</TableCell>
							<TableCell sx={{ paddingLeft: 2.5 }}> Status</TableCell>
							<TableCell align="center"> In Schedule</TableCell>
							<TableCell>No. Of Persons</TableCell>
							<TableCell>No. Of Entrances</TableCell>
							<TableCell align="center">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{accessGroup.map((accGroup) => {
							const isAccessGroupselected = props.selectedAccessGroup.includes(
								accGroup.accessGroupId
							);

							return (
								<TableRow
									hover
									key={accGroup.accessGroupId}
									selected={isAccessGroupselected}
								>
									<TableCell padding="checkbox">
										<Checkbox
											checked={isAccessGroupselected}
											onChange={(event) =>
												props.handleSelectOneAccessGroup(event, accGroup.accessGroupId)
											}
											value={isAccessGroupselected}
										/>
									</TableCell>
									<TableCell width="15%">
										<Box
											sx={{
												//alignItems: "center",
												display: "flex"
											}}
										>
											
												<NextLink
													href={"/dashboard/access-groups/details/" + accGroup.accessGroupId}
													passHref
												>
													<Link color="inherit"
														variant="headline5">
														<Typography noWrap>
														{accGroup.accessGroupName}
														</Typography>
													</Link>
												</NextLink>
											
										</Box>
									</TableCell>
                                    <TableCell width="20%">
										{accGroup.accessGroupDesc ? (
											<NextLink
												href={"/dashboard/access-groups/details/" + accGroup.accessGroupId}
												passHref
											>
												<Link color="inherit">
													<Typography>{accGroup.accessGroupDesc}</Typography>
												</Link>
											</NextLink>
										) : (
											<SeverityPill color="warning">
												<WarningIcon fontSize="small"
												sx={{ mr: 1 }}/>
												No Descriptions
											</SeverityPill>
										) }
									</TableCell>
									<TableCell width="10%">
										<Chip
											label={accGroup.isActive ? "ACTIVE" : "NOT ACTIVE"}
											onClick={() => {}}
											color={accGroup.isActive? "success" : "error"}
											sx={{
												fontSize: "12px",
												fontWeight: 600
											}}
											size="small"
										/>
									</TableCell>
									<TableCell width="15%"
										align="center">
										{accGroup.isInSchedule && accGroup.isActive ? "Yes" : "No"}
									</TableCell>
									<TableCell width="15%">
										<Typography width={130}
											noWrap>
											{(Array.isArray(accGroup.persons) && accGroup.persons.length) || (
												<SeverityPill color="warning">
													<WarningIcon fontSize="small"
													sx={{ mr: 1 }} />
													No Persons
												</SeverityPill>
											)}
										</Typography>
									</TableCell>
									<TableCell width="15%">
										{
											(Array.isArray(accGroup.entrances) && accGroup.entrances.length > 0) ? (
												<Typography>{accGroup.entrances.length}</Typography>
											) : (
												<SeverityPill color="warning">
													<WarningIcon fontSize="small"
													sx={{ mr: 1 }} />
													No entrances
												</SeverityPill>
											)
										}
									</TableCell>

									<TableCell width="20%"
										align="center">
										<NextLink
											href={{
												pathname: "/dashboard/access-groups/edit",
												query: {
													ids: encodeURIComponent(
														JSON.stringify([accGroup.accessGroupId])
													),
												},
											}}
											passHref
										>
											<IconButton component="a">
												<PencilAltIcon fontSize="small" />
											</IconButton>
										</NextLink>
										<NextLink
											href={"/dashboard/access-groups/details/" + accGroup.accessGroupId}
											passHref
										>
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
				count={accessGroupCount}
				onPageChange={onPageChange}
				onRowsPerPageChange={onRowsPerPageChange}
				page={page}
				rowsPerPage={rowsPerPage}
				rowsPerPageOptions={[5, 10, 25]}
			/>
		</div>
	);
};

AccessGroupListTable.propTypes = {
	accessGroup: PropTypes.array.isRequired,
	accessGroupCount: PropTypes.number.isRequired,
	onPageChange: PropTypes.func,
	onRowsPerPageChange: PropTypes.func,
	page: PropTypes.number.isRequired,
	rowsPerPage: PropTypes.number.isRequired,
};
