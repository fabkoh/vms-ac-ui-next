import { Box, Checkbox, Table, TableHead, TableCell, TableRow, TableBody, Avatar, Link, Typography, TablePagination } from "@mui/material";
import { getInitials } from "../../../../utils/get-initials";
import { Scrollbar } from "../../../scrollbar";
import NextLink from "next/link";
import { getPersonDetailsLink, getPersonName } from "../../../../utils/persons";
import WarningChip from "../../shared/warning-chip";

const PersonsListTable = ({ persons, selectedAllPersons, selectedSomePersons, handleSelectAllPersons, handleSelectFactory, selectedPersons, page, handlePageChange, rowsPerPage, handleRowsPerPageChange, count, ...other }) => {
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
                            <TableCell>No. of Credentials</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { 
                            persons.map(person => {
                                const {
                                    personId,
                                    personFirstName,
                                    personLastName,
                                    personUid,
                                    personMobileNumber,
                                    personEmail,
                                    numCredentials
                                } = person;
                                const isPersonSelected = selectedPersons.includes(personId);
                                const numCred = numCredentials || 0;
                                const handleSelect = handleSelectFactory(personId);

                                return (
                                    <TableRow
                                        hover
                                        key={personId}
                                        selected={isPersonSelected}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={isPersonSelected}
                                                onChange={handleSelect}
                                                value={isPersonSelected}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box
                                                sx={{
                                                    m: 1,
                                                    alignItems: 'center',
                                                    display: 'flex'
                                                }}
                                            >
                                                <Avatar
                                                    src={person.avatar}
                                                    sx={{
                                                        height: 42,
                                                        width: 42
                                                    }}
                                                >
                                                    { getInitials(personFirstName) + getInitials(personLastName) }
                                                </Avatar>
                                                <Box
                                                    sx={{
                                                        ml: 1,
                                                        width: 100
                                                    }}
                                                >
                                                    <NextLink
                                                        href={getPersonDetailsLink(person)}
                                                        passHref
                                                    >
                                                        <Link
                                                            color="inherit"
                                                            variant="subtitle2"
                                                        >
                                                            <Typography noWrap>
                                                                { getPersonName(person) }
                                                            </Typography>
                                                        </Link>
                                                    </NextLink>
                                                    <Typography
                                                        color="textSecondary"
                                                        variant="body2"
                                                        noWrap
                                                    >
                                                        UID: { personUid }
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography width={180} noWrap>
                                                { 
                                                    personMobileNumber || (
                                                        <WarningChip text="No mobile number" />
                                                    )
                                                }
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {
                                                personEmail || (
                                                    <WarningChip text="No email" />
                                                )
                                            }
                                        </TableCell>
                                        <TableCell>
                                            { numCred }
                                        </TableCell>
                                    </TableRow>
                                )
                            }) 
                        }
                    </TableBody>
                </Table>
            </Scrollbar>
            <TablePagination
                component="div"
                count={count}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </div>
    )
}

export default PersonsListTable;