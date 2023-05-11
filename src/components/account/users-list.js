import * as React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import Head from "next/head";
import NextLink from "next/link";
import router, { useRouter } from "next/router";
import { CSVLink } from "react-csv";
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import { UsersListTable } from "../account/users-list-table";
import { useMounted } from "../../hooks/use-mounted";
import { Download as DownloadIcon } from "../../icons/download";
import { Plus as PlusIcon } from "../../icons/plus";
import { Search as SearchIcon } from "../../icons/search";
import { Upload as UploadIcon } from "../../icons/upload";
import { gtm } from "../../lib/gtm";
import StyledMenu from "../../components/dashboard/styled-menu";
import { ChevronDown as ChevronDownIcon } from "../../icons/chevron-down";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { personApi } from "../../api/person";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Tooltip from "@mui/material/Tooltip";
import { Confirmdelete } from "../../components/dashboard/persons/confirm-delete";
import toast from "react-hot-toast";
import { createFilter } from "../../utils/list-utils";
import { userCreateLink, filterUserByString } from "../../utils/users";
import { ServerDownError } from "../../components/dashboard/errors/server-down-error";
import { serverDownCode } from "../../api/api-helpers";
import {
  authDeleteTechAdmin,
  authGetAccounts,
  authDeleteUserAdmin,
  authSignUp,
} from "../../api/auth-api";

export const UsersList = () => {
  const headers = [
    { label: "First Name", key: "firstName" },
    { label: "Last Name", key: "lastName" },
    { label: "Email", key: "email" },
    { label: "Mobile Number", key: "mobile" },
    { label: "Role", key: "role" },
  ];

  const headersTemplate = [
    { label: "First Name", key: "firstName" },
    { label: "Last Name", key: "lastName" },
    { label: "Email", key: "email" },
    { label: "Mobile Number", key: "mobile" },
    { label: "Password", key: "password" },
    { label: "Role", key: "role" },
    { label: " ", key: " " },
  ];

  const fileReader = new FileReader();

  const createPerson = async (person) => {
    // console.log(person);
    const userSettings = {
      firstName: person.personFirstName,
      lastName: person.personLastName,
      email: person.personEmail,
      password: person.personPassword,
      role: person.personRole,
      mobile: person.personMobileNumber,
    };
    try {
      const res = await authSignUp(userSettings);
      // console.log(res)
      if (res.type != "success") {
        throw new Error("Unable to register User");
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      getPersonsLocal();
    }
  };

  const submitForm = async (personsInfo) => {
    // send res
    // TODO: Add validation to credentials here and some error handling
    // console.log(personsInfo);
    try {
      const boolArr = await Promise.all(
        personsInfo.map((p) => createPerson(p))
      );

      // success toast
      const numSuccess = boolArr.filter((b) => b).length;
      if (numSuccess) {
        toast.success(`Successfully created ${numSuccess} users`);
      }

      // if some failed
      if (boolArr.some((b) => !b)) {
        toast.error("Unable to create users below");
        // filter failed personsInfo and personsValidation
      } else {
        // all success
      }
    } catch (e) {
      console.log("error", e);
      toast.error("Unable to create users");
    } finally {
      getPersonsLocal();
    }
  };

  const csvFileToArray = (string) => {
    const csvHeader = string.slice(0, string.indexOf("\n")).split(",");
    const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");

    const array = csvRows.map((i) => {
      const values = i.split(",");
      const obj = csvHeader.reduce((object, header, index) => {
        object[header] = values[index];
        return object;
      }, {});
      return obj;
    });
    submitForm(
      array.map((person, index) => {
        // console.log(person, 22);
        return {
          personId: index,
          personFirstName: person["First Name"],
          personLastName: person["Last Name"],
          personEmail: person["Email"],
          personMobileNumber: person["Mobile Number"],
          personRole: [person["Role"]],
          personPassword: person["Password"],
        };
      })
    );
  };

  const handleOnChange = (e) => {
    let file = e.target.files[0];
    if (file) {
      fileReader.onload = function (event) {
        const text = event.target.result;
        csvFileToArray(text);
      };

      fileReader.readAsText(file);
    }
    // to reset the input value otherwise uploading the same file won't trigger the onchange function
    e.target.value = null;
  };

  const isMounted = useMounted();
  const queryRef = useRef(null);

  const sortOptions = [
    {
      label: "Last update (newest)",
      value: "updatedAt|desc",
    },
    {
      label: "Last update (oldest)",
      value: "updatedAt|asc",
    },
    {
      label: "Total orders (highest)",
      value: "orders|desc",
    },
    {
      label: "Total orders (lowest)",
      value: "orders|asc",
    },
  ];

  const applyFilter = createFilter({
    query: filterUserByString,
  });

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }

    if (b[orderBy] > a[orderBy]) {
      return 1;
    }

    return 0;
  };

  const getComparator = (order, orderBy) =>
    order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);

  const applySort = (Persons, sort) => {
    const [orderBy, order] = sort.split("|");
    const comparator = getComparator(order, orderBy);
    const stabilizedThis = Persons.map((el, index) => [el, index]);

    stabilizedThis.sort((a, b) => {
      const newOrder = comparator(a[0], b[0]);

      if (newOrder !== 0) {
        return newOrder;
      }

      return a[1] - b[1];
    });

    return stabilizedThis.map((el) => el[0]);
  };

  const applyPagination = (Persons, page, rowsPerPage) =>
    Persons.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const [Persons, setPersons] = useState([]);
  // const [currentTab, setCurrentTab] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sort, setSort] = useState(sortOptions[0].value);
  const [filters, setFilters] = useState({
    query: "",
  });

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const getPersonsLocal = useCallback(async () => {
    try {
      const res = await authGetAccounts();
      if (res.type == "success") {
        const body = res.response;
        const newList = [];
        for (const role of Object.keys(body)) {
          for (const user of body[role]) {
            user["role"] = role;
            newList.push(user);
          }
        }
        setPersons(newList);
      } else {
        if (res.status == serverDownCode) {
          setServerDownOpen(true);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }, [isMounted]);

  useEffect(
    () => {
      getPersonsLocal();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleQueryChange = (event) => {
    event.preventDefault();
    setFilters((prevState) => ({
      ...prevState,
      query: queryRef.current?.value,
    }));
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  // Usually query is done on backend with indexing solutions
  const filteredPersons = applyFilter(Persons, filters);
  const sortedPersons = applySort(filteredPersons, sort);
  const paginatedPersons = applyPagination(sortedPersons, page, rowsPerPage);

  //for actions button
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  //for persons-list-table
  const [selectedPersons, setSelectedPersons] = useState([]);
  const handleSelectAllPersons = (event) => {
    setSelectedPersons(
      event.target.checked ? Persons.map((person) => person.id) : []
    );
  };

  const handleSelectOneperson = (event, userId) => {
    if (!selectedPersons.includes(userId)) {
      setSelectedPersons((prevSelected) => [...prevSelected, userId]);
    } else {
      setSelectedPersons((prevSelected) =>
        prevSelected.filter((id) => id !== userId)
      );
    }
  };

  const enableBulkActions = selectedPersons.length > 0;
  const selectedSomePersons =
    selectedPersons.length > 0 && selectedPersons.length < Persons.length;
  const selectedAllPersons = selectedPersons.length === Persons.length;

  // Reset selected Persons when Persons change
  useEffect(
    () => {
      if (selectedPersons.length) {
        setSelectedPersons([]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Persons]
  );

  //for delete action button: opens the delete form
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [serverDownOpen, setServerDownOpen] = React.useState(false);

  //Set to true if multiple people are selected. controls form input visibility.
  const [selectedState, setselectedState] = useState(false);
  const checkSelected = () => {
    if (selectedPersons.length == 1) {
      setselectedState(false);
    } else {
      setselectedState(true);
    }
  };
  useEffect(() => {
    checkSelected();
  }, [selectedPersons]);

  const handleDeleteOpen = () => {
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => {
    setDeleteOpen(false);
  };

  const deleteHelper = async (id) => {
    try {
      const res = await authDeleteUserAdmin(id);
      if (res.status != 200) {
        const restwo = await authDeleteTechAdmin(id);
        if (restwo.status == 200) {
          return restwo;
        }
      }
      return res;
    } catch (err) {
      console.log(err);
      return "fail";
    }
  };
  const deletePersons = async (e) => {
    e.preventDefault();
    Promise.all(
      selectedPersons.map((id) => {
        return deleteHelper(id);
      })
    ).then((resArr) => {
      resArr.filter((res) => {
        if (res.status == 200) {
          toast.success("Delete success", { duration: 2000 });
        } else {
          toast.error("Delete unsuccessful");
        }
      });
      getPersonsLocal();
    });
    setDeleteOpen(false);
  };

  //blank out edit and delete if no people selected
  const [buttonBlock, setbuttonBlock] = useState(true);
  useEffect(() => {
    if (selectedPersons.length < 1) {
      setbuttonBlock(true);
    } else {
      setbuttonBlock(false);
    }
  }, [selectedPersons]);

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
      }}
    >
      <Container maxWidth="xl">
        <ServerDownError
          open={serverDownOpen}
          handleDialogClose={() => setServerDownOpen(false)}
        />
        <Box sx={{ mb: 4 }}>
          <Grid container justifyContent="space-between" spacing={3}>
            {/* <Grid item>
              <Button
                component="label"
                startIcon={<UploadIcon fontSize="small" />}
                sx={{ m: 1 }}
              >
                <input
                  type={"file"}
                  id={"csvFileInput"}
                  accept={".csv"}
                  onChange={handleOnChange}
                  hidden
                />
                Import
              </Button>
              <CSVLink
                style={{ textDecoration: "none" }}
                data={filteredPersons.map((person) => {
                  return {
                    firstName: person.firstName,
                    lastName: person.lastName,
                    mobile: person.mobile || "No mobile number",
                    email: person.email || "No email or email",
                    role: person.role,
                  };
                })}
                headers={headers}
                filename={"Users.csv"}
              >
                <Button
                  startIcon={<DownloadIcon fontSize="small" />}
                  sx={{ m: 1 }}
                >
                  Export
                </Button>
              </CSVLink>
              <CSVLink
                style={{ textDecoration: "none" }}
                data={[]}
                headers={headersTemplate}
                filename={"UsersTemplate.csv"}
              >
                <Button sx={{ m: 1 }}>Download Import Template</Button>
              </CSVLink>
              <Tooltip
                title="Excel template can be found at {}"
                enterTouchDelay={0}
                placement="top"
                sx={{
                  m: -0.5,
                  mt: 3,
                }}
              >
                <HelpOutlineIcon />
              </Tooltip>
            </Grid> */}
            <Grid item xs={8}>
            <Typography sx={[{ mx: 3 }, { mb: 6 }, { mt: 3 }]}>
            This section shows you the list of all user accounts that you are
            able to manage. This does not pertain to Persons.
            </Typography>
            </Grid>
            <Grid item>
              <Button
                endIcon={<ChevronDownIcon fontSize="small" />}
                sx={{ m: 2 }}
                variant="contained"
                onClick={handleClick}
              >
                Actions
              </Button>
              <StyledMenu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <NextLink href={userCreateLink} passHref>
                  <MenuItem disableRipple>
                    <AddIcon />
                    &#8288;Create
                  </MenuItem>
                </NextLink>
                <MenuItem
                  disableRipple
                  onClick={handleDeleteOpen}
                  disabled={buttonBlock}
                >
                  <DeleteIcon />
                  &#8288;Delete
                </MenuItem>
                <Confirmdelete
                  selectedState={selectedState}
                  open={deleteOpen}
                  handleDialogClose={handleDeleteClose}
                  selectedPersons={selectedPersons}
                  deletePersons={deletePersons}
                  setAnchorEl={setAnchorEl}
                />
              </StyledMenu>
            </Grid>
          </Grid>
        </Box>
        <Card>
          <Divider />
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
              flexWrap: "wrap",
              m: -1.5,
              p: 3,
            }}
          >
            <Box
              component="form"
              onChange={handleQueryChange}
              sx={{
                flexGrow: 1,
                m: 1.5,
              }}
            >
              <TextField
                defaultValue=""
                fullWidth
                inputProps={{ ref: queryRef }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                placeholder="Search for System User by Name, Role, Email or Mobile Number"
              />
            </Box>
          </Box>
          <UsersListTable
            enableBulkActions={enableBulkActions}
            selectedAllPersons={selectedAllPersons}
            selectedPersons={selectedPersons}
            selectedSomePersons={selectedSomePersons}
            handleSelectAllPersons={handleSelectAllPersons}
            handleSelectOneperson={handleSelectOneperson}
            Persons={paginatedPersons}
            PersonsCount={filteredPersons.length}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPage={rowsPerPage}
            page={page}
          />
        </Card>
      </Container>
    </Box>
  );
};
