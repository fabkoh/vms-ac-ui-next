import Head from "next/head";
import { Box, Button, Card, Container, Grid, InputAdornment, TextField, Typography } from "@mui/material";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { Search } from "../../../icons/search";
import { filterPersonByString, filterPersonByStringPlaceholder, getPersonIdsEditLink } from "../../../utils/persons";
import PersonsListTable from "../../../components/dashboard/credentials/create/persons-list-table";
import { useMounted } from "../../../hooks/use-mounted";
import { personApi } from "../../../api/person";
import toast from "react-hot-toast";
import { useCallback, useEffect, useState, useRef } from "react";
import { getCredentialsApi } from "../../../api/credentials";
import { applyPagination, createFilter } from "../../../utils/list-utils";
import NextLink from "next/link";

const applyFilter = createFilter({
    query: filterPersonByString
})

const AddCredentials = () => {

    // fetch info 
    const isMounted = useMounted();
    const [persons, setPersons] = useState([]);
    const [credentialNumbers, setCredentialNumbers] = useState({});

    const getCredentialsInfo = async () => {
        try {
            const res = await getCredentialsApi();
            if (res.status != 200) throw new Error("Credential info not loaded");
            const data = await res.json();
            const info = {}; // map personId to number of credentials;
            data.forEach(cred => {
                const personId = cred.person.personId;
                info[personId] = (info[personId] || 0) + 1
            })
            setCredentialNumbers(info);
        } catch(err) {
            console.error(err);
            toast.error("Credential info not loaded");
        }
    };

    const getPersonsInfo = async () => {
        try {
            const res = await personApi.getPersons();
            if (res.status != 200) throw new Error("Persons info not loaded");
            const data = await res.json();
            setPersons(data);
        } catch(err) {
            console.error(err);
            toast.error("Persons info not loaded");
        }
    }

    const getInfo = useCallback(() => {
        getPersonsInfo();
        getCredentialsInfo();
    }, [isMounted]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(getInfo, []);
    
    // logic for selection of persons
    const [selectedPersons, setSelectedPersons] = useState([]);
    const selectedAllPersons = selectedPersons.length == persons.length;
    const selectedSomePersons = !selectedAllPersons && selectedPersons.length > 0;
    const handleSelectAllPersons = (e) => setSelectedPersons(e.target.checked ? persons.map(p => p.personId) : []);
    const handleSelectFactory = (personId) => () => {
        if(selectedPersons.includes(personId)) setSelectedPersons(selectedPersons.filter(id => id != personId));
        else setSelectedPersons([ ...selectedPersons, personId ]);
    }

    // logic for query
    const queryRef = useRef(null);
    const [filters, setFilters] = useState({
        query: "",
    })

    const handleQueryChange = (event) => {
        event.preventDefault();
        setFilters((prevState) => ({
            ...prevState,
            query: queryRef.current?.value
        }))
    }

    const filteredPersons = applyFilter(persons, filters);

    // for pagination
    const [page, setPage] = useState(0);
    const handlePageChange = (e, newPage) => setPage(newPage);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const handleRowsPerPageChange = (e) => setRowsPerPage(parseInt(e.target.value, 10));
    const paginatedPersons = applyPagination(filteredPersons, page, rowsPerPage);

    // next button logic
    const nextDisabled = selectedPersons.length == 0;

    return (
        <>
            <Head><title>Etlas : Add Credential</title></Head>
            <Box 
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8
                }}
            >
                <Container maxWidth="xl">
                    <Box sx={{ mb: 4 }}>
                        <Grid container justifyContent="space-between" spacing={3}>
                            <Grid item sx={{m:2.5}}>
                                <Typography variant="h4">Select Person(s)</Typography>
                            </Grid>
                            <Grid item>
                                <Box
                                display="flex"
                                justifyContent="flex-end"
                                mb={5}
                                mt={2}
                                >
                                    <NextLink
                                        href={getPersonIdsEditLink(selectedPersons)}
                                        passHref
                                    >
                                        <Button
                                            variant="contained"
                                            disabled={nextDisabled}
                                        >
                                            next
                                        </Button>
                                    </NextLink>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                    <Card>
                        <Box
                            sx={{
                                alignItems: 'center',
                                display: 'flex',
                                flexWrap: 'wrap',
                                m: -1.5,
                                p: 3
                            }}
                        >
                            <Box
                                component="form"
                                onChange={handleQueryChange}
                                sx={{
                                    flexGrow: 1,
                                    m: 1.5
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
                                        )
                                    }}
                                    placeholder={filterPersonByStringPlaceholder}
                                />
                            </Box>
                        </Box>
                        <PersonsListTable 
                            persons={paginatedPersons}
                            credentialNumbers={credentialNumbers}
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
    )
}

AddCredentials.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>{page}</DashboardLayout>
    </AuthGuard>
);

export default AddCredentials;