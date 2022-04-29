import { BuildCircle, Delete, HelpOutline, Refresh, Search } from "@mui/icons-material";
import { Box, Button, Card, Container, Divider, Grid, IconButton, InputAdornment, MenuItem, TextField, Tooltip, Typography } from "@mui/material";
import Head from "next/head"
import { useCallback, useEffect, useRef, useState } from "react";
import { AuthGuard } from "../../../components/authentication/auth-guard"
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout"
import StyledMenu from "../../../components/dashboard/styled-menu";
import { ChevronDown } from "../../../icons/chevron-down";
import { Upload } from "../../../icons/upload"; 
import { Download } from "../../../icons/download";
import ControllerListTable from "../../../components/dashboard/controllers/list/controller-list";
import { applyPagination, createFilter } from "../../../utils/list-utils";
import { filterControllerByString, filterControllerByStringPlaceholder } from "../../../utils/controller";
import { gtm } from "../../../lib/gtm";
import { useMounted } from "../../../hooks/use-mounted";
import { controllerApi } from "../../../api/controllers";
import toast from "react-hot-toast";

const applyFilter = createFilter({
    query: filterControllerByString
})

const resToJsonHelper = res => {
    if (res.status == 200) {
        return res.json();
    }
    return Promise.resolve({});
}

const ControllerList = () => {

    // copied
    useEffect(() => {
        gtm.push({ event: "page_view" });
    })

    // for actions button
    const [actionAnchor, setActionAnchor] = useState(null);
    const actionOpen = Boolean(actionAnchor);
    const handleActionClick = (e) => setActionAnchor(e.currentTarget);
    const handleActionClose = () => setActionAnchor(null);

    // data
    const [controllers, setControllers] = useState([]);
    const [controllersStatus, setControllersStatus] = useState(null);
    const isMounted = useMounted();

    const getInfo = useCallback(async() => {
        const controllersRes = await controllerApi.getControllers();
        if (controllersRes.status !== 200) {
            toast.error("Controllers not loaded");
            return;
        }
        const controllersJson = await controllersRes.json();
        if (isMounted()){
            setControllers(controllersJson);
        }

        const statusResArr = await Promise.all(controllersJson.map(c => controllerApi.getAuthStatus(c.controllerId)));
        const statusJsonArr = await Promise.all(statusResArr.map(res => resToJsonHelper(res)));
        if (isMounted()) {
            setControllersStatus(statusJsonArr);
        }
    }, [isMounted]);

    //eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => getInfo(), [])

    // for selection of checkboxes
    const [selectedControllers, setSelectedControllers] = useState([]); // stores the ids of selected
    const selectedAllControllers = selectedControllers.length == controllers.length;
    const selectedSomeControllers = selectedControllers.length > 0 && !selectedAllControllers;
    const handleSelectAllControllers = (e) => setSelectedControllers(e.target.checked ? controllers.map(c => c.controllerId) : []);
    const handleSelectFactory = (controllerId) => () => {
        if (selectedControllers.includes(controllerId)) {
            setSelectedControllers(selectedControllers.filter(id => id !== controllerId))
        } else {
            setSelectedControllers([ ...selectedControllers, controllerId ]);
        }
    }

    // for filtering
    const [filters, setFilters] = useState({
        query: ""
    });
    const queryRef = useRef(null);
    const handleQueryChange = (e) => {
        e.preventDefault();
        setFilters((prevState) => ({
            ...prevState,
            query: queryRef.current?.value
        }));
    };
    const filteredControllers = applyFilter(controllers, filters);

    // for pagination
    const [page, setPage] = useState(0);
    const handlePageChange = (e, newPage) => setPage(newPage);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const handleRowsPerPageChange = (e) => setRowsPerPage(parseInt(e.target.value, 10));
    const paginatedControllers = applyPagination(filteredControllers, page, rowsPerPage);
    const controllerCount = filteredControllers.length;

    return (
        <>
            <Head>
                <title>Etlas: Controller List</title>
            </Head>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8
                }}
            >
                <Container maxWidth="xl">
                    <Box sx={{ mb: 4 }}>
                        <Grid
                            container
                            justifyContent="space-between"
                            spacing={3}
                        >
                            <Grid
                                item
                                sx={{ m: 2.5 }}
                            >
                                <Typography variant="h4">Controllers</Typography>
                            </Grid>
                            <Grid item>
                                <IconButton>
                                    <Refresh />
                                </IconButton>
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
                                    open={actionOpen}
                                    onClose={handleActionClose}
                                >
                                    <MenuItem
                                        disableRipple
                                        // disabled
                                        // onClick
                                    >
                                        <Delete />
                                        &#8288;Delete
                                    </MenuItem>
                                    <MenuItem
                                        disableRipple
                                        // disabled
                                        // onClick
                                    >
                                        <BuildCircle />
                                        &#8288;Reset
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
                            <Button
                                startIcon={<Upload fontSize="small" />}
                                sx={{ m: 1 }}
                            >
                                Import
                            </Button>
                            <Button
                                startIcon={<Download fontSize="small" />}
                                sx={{ m: 1 }}
                            >
                                Export
                            </Button>
                            <Tooltip
                                title="Excel template can be found at {}"
                                enterTouchDelay={0}
                                placement="top"
                                sx={{
                                    m: -0.5,
                                    mt: 3
                                }}
                            >
                                <HelpOutline />
                            </Tooltip>
                        </Box>
                    </Box>
                    <Card>
                        <Divider />
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
                                onChange={handleQueryChange}
                                sx={{
                                    flexGrow: 1,
                                    m: 1.5
                                }}
                                onSubmit={(e) => e.preventDefault()}
                            >
                                <TextField
                                    defaultValue=""
                                    fullWidth
                                    inputProps={{
                                        ref: queryRef
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search fontSize="small" />
                                            </InputAdornment>
                                        )
                                    }}
                                    placeholder={filterControllerByStringPlaceholder}
                                />
                            </Box>
                        </Box>
                        <ControllerListTable 
                            controllers={paginatedControllers}
                            selectedAllControllers={selectedAllControllers}
                            selectedSomeControllers={selectedSomeControllers}
                            handleSelectAllControllers={handleSelectAllControllers}
                            handleSelectFactory={handleSelectFactory}
                            selectedControllers={selectedControllers}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            onPageChange={handlePageChange}
                            onRowsPerPageChange={handleRowsPerPageChange}
                            controllerCount={controllerCount}
                            controllersStatus={controllersStatus}
                        />
                    </Card>
                </Container>
            </Box>
        </>
    );
}

ControllerList.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>{page}</DashboardLayout>
    </AuthGuard>
);

export default ControllerList;