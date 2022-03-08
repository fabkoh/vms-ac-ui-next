import { Add, Delete, Edit, HelpOutline } from "@mui/icons-material";
import { Box, Button, Card, Container, Divider, Grid, InputAdornment, MenuItem, TextField, Tooltip, Typography } from "@mui/material";
import Head from "next/head";
import NextLink from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import entranceApi from "../../../api/entrance";
import accessGroupEntrance from "../../../api/access-group-entrance-n-to-n";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import StyledMenu from "../../../components/dashboard/styled-menu";
import { useMounted } from "../../../hooks/use-mounted";
import { ChevronDown } from "../../../icons/chevron-down";
import { gtm } from "../../../lib/gtm";
import { Upload } from "../../../icons/upload"; 
import { Download } from "../../../icons/download";
import { Search } from "../../../icons/search";
import EntranceListTable from "../../../components/dashboard/entrances/list/entrance-list-table";

const EntranceList = () => {
    // copied
    useEffect(() => {
        gtm.push({ event: "page_view" });
    })
    
    // get entrances and access groups
    const [entrances, setEntrances] = useState([]);
    const isMounted = useMounted();
    const getAccessGroupsLocal = useCallback(async(entrances) => {
        const newEntrances = [ ...entrances ]
        const resArr = await Promise.all(
            newEntrances.map(
                entrance => accessGroupEntrance.getAccessGroupWhereEntranceId(entrance.entranceId)
            )
        );
        const successArr = resArr.map(res => res.status == 200);
        if(successArr.some(success => !success)) { // some res fail
            toast.error("Access groups info failed to load");
        }
        const jsonArr = await Promise.all(resArr.map(res => res.json()));
        newEntrances.forEach((entrance, i) => entrance.accessGroups = successArr[i] ? jsonArr[i] : []);
        if (isMounted()) {
            setEntrances(newEntrances);
        }
    }, [isMounted]);
    const getEntrancesLocal = useCallback(async () => {
        const res = await entranceApi.getEntrances();
        if (res.status != 200) {
            toast.error("Entrances info failed to load");
            return [];
        }
        const data = await res.json();
        if (isMounted()) {
            setEntrances(data);
        }
        return data;
    }, [isMounted]);
    //eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(async () => getAccessGroupsLocal(await getEntrancesLocal()), [])


    // for actions button
    const [actionAnchor, setActionAnchor] = useState(null);
    const open = Boolean(actionAnchor);
    const handleActionClick = (e) => setActionAnchor(e.currentTarget);
    const handleActionClose = () => setActionAnchor(null);
    

    // for selection of checkboxes
    const [selectedEntrances, setSelectedEntrances] = useState([]);
    const selectedAllEntrances = selectedEntrances.length == entrances.length;
    const selectedSomeEntrances = selectedEntrances.length > 0 && !selectedAllEntrances;
    const handleSelectAllEntrances = (e) => setSelectedEntrances(e.target.checked ? entrances.map(e => e.entranceId) : []);
    const handleSelectFactory = (entranceId) => () => {
        if (selectedEntrances.includes(entranceId)) {
            setSelectedEntrances(selectedEntrances.filter(id => id !== entranceId));
        } else {
            setSelectedEntrances([ ...selectedEntrances, entranceId ]);
        }
    }
    return(
        <>
            <Head>
                <title>Etlas: Entrance List</title>
            </Head>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py:8
                }}
            >
                <Container maxWidth="xl">
                    <Box sx={{ mb: 4 }}>
                        <Grid container justifyContent="space-between" spacing={3}>
                            <Grid item sx={{ m: 2.5 }}>
                                <Typography variant="h4">Entrances</Typography>    
                            </Grid>    
                            <Grid item>
                                <Button
                                    endIcon={<ChevronDown fontSize="small" />}
                                    sx={{ m: 2 }}
                                    variant="contained"
                                    onClick={handleActionClick}
                                >
                                    Actions
                                </Button>
                                <StyledMenu
                                    anchorEl={actionAnchor}
                                    open={open}
                                    onClose={handleActionClose}
                                >
                                    <NextLink href={"/dashboard/entrances/create"} passHref>
                                        <MenuItem disableRipple>
                                            <Add />
                                            &#8288;Create
                                        </MenuItem>
                                    </NextLink>
                                    <NextLink href="/">    
                                        <MenuItem disableRipple>
                                            <Edit />
                                            &#8288;Edit
                                        </MenuItem>
                                    </NextLink>
                                    <MenuItem disableRipple>
                                        <Delete />
                                        &#8288;Delete    
                                    </MenuItem>
                                </StyledMenu>
                            </Grid> 
                        </Grid>
                        <Box
                            sx={{
                                m: -1,
                                mt: 3
                            }}
                        >
                            <Button startIcon={<Upload fontSize="small" />} sx={{ m: 1 }}>Import</Button>    
                            <Button startIcon={<Download fontSize="small" />} sx={{ m: 1 }}>Export</Button>
                            <Tooltip
                                title="Excel template can be found at {}"
                                enterTouchDelay={0}
                                placement="top"
                                sx={{
                                    m: -0.5,
                                    mt: 3
                                }}>
                                <HelpOutline />
                            </Tooltip>
                        </Box>
                    </Box>
                    <Card>
                        <Divider />
                        <Box
                            sx={{
                                alignItems: "center",
                                display: "flex",
                                flexWrap: "wrap",
                                m: -1.5,
                                p: 3
                            }}
                        >
                            <Box
                                component="form"
                                // onChange
                                sx={{
                                    flexGrow: 1,
                                    m: 1.5
                                }}    
                            >
                                <TextField
                                    defaultValue=""
                                    fullWidth
                                    inputProps={{ 
                                        // ref: queryRef,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search fontSize="small" />    
                                            </InputAdornment>
                                        )
                                    }}
                                    placeholder="Search for entrance name"
                                />                                   
                            </Box>
                        </Box>
                        <EntranceListTable 
                            entrances={entrances}
                            selectedAllEntrances={selectedAllEntrances}
                            selectedSomeEntrances={selectedSomeEntrances}
                            handleSelectAllEntrances={handleSelectAllEntrances}
                            handleSelectFactory={handleSelectFactory}
                            selectedEntrances={selectedEntrances}
                        />
                    </Card>
                </Container>    
            </Box>
        </>
    )
}

EntranceList.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>{page}</DashboardLayout>
    </AuthGuard>
);

export default EntranceList;