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
import toast from "react-hot-toast";
import { Confirmdelete } from '../../../../components/dashboard/access-groups/confirm-delete';
import { set } from "date-fns";
import EntranceDetails from "../../../../components/dashboard/access-groups/details/entrance-details";

const fakeAccessGroupSchedules = [
    {
        accessGroupScheduleId: 1,
        accessGroupScheduleName: 'name1',
        rrule: '',
        timeStart: '07:00',
        timeEnd: '19:00',
        groupToEntranceId: 1
    },
    {
        accessGroupScheduleId: 2,
        accessGroupScheduleName: 'name2',
        rrule: '',
        timeStart: '09:00',
        timeEnd: '17:00',
        groupToEntranceId: 1
    },
    {
        accessGroupScheduleId: 3,
        accessGroupScheduleName: 'name3',
        rrule: '',
        timeStart: '00:00',
        timeEnd: '23:59',
        groupToEntranceId: 3
    }
]

const AccessGroupDetails = () => {

    // load access group details
    const isMounted = useMounted();
    const [accessGroup, setAccessGroup] = useState(null);
    const { accessGroupId }  = router.query;

    useEffect(() => { // copied from original template
        gtm.push({ event: 'page_view' });
    }, [])

    const [accessGroupEntrance, setAccessGroupEntrance] = useState([]);
    const [accessGroupSchedules, setAccessGroupSchedules] = useState({});

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
                    toast.error("Schedule info not loaded");
                }
            } else {
                toast.error("Entrance info not loaded");
            }
        } catch(err) {
            console.error(err);
        }
    }

    const getAccessGroup = (async() => {
        try {
            const res = await accessGroupApi.getAccessGroup(accessGroupId);
            if(res.status != 200) {
                toast.error('Access group not found');
                router.replace('/dashboard/access-groups')
            }
            const body = await res.json();

            if (isMounted()) {
                setAccessGroup(body);
                getEntrances(body.accessGroupId);
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
    [])

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
    const [text, setText] = useState("");
    const [deleteBlock, setDeleteBlock] = useState(true);
    const handleTextChange = (e) => {
		setText(e.target.value);
	};
    useEffect(() => {
        console.log(text);
        (text=='DELETE')? setDeleteBlock(false):setDeleteBlock(true)
    }, [text]);

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
	const handleDeleteAction = () => {
        Promise.resolve(
            accessGroupApi.deleteAccessGroup(accessGroup.accessGroupId)
        ).then((res)=>{
        if (res.status == 204){
            toast.success('Delete success');
            router.replace('/dashboard/access-groups');
        }
        else{
            toast.error('Delete unsuccessful')
        }
        })
        setDeleteOpen(false);
    };

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
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8
                }}
            >
                <Container maxWidth="md">
                    <div>
                        <Box sx={{ mb: 4 }}>
                            <NextLink
                                href="/dashboard/access-groups"
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
                                        href="/dashboard/access-groups/create"
                                        passHref
                                    >
                                        <MenuItem disableRipple>
                                            <AddIcon />
                                            &#8288;Create
                                        </MenuItem>
                                    </NextLink>
                                    <NextLink
                                        href={ 
                                            // put accessGroupId in the ids of params of edit url
                                            "/dashboard/access-groups/edit?ids=" + encodeURIComponent(JSON.stringify([Number(accessGroup.accessGroupId)])) 
                                        }
                                        passHref
                                    >
                                        <MenuItem disableRipple>
                                            <EditIcon />
                                            &#8288;Edit
                                        </MenuItem>
                                    </NextLink>
                                    <MenuItem
                                        disableRipple
                                        onClick={handleDeleteOpen}
                                    >
                                        <DeleteIcon />
                                        &#8288;Delete
                                    </MenuItem>
                                    <Confirmdelete 
                                    selectedState={selectedState}
                                    setAnchorEl={setAnchorEl} 
                                    deleteOpen={deleteOpen}
                                    handleDeleteClose={handleDeleteClose}
                                    handleDeleteAction={handleDeleteAction}
                                    handleDeleteOpen={handleDeleteOpen}
                                    handleTextChange={handleTextChange}
                                    deleteBlock={deleteBlock}/>
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