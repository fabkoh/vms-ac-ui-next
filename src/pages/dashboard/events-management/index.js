import {
  Add,
  Delete,
  DoorFront,
  Edit,
  HelpOutline,
  LockOpen,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Head from "next/head";
import NextLink from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import StyledMenu from "../../../components/dashboard/styled-menu";
import { useMounted } from "../../../hooks/use-mounted";
import { ChevronDown } from "../../../icons/chevron-down";
import { gtm } from "../../../lib/gtm";
import { Upload } from "../../../icons/upload";
import { Download } from "../../../icons/download";
import { Search } from "../../../icons/search";
import { applyPagination, createFilter } from "../../../utils/list-utils";
import ConfirmStatusUpdate from "../../../components/dashboard/entrances/list/confirm-status-update";
import { Confirmdelete } from "../../../components/dashboard/events-management/confirm-delete";
import {
  filterEventsManagementByStringPlaceholder,
  filterEventsManagementByString,
  eventsManagementCreateLink,
} from "../../../utils/eventsManagement";
import { eventsManagementApi } from "../../../api/events-management";
import notificationConfigApi from "../../../api/notifications-config";
import EventsManagementTable from "../../../components/dashboard/events-management/list/events-management-table";
import { serverDownCode } from "../../../api/api-helpers";
import { ServerDownError } from "../../../components/dashboard/errors/server-down-error";
import { notificationsApi } from "../../../api/notifications";

const applyFilter = createFilter({
  query: filterEventsManagementByString,
});

const EventsManagementList = () => {
  const isMounted = useMounted();
  const [eventsManagement, setEventsManagement] = useState([]);
  const [serverDownOpen, setServerDownOpen] = useState(false);
  const [smsConfig, setSMSConfig] = useState({});
  const [emailConfig, setEmailConfig] = useState({});

  const getSMSEmailConfig = useCallback(async () => {
    const smsNotificationConfig = await notificationsApi.getSMSSettings();
    const emailNotificationConfig = await notificationsApi.getEmailSettings();
    if (smsNotificationConfig.status !== 200) {
      toast.error("Error loading SMS config");
      setSMSConfig({});
      if (smsNotificationConfig.status == serverDownCode) {
        setServerDownOpen(true);
      }
    }
    if (emailNotificationConfig.status !== 200) {
      toast.error("Error loading email config");
      setEmailConfig({});
      if (emailNotificationConfig.status == serverDownCode) {
        setServerDownOpen(true);
      }
      return;
    }
    const smsConfigJson = await smsNotificationConfig.json();
    const emailConfigJson = await emailNotificationConfig.json();
    if (isMounted()) {
      setSMSConfig(smsConfigJson);
      setEmailConfig(emailConfigJson);
    }
  }, [isMounted]);
  const getEventManagements = useCallback(async () => {
    try {
      const eventManagements =
        await eventsManagementApi.getAllEventsManagement();

      if (eventManagements.status == 200) {
        const body = await eventManagements.json();
        if (isMounted()) {
          setEventsManagement(body);
          console.log(body);
        }
      } else {
        toast.error("Error loading event managements");
        setEventsManagement([]);
        if (eventManagements.status == serverDownCode) {
          setServerDownOpen(true);
        }
      }
    } catch (err) {
      toast.error("Some error has occurred");
    }
  }, [isMounted]);

  useEffect(() => {
    getEventManagements();
    getSMSEmailConfig();
  }, []);
  // copied
  useEffect(() => {
    gtm.push({ event: "page_view" });
  });

  // for filtering
  const [filters, setFilters] = useState({
    query: "",
  });
  // query filter
  const queryRef = useRef(null);
  const handleQueryChange = (e) => {
    e.preventDefault();
    setFilters((prevState) => ({
      ...prevState,
      query: queryRef.current?.value,
    }));
  };
  const filteredEventsManagement = applyFilter(eventsManagement, filters);

  // for selection of checkboxes
  const [selectedEventsManagement, setSelectedEventsManagement] = useState([]);
  const selectedAllEventsManagement =
    selectedEventsManagement.length == eventsManagement.length;
  const selectedSomeEventsManagement =
    selectedEventsManagement.length > 0 && !selectedAllEventsManagement;
  const handleSelectAllEventsManagement = (e) =>
    setSelectedEventsManagement(
      e.target.checked ? eventsManagement.map((e) => e.eventsManagementId) : []
    );
  const handleSelectFactory = (eventsManagementId) => () => {
    if (selectedEventsManagement.includes(eventsManagementId)) {
      setSelectedEventsManagement(
        selectedEventsManagement.filter((id) => id !== eventsManagementId)
      );
    } else {
      setSelectedEventsManagement([
        ...selectedEventsManagement,
        eventsManagementId,
      ]);
    }
  };

  // for pagination
  const [page, setPage] = useState(0);
  const handlePageChange = (e, newPage) => setPage(newPage);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const handleRowsPerPageChange = (e) =>
    setRowsPerPage(parseInt(e.target.value, 10));
  const paginatedEventsManagement = applyPagination(
    filteredEventsManagement,
    page,
    rowsPerPage
  );

  useEffect(() => {}, [filters]);

  // for actions button
  const [actionAnchor, setActionAnchor] = useState(null);
  const open = Boolean(actionAnchor);
  const handleActionClick = (e) => setActionAnchor(e.currentTarget);
  const handleActionClose = () => setActionAnchor(null);
  const actionDisabled = selectedEventsManagement.length == 0;

  //for delete action button
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDeleteOpen = () => {
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => {
    setDeleteOpen(false);
  };

  const deleteEventsManagement = async (e) => {
    e.preventDefault();
    Promise.all(
      selectedEventsManagement.map((id) => {
        return eventsManagementApi.deleteEventsManagement(id);
      })
    ).then((resArr) => {
      resArr.filter((res) => {
        if (res.status == 200) {
          toast.success("Delete success", { duration: 2000 });
        } else {
          toast.error("Delete unsuccessful");
        }
      });
      getEventManagements();
    });
    setDeleteOpen(false);
    setSelectedEventsManagement([]);
  };

  // useEffect(() => {
  // 	checkSelected()
  // }, [selectedEventsManagement]);

  // // Reset selectedEventsManagement when EventsManagement change
  // useEffect(
  // 	() => {
  // 		if (selectedEventsManagement.length) {
  // 			setSelectedEventsManagement([]);
  // 		}
  // 	},
  // 	// eslint-disable-next-line react-hooks/exhaustive-deps
  // 	[EventsManagement]
  // );

  return (
    <>
      <Head>
        <title>Etlas: Events Management</title>
      </Head>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <ServerDownError
              open={serverDownOpen}
              handleDialogClose={() => setServerDownOpen(false)}
            />
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item sx={{ m: 2.5 }}>
                <Typography variant="h4">Events Management</Typography>
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
                  <NextLink href={eventsManagementCreateLink} passHref>
                    <MenuItem disableRipple>
                      <Add />
                      &#8288;Create
                    </MenuItem>
                  </NextLink>
                  <MenuItem
                    disableRipple
                    disabled={actionDisabled}
                    onClick={handleDeleteOpen}
                  >
                    <Delete />
                    &#8288;Delete
                  </MenuItem>
                  <Confirmdelete
                    setActionAnchor={setActionAnchor}
                    open={deleteOpen}
                    handleDialogClose={handleDeleteClose}
                    selectedEventsManagement={selectedEventsManagement}
                    deleteEventsManagement={deleteEventsManagement}
                  />
                </StyledMenu>
              </Grid>
            </Grid>
            {/* <Box
                            sx={{
                                m: -1,
                                mt: 3
                            }}
                        >
                            <Button startIcon={<Upload fontSize="small" />}
                                    sx={{ m: 1 }}>Import</Button>    
                            <Button startIcon={<Download fontSize="small" />}
                                    sx={{ m: 1 }}>Export</Button>
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
                        </Box> */}
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
                onChange={handleQueryChange}
                sx={{
                  flexGrow: 1,
                  m: 1.5,
                }}
              >
                <TextField
                  defaultValue=""
                  fullWidth
                  inputProps={{
                    ref: queryRef,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder={filterEventsManagementByStringPlaceholder}
                />
              </Box>
            </Box>

            <EventsManagementTable
              eventsManagements={paginatedEventsManagement}
              smsConfig={smsConfig}
              emailConfig={emailConfig}
              selectedAllEventsManagement={selectedAllEventsManagement}
              selectedSomeEventsManagement={selectedSomeEventsManagement}
              handleSelectAllEventsManagement={handleSelectAllEventsManagement}
              handleSelectFactory={handleSelectFactory}
              selectedEventsManagement={selectedEventsManagement}
              eventsManagementCount={eventsManagement.length}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              page={page}
              rowsPerPage={rowsPerPage}
            />
          </Card>
        </Container>
      </Box>
    </>
  );
};

EventsManagementList.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default EventsManagementList;
