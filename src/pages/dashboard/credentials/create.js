import Head from "next/head";
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { Search } from "../../../icons/search";
import EditIcon from "@mui/icons-material/Edit";
import { ChevronDown as ChevronDownIcon } from "../../../icons/chevron-down";
import StyledMenu from "../../../components/dashboard/styled-menu";
import {
  filterPersonByCredential,
  filterPersonByStringPlaceholder,
  getPersonIdsEditLink,
} from "../../../utils/persons";
import PersonsListTable from "../../../components/dashboard/credentials/create/persons-list-table";
import { useMounted } from "../../../hooks/use-mounted";
import { personApi } from "../../../api/person";
import toast from "react-hot-toast";
import { useCallback, useEffect, useState, useRef } from "react";
import { getCredentialsApi } from "../../../api/credentials";
import { applyPagination, createFilter } from "../../../utils/list-utils";
import NextLink from "next/link";
import { serverDownCode } from "../../../api/api-helpers";
import { ServerDownError } from "../../../components/dashboard/errors/server-down-error";

const applyFilter = createFilter({
  query: filterPersonByCredential,
});

const AddCredentials = () => {
  // fetch info
  const isMounted = useMounted();
  const [persons, setPersons] = useState([]);
  const [serverDownOpen, setServerDownOpen] = useState(false);
  const getInfo = useCallback(async () => {
    try {
      const res = await Promise.all([
        personApi.getPersons(),
        getCredentialsApi(),
      ]);
      const [personRes, credsRes] = res;
      if (personRes.status != 200) {
        if (personRes.status == serverDownCode) {
          setServerDownOpen(true);
        }
        throw "Error loading persons info";
      }
      const personData = await personRes.json();
      if (credsRes.status != 200) {
        setPersons(personData); // at least have persons if credRes fails
        throw "Error loading person credentials";
      }
      const temp = {}; // map personId = { numCredentials: number, cardCredentials: [list of uids] }
      const credData = await credsRes.json();
      Array.isArray(credData) &&
        credData.forEach((cred) => {
          const personId = cred.person.personId;
          if (!(personId in temp))
            temp[personId] = { numCredentials: 0, cardCredentials: [] };
          const person = temp[personId];
          person.numCredentials = (person.numCredentials || 0) + 1;
          if (cred.credType?.credTypeName === "Card")
            person.cardCredentials.push(cred.credUid);
        });
      Array.isArray(personData) &&
        personData.forEach((person) => {
          // transfer info to persons
          const credentials = temp[person.personId];
          if (credentials) {
            person.numCredentials = credentials.numCredentials;
            person.cardCredentials = credentials.cardCredentials;
          }
        });
      console.log(personData);
      setPersons(personData);
    } catch (e) {
      console.error(e);
      toast.error(e);
    }
  }, [isMounted]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(getInfo, []);

  // logic for selection of persons
  const [selectedPersons, setSelectedPersons] = useState([]);
  const selectedAllPersons = selectedPersons.length == persons.length;
  const selectedSomePersons = !selectedAllPersons && selectedPersons.length > 0;
  const handleSelectAllPersons = (e) =>
    setSelectedPersons(e.target.checked ? persons.map((p) => p.personId) : []);
  const handleSelectFactory = (personId) => () => {
    if (selectedPersons.includes(personId))
      setSelectedPersons(selectedPersons.filter((id) => id != personId));
    else setSelectedPersons([...selectedPersons, personId]);
  };

  // logic for query
  const queryRef = useRef(null);
  const [filters, setFilters] = useState({
    query: "",
  });

  const handleQueryChange = (event) => {
    event.preventDefault();
    setPage(0);
    setFilters((prevState) => ({
      ...prevState,
      query: queryRef.current?.value,
    }));
  };

  const filteredPersons = applyFilter(persons, filters);

  // for pagination
  const [page, setPage] = useState(0);
  const handlePageChange = (e, newPage) => setPage(newPage);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const handleRowsPerPageChange = (e) =>
    setRowsPerPage(parseInt(e.target.value, 10));
  const paginatedPersons = applyPagination(filteredPersons, page, rowsPerPage);

  // Edit button
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    console.log(anchorEl)
    }, [anchorEl])

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [buttonBlock, setbuttonBlock] = useState(true);
  useEffect(() => {
    if (selectedPersons.length < 1) {
      setbuttonBlock(true);
    } else {
      setbuttonBlock(false);
    }
  }, [selectedPersons]);

  return (
    <>
      <Head>
        <title>Etlas : Add Credential</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <ServerDownError
          open={serverDownOpen}
          handleDialogClose={() => setServerDownOpen(false)}
        />
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item sx={{ m: 2.5 }}>
                <Typography variant="h4">Select Person(s)</Typography>
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
                <StyledMenu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <NextLink
                    href={getPersonIdsEditLink(selectedPersons)}
                    passHref
                  >
                    <MenuItem disableRipple disabled={buttonBlock}>
                      <EditIcon />
                      &#8288;Edit
                    </MenuItem>
                  </NextLink>
                </StyledMenu>
              </Grid>
            </Grid>
          </Box>
          <Card>
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
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder={filterPersonByStringPlaceholder}
                />
              </Box>
            </Box>
            <PersonsListTable
              persons={paginatedPersons}
              selectedAllPersons={selectedAllPersons}
              selectedSomePersons={selectedSomePersons}
              handleSelectAllPersons={handleSelectAllPersons}
              handleSelectFactory={handleSelectFactory}
              selectedPersons={selectedPersons}
              page={page}
              handlePageChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              handleRowsPerPageChange={handleRowsPerPageChange}
              count={persons.length}
            />
          </Card>
        </Container>
      </Box>
    </>
  );
};

AddCredentials.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default AddCredentials;
