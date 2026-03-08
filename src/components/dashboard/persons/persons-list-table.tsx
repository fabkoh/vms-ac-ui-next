// @ts-nocheck
import { useMemo } from "react";
import { useEffect, useState } from "react";
import NextLink from "next/link";
import PropTypes from "prop-types";
import {
  Box,
  Checkbox,
  Chip,
  IconButton,
  Link,
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
import { Scrollbar } from "../../scrollbar";
import { SeverityPill } from "../../severity-pill";
import WarningIcon from "@mui/icons-material/Warning";
import { ListFilter } from "../shared/list-filter";
import {
  getPersonDetailsLink,
  getPersonName,
  getPersonsEditLink,
} from "../../../utils/persons";

export const PersonsListTable = (props) => {
  const {
    Persons = [],
    PersonsCount,
    onPageChange,
    onRowsPerPageChange,
    page,
    rowsPerPage,
    accessGroupNames = [],
    handleAccessGroupFilter,
    // Destructured missing props used in the JSX
    selectedPersons = [],
    selectedAllPersons,
    selectedSomePersons,
    handleSelectAllPersons,
    handleSelectOneperson,
    ...other
  } = props;

  // Optimized: Derive the filter list from props instead of using useEffect
  const accessGroupFilter = useMemo(
    () => accessGroupNames.map((ag) => ag.name),
    [accessGroupNames]
  );

  // Note: Reversing inside render affects every re-render. 
  // Ensure your backend pagination accounts for this order.
  const reversedPersons = useMemo(() => [...Persons].reverse(), [Persons]);

  return (
    <div {...other}>
      <Scrollbar>
        <Table sx={{ minWidth: 700 }}>
          <TableHead sx={{ backgroundColor: "neutral.200" }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedAllPersons}
                  indeterminate={selectedSomePersons}
                  onChange={handleSelectAllPersons}
                />
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Mobile number</TableCell>
              <TableCell>Email</TableCell>
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
              const isPersonSelected = selectedPersons.includes(person.personId);

              return (
                <TableRow
                  hover
                  key={person.personId}
                  selected={isPersonSelected}
                >
                  <TableCell padding="checkbox" width="10%">
                    <Checkbox
                      checked={isPersonSelected}
                      onChange={(event) =>
                        handleSelectOneperson(event, person.personId)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ alignItems: "center", display: "flex", my: 1 }}>
                      <Box sx={{ ml: 1, width: 100 }}>
                        <Link
                          component={NextLink}
                          href={getPersonDetailsLink(person)}
                          color="inherit"
                          variant="subtitle2"
                          underline="hover"
                        >
                          <Typography noWrap variant="subtitle2">
                            {getPersonName(person)}
                          </Typography>
                        </Link>
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
                    {person.personMobileNumber ? (
                      <Typography noWrap>{person.personMobileNumber}</Typography>
                    ) : (
                      <SeverityPill color="warning">
                        <WarningIcon fontSize="small" sx={{ mr: 1 }} />
                        No mobile
                      </SeverityPill>
                    )}
                  </TableCell>
                  <TableCell width="20%">
                    {person.personEmail ? (
                      <Typography noWrap>{person.personEmail}</Typography>
                    ) : (
                      <SeverityPill color="warning">
                        <WarningIcon fontSize="small" sx={{ mr: 1 }} />
                        No email
                      </SeverityPill>
                    )}
                  </TableCell>
                  <TableCell width="20%">
                    {person.accessGroup ? (
                      <Chip
                        component={NextLink}
                        href={`/dashboard/access-groups/details/${person.accessGroup.accessGroupId}`}
                        label={person.accessGroup.accessGroupName}
                        color={person.accessGroup.isActive ? "success" : "error"}
                        clickable
                        sx={{ fontSize: "12px", fontWeight: 600 }}
                      />
                    ) : (
                      <SeverityPill color="warning">
                        <WarningIcon fontSize="small" sx={{ mr: 1 }} />
                        No Group
                      </SeverityPill>
                    )}
                  </TableCell>
                  <TableCell width="10%" align="left">
                    <IconButton
                      component={NextLink}
                      href={getPersonsEditLink([person])}
                    >
                      <PencilAltIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      component={NextLink}
                      href={getPersonDetailsLink(person)}
                    >
                      <ArrowRightIcon fontSize="small" />
                    </IconButton>
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
  selectedPersons: PropTypes.array,
  selectedAllPersons: PropTypes.bool,
  selectedSomePersons: PropTypes.bool,
  handleSelectAllPersons: PropTypes.func,
  handleSelectOneperson: PropTypes.func,
  accessGroupNames: PropTypes.array,
  handleAccessGroupFilter: PropTypes.func,
};