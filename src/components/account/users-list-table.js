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
import { ArrowRight as ArrowRightIcon } from "../../icons/arrow-right";
import { PencilAlt as PencilAltIcon } from "../../icons/pencil-alt";
import { getInitials } from "../../utils/get-initials";
import { Scrollbar } from "../scrollbar";
import { SeverityPill } from "../severity-pill";
import WarningIcon from "@mui/icons-material/Warning";
import { useRouter } from "next/router";
import { width } from "@mui/system";
import { ListFilter } from "../../components/dashboard/shared/list-filter";
import { getPersonDetailsLink, getPersonName, getPersonsEditLink } from "../../utils/persons";

export const UsersListTable = (props) => {
	const {
		Persons,
		PersonsCount,
		onPageChange,
		onRowsPerPageChange,
		page,
		rowsPerPage,
		accessGroupNames,
		onSelect,
		...other
	} = props;


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

			</Box>
			<Scrollbar>
				<Table sx={{ minWidth: 700 }}>
					<TableHead
					// sx={{ visibility: props.enableBulkActions ? "collapse" : "visible" }}
					sx={{backgroundColor: "neutral.200",}}
					>
						<TableRow>
							<TableCell padding="checkbox" width="5%">
								<Checkbox
									checked={props.selectedAllPersons}
									indeterminate={props.selectedSomePersons}
									onChange={props.handleSelectAllPersons}
								/>
							</TableCell>
							<TableCell width="25%">Name</TableCell>
							<TableCell width="20%">Role</TableCell>
							<TableCell width="30%">Email</TableCell>
							<TableCell width="20%">Mobile Number</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{Persons.map((person) => {
							const isPersonselected = props.selectedPersons.includes(
								person.id
							);

							return (
								<TableRow
									hover
									key={person.id}
									selected={isPersonselected}
								>
									<TableCell padding="checkbox"
										>
										<Checkbox
											checked={isPersonselected}
											onChange={(event) =>
												props.handleSelectOneperson(event, person.id)
											}
											value={isPersonselected}
										/>
									</TableCell>
									<TableCell>
										<Box
											sx={{
												marginBottom: 1, 
												marginTop: 1,
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
												{getInitials(person.firstName) + getInitials(person.lastName)}
											</Avatar>
											<Box sx={{ ml: 2}}>
												<Typography noWrap>
													{person.firstName} {person.lastName}
												</Typography></Box>
											</Box>
									</TableCell>
									<TableCell>
										<Typography width={180} noWrap>
											{person.role}
										</Typography>
									</TableCell>
									<TableCell>
										<Typography width={190} noWrap>
										{person.email}
										</Typography>
									</TableCell>
									<TableCell>
									<Typography width={190} noWrap>
										+{person.mobile || (
												<SeverityPill color="warning">
													<WarningIcon fontSize="small"
													sx={{ mr: 1 }} />
													No Mobile Number
												</SeverityPill>
											)}
										</Typography>
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

UsersListTable.propTypes = {
	Persons: PropTypes.array.isRequired,
	PersonsCount: PropTypes.number.isRequired,
	onPageChange: PropTypes.func,
	onRowsPerPageChange: PropTypes.func,
	page: PropTypes.number.isRequired,
	rowsPerPage: PropTypes.number.isRequired,
};
