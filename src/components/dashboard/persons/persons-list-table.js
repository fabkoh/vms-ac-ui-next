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
import WarningIcon from "@mui/icons-material/Warning";
import { useRouter } from "next/router";
import { width } from "@mui/system";
import { ListFilter } from "../shared/list-filter";
import {
  getPersonDetailsLink,
  getPersonName,
  getPersonsEditLink,
} from "../../../utils/persons";

export const PersonsListTable = (props) => {
  const {
    Persons,
    PersonsCount,
    onPageChange,
    onRowsPerPageChange,
    page,
    rowsPerPage,
    accessGroupNames,
    handleAccessGroupFilter,
    ...other
  } = props;

  const [accessGroupFilter, setAccessGroupFilter] = useState([]);
  useEffect(() => {
    setAccessGroupFilter(accessGroupNames.map((ag) => ag.name));
  }, [accessGroupNames]);
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
  const reversedPersons = Persons.slice().reverse();

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
            sx={{ backgroundColor: "neutral.200" }}
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
                <ListFilter
                  array={accessGroupFilter}
                  onSelect={handleAccessGroupFilter}
                  defaultLabel="ACCESS GROUP"
                />
              </TableCell>
              <TableCell align="left">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reversedPersons.map((person) => {
              const isPersonselected = props.selectedPersons.includes(
                person.personId
              );

              return (
                <TableRow
                  hover
                  key={person.personId}
                  selected={isPersonselected}
                >
                  <TableCell padding="checkbox" width="10%">
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
                        {getInitials(person.personFirstName) +
                          getInitials(person.personLastName)}
                      </Avatar>
                      <Box sx={{ ml: 1, width: 100 }}>
                        <NextLink href={getPersonDetailsLink(person)} passHref>
                          <Link color="inherit" variant="subtitle2">
                            <Typography noWrap>
                              {getPersonName(person)}
                            </Typography>
                          </Link>
                        </NextLink>
                        <Typography
                          color="textSecondary"
                          variant="body2"
                          noWrap
                        >
                          UID: {person.personUid}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell width="20%">
                    <Typography width={180} noWrap>
                      {person.personMobileNumber || (
                        <SeverityPill color="warning">
                          <WarningIcon fontSize="small" sx={{ mr: 1 }} />
                          No mobile number
                        </SeverityPill>
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell width="20%">
                    <Typography width={190} noWrap>
                      {person.personEmail || (
                        <SeverityPill color="warning">
                          <WarningIcon fontSize="small" sx={{ mr: 1 }} />
                          No email
                        </SeverityPill>
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell width="20%">
                    {person.accessGroup ? (
                      <NextLink
                        href={`/dashboard/access-groups/details/${person.accessGroup.accessGroupId}`}
                        passHref
                      >
                        <Chip
                          label={person.accessGroup.accessGroupName}
                          color={
                            person.accessGroup.isActive ? "success" : "error"
                          }
                          sx={{
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        />
                        {/* <Link>
                          <Typography width={190} noWrap>
                            {person.accessGroup.accessGroupName}
                          </Typography>
                        </Link> */}
                      </NextLink>
                    ) : (
                      <SeverityPill color="warning">
                        <WarningIcon fontSize="small" sx={{ mr: 1 }} />
                        No access Group
                      </SeverityPill>
                    )}
                  </TableCell>

                  {/* <TableCell>
                    <Typography
                      color="success.main"
                      variant="subtitle2"
                    >
                      {numeral(person.totalAmountSpent).format(`${person.currency}0,0.00`)}
                    </Typography>
                  </TableCell> */}
                  <TableCell width="10%" align="left">
                    <NextLink href={getPersonsEditLink([person])} passHref>
                      <IconButton component="a">
                        <PencilAltIcon fontSize="small" />
                      </IconButton>
                    </NextLink>
                    <NextLink href={getPersonDetailsLink(person)} passHref>
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
