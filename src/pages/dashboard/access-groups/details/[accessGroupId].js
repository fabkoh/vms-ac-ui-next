import { useCallback, useEffect, useState } from "react";
import { useMounted } from "../../../../hooks/use-mounted"
import { gtm } from "../../../../lib/gtm";
import { accessGroupApi } from "../../../../api/access-groups";
import accessGroupEntranceApi from "../../../../api/access-group-entrance-n-to-n";
import NextLink from 'next/link';
import Head from 'next/head';
import router from 'next/router';
import { 
    Box, 
    Grid, 
    MenuItem, 
    Typography, 
    Container, 
    Link, 
    Button 
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ChevronDown } from "../../../../icons/chevron-down";
import StyledMenu from "../../../../components/dashboard/styled-menu";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { AccessGroupBasicDetails } from "../../../../components/dashboard/access-groups/details/access-group-basic-details";
import { AccessGroupPersons } from "../../../../components/dashboard/access-groups/details/access-group-persons";
import AccessGroupSchedules from "../../../../components/dashboard/access-groups/details/access-group-schedules";
import toast from "react-hot-toast";
import { Confirmdelete } from '../../../../components/dashboard/access-groups/confirm-delete';
import ConfirmStatusUpdate from "../../../../components/dashboard/access-groups/confirm-status-update";
import EntranceDetails from "../../../../components/dashboard/access-groups/details/entrance-details";
import { accessGroupScheduleApi } from "../../../../api/access-group-schedules";
import { getAccessGroupScheduleEditLink } from "../../../../utils/access-group-schedule";
import { accessGroupListLink, accessGroupCreateLink, getAccessGroupEditLink } from "../../../../utils/access-group";
import { controllerApi } from "../../../../api/controllers";
import { serverDownCode } from "../../../../api/api-helpers";
import { ServerDownError } from "../../../../components/dashboard/errors/server-down-error";
import {
    CloudDone,
    CloudOff,
} from "@mui/icons-material";

const AccessGroupDetails = () => {

    // load access group details
    const isMounted = useMounted();
    const [accessGroup, setAccessGroup] = useState(null);
    const [serverDownOpen, setServerDownOpen] = useState(false);
    const [accessGroupIsActive, setAccessGroupIsActive] = useState(null);
    const { accessGroupId }  = router.query;
    useEffect(() => { // copied from original template
        gtm.push({ event: 'page_view' });
    }, [])

    const link = getAccessGroupScheduleEditLink(accessGroupId);

    const [accessGroupEntrance, setAccessGroupEntrance] = useState([]);
    const [accessGroupSchedules, setAccessGroupSchedules] = useState([]);

    const getAccessGroupEntranceAndSchedule = async() => {
        try {
            const res = await accessGroupEntranceApi.getEntranceWhereAccessGroupId(accessGroupId);
            if (res.status == 200) {
                const body = await res.json();
                if (isMounted()) {
                    setAccessGroupEntrance(body);
                }

                const scheduleRes = 
                    await accessGroupScheduleApi.getAccessGroupSchedulesWhereGroupToEntranceIdsIn(
                        body.map(groupEntrance => groupEntrance.groupToEntranceId)
                    );
                if (scheduleRes.status == 200) {
                    const body = await scheduleRes.json();
                    if (isMounted()) {
                        setAccessGroupSchedules(body);
                    }
                } else {
                    if (res.status == serverDownCode) {
                        setServerDownOpen(true);
                    }
                    setAccessGroupSchedules([]);
                    toast.error("Error loading schedule info");
                }
            } else {
                if (res.status == serverDownCode) {
                    setServerDownOpen(true);
                }
                setAccessGroupEntrance([]);
                toast.error("Error loading entrance info");
            }
        } catch(err) {
            console.error(err);
        }
    }

    const getAccessGroupInSchedule = async () => {
        const res = await accessGroupScheduleApi.getAccessGroupStatusForSingleAccessGroup(accessGroupId);
        if (res.status != 200) {
            if (res.status == serverDownCode) {
                setServerDownOpen(true);
            }
            toast.error("Error loading access group current in schedule info");
            return {};
        }
        const data = await res.json();
        return data;
    };

    //access group IsActive now
    const accessGroupActive = accessGroupIsActive == true;

    const getAccessGroup = (async() => {
        try {
            const res = await accessGroupApi.getAccessGroup(accessGroupId);
            const body = await res.json();
            const accessGroupCurrentStatus = await getAccessGroupInSchedule();
            const accessGroupWithScheduleStatus = {
                ...body,
                isInSchedule: accessGroupCurrentStatus,
            };
            if (res.status != 200) {
                if (res.status == serverDownCode) {
                    toast.error("Error loading access group info due to server is down");
                } else {
                    toast.error('Access group not found');
                }
                router.replace(accessGroupListLink);
                return;
            }

            if (isMounted()) {
                setAccessGroup(accessGroupWithScheduleStatus);
                setAccessGroupIsActive(body.isActive);
            }
        } catch(err) {
            console.error(err);
        }
    });

    const getInfo = useCallback(async() => {
        // get access group and access group entrance, then use access group entrance to get access group schedule
        getAccessGroup();
        getAccessGroupEntranceAndSchedule();
    }, [isMounted])

    useEffect(() => {
        getInfo();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    [accessGroupIsActive])

    // actions menu open/close
  /*  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null) // which component to anchor action menu to
    const actionMenuOpen = Boolean(actionMenuAnchorEl);
    const handleActionMenuOpen = (e) => { setActionMenuAnchorEl(e.currentTarget); }
    const handleActionMenuClose = () => { setActionMenuAnchorEl(null); } */

    const [anchorEl, setAnchorEl] = useState(null);
    const actionMenuOpen = Boolean(anchorEl);
    const handleActionMenuOpen = (e) => { setAnchorEl(e.currentTarget); }
    const handleActionMenuClose = () => { setAnchorEl(null); }

    //for delete button
    const [deleteOpen, setDeleteOpen] = useState(false);

    //Set to true if an access group is selected. controls form input visibility.
	const [selectedState, setselectedState] = useState(false);
	const checkSelected = () => {
		setselectedState(true)
	};
	useEffect(() => {
		checkSelected()
	});

	const handleDeleteOpen = () => {        
		setDeleteOpen(true);                        
	};
	const handleDeleteClose = () => {
		setDeleteOpen(false);
	}
	const deleteAccessGroup = async(e) => {
        e.preventDefault();
        accessGroupApi.deleteAccessGroup(accessGroup.accessGroupId)
        .then(res => {
            if (res.status == 204) {
                toast.success('Delete success');
                router.replace(accessGroupListLink);
            } else {
                toast.error('Delete unsuccessful')
            }
        }).catch(() => toast.error('Delete unsuccessful'));
        setDeleteOpen(false);
    };

    // delete schedules
    const deleteSchedules = async (ids) => {
        const resArr = await Promise.all(ids.map(accessGroupScheduleApi.deleteAccessGroupSchedule));

        if (resArr.some(res => res.status != 204)) {
            toast.error('Failed to delete some access group schedules')
        }

        const numSuccess = resArr.filter(res => res.status == 204).length
        if (numSuccess) {
            toast.success(`Deleted ${numSuccess} access group schedules`)
        }

        getInfo();
    }

        // for updating status
    const [statusUpdateId, setStatusUpdateId] = useState(0);
    const [updateStatus, setUpdateStatus] = useState(null);
    const [statusUpdateDialogOpen, setStatusUpdateDialogOpen] = useState(false);
    const openStatusUpdateDialog = (accessGroupId, updatedStatus) => {
        setStatusUpdateId(accessGroupId);
        setUpdateStatus(updatedStatus);
        setStatusUpdateDialogOpen(true);
    }
    const handleStatusUpdateDialogClose = () => {
        setStatusUpdateDialogOpen(false);
    }

    const handleMultiEnable = () => openStatusUpdateDialog(accessGroupId, true);
    const handleMultiUnlock = () => openStatusUpdateDialog(accessGroupId, false);
    const handleStatusUpdate = async (accessGroupId, updatedStatus) => {
        handleStatusUpdateDialogClose();

        Promise.resolve(
            accessGroupApi.updateAccessGroupStatus(accessGroupId, updatedStatus)
        ).then((res)=>{
            if (res.status == 200) {
                toast.success("Successfully " + (updatedStatus ? "activated" : "deactivated") + " access group");
            } else {
                toast.error("Failed to " + (updatedStatus ? "activate" : "deactivated") + " access group");
            }
        })

        const accessGroupCurrentStatus = await getAccessGroupInSchedule();
        const newAccessGroup = {
            ...accessGroup,
            isInSchedule: accessGroupCurrentStatus,
            isActive: updatedStatus
        };
        setAccessGroupIsActive(updatedStatus);
        setAccessGroup(newAccessGroup);
    }

    // render view
    if (!accessGroup) {
        return null;
    }
    return (
        <>
            <Head>
                <title>
                    Etlas: Access Group Details
                </title>
            </Head>
            <ConfirmStatusUpdate
                accessGroupIds={[statusUpdateId]}
                open={statusUpdateDialogOpen}
                handleDialogClose={handleStatusUpdateDialogClose}
                updateStatus={updateStatus}
                handleStatusUpdate={handleStatusUpdate}
            />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8
                }}
            >
                <ServerDownError
                    open={serverDownOpen}
                    handleDialogClose={() => setServerDownOpen(false)} />
                <Container maxWidth="md">
                    <div>
                        <Box sx={{ mb: 4 }}>
                            <NextLink
                                href={accessGroupListLink}
                                passHref
                            >
                                <Link
                                    color="textPrimary"
                                    component="a"
                                    sx={{
                                        alignItems: 'center',
                                        display: 'flex'
                                    }}
                                >
                                    <ArrowBackIcon
                                        fontSize="smal"
                                        sx={{ mr: 1 }}
                                    />
                                    <Typography variant="subtitle2">Access Groups</Typography>
                                </Link>
                            </NextLink>
                        </Box>
                        <Grid
                            container
                            justifyContent="space-between"
                            spacing={3}
                        >
                            <Grid
                                item
                                sx={{
                                    alignItems: 'center',
                                    display: 'flex',
                                    overflow: 'hidden'
                                }}
                            >
                                <div>
                                    <Typography variant="h4">
                                        { accessGroup.accessGroupName || "Access Group Not Found" }    
                                    </Typography>    
                                </div>    
                            </Grid>
                            <Grid
                                item
                                sx={{ m: -1 }}
                            >
                                <Button
                                    endIcon={(
                                        <ChevronDown fontSize="small" />
                                    )}
                                    sx={{ m: 1 }}
                                    variant="contained"
                                    onClick={handleActionMenuOpen}
                                >
                                    Actions
                                </Button>
                                <StyledMenu
                                    anchorEl={anchorEl}
                                    open={actionMenuOpen}
                                    onClose={handleActionMenuClose}
                                >
                                    <NextLink
                                        href={accessGroupCreateLink}
                                        passHref
                                    >
                                        <MenuItem disableRipple>
                                            <AddIcon />
                                            &#8288;Create
                                        </MenuItem>
                                    </NextLink>
                                    <NextLink
                                        href={getAccessGroupEditLink(accessGroup)}
                                        passHref
                                    >
                                        <MenuItem disableRipple>
                                            <EditIcon />
                                            &#8288;Edit
                                        </MenuItem>
                                    </NextLink>
                                    <MenuItem 
                                        disableRipple
                                        onClick={handleMultiEnable}
                                        disabled={accessGroupActive}
                                    >
                                        <CloudDone />
                                        &#8288;Activate
                                    </MenuItem>
                                    <MenuItem 
                                        disableRipple
                                        onClick={handleMultiUnlock}
                                        disabled={!accessGroupActive}
                                    >
                                        <CloudOff />
                                        &#8288;De-Activate
                                    </MenuItem>
                                    <MenuItem
                                        disableRipple
                                        onClick={handleDeleteOpen}
                                    >
                                        <DeleteIcon />
                                        &#8288;Delete
                                    </MenuItem>
                                    <Confirmdelete 
                                    setAnchorEl={setAnchorEl} 
                                    open={deleteOpen}
                                    handleDialogClose={handleDeleteClose}
                                    deleteAccessGroups={deleteAccessGroup} />
                                </StyledMenu>
                            </Grid>
                        </Grid>
                    </div>
                    <Box sx={{ mt: 3 }}>
                        <Grid
                            container
                            spacing={3}
                        >
                            <Grid
                                item
                                xs={12}
                            >
                                {console.log(accessGroup, "accessGroup")}
                                <AccessGroupBasicDetails accessGroup={accessGroup} />
                            </Grid>
                            <Grid
                                item
                                xs={12}
                            >
                                <AccessGroupPersons accessGroup={accessGroup} />
                            </Grid>
                            <Grid
                                item
                                xs={12}
                            >
                                <EntranceDetails accessGroupEntrance={accessGroupEntrance} />
                            </Grid>
                            <Grid
                                item
                                xs={12}
                            >
                                <AccessGroupSchedules 
                                    accessGroupEntrance={accessGroupEntrance}
                                    accessGroupSchedules={accessGroupSchedules}
                                    deleteSchedules={deleteSchedules}
                                    link={link}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Container>
            </Box>
        </>
    )
}

AccessGroupDetails.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>
            { page }
        </DashboardLayout>
    </AuthGuard>
)

export default AccessGroupDetails;