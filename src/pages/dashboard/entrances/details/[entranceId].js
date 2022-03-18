import { useCallback, useEffect, useState } from "react";
import { useMounted } from "../../../../hooks/use-mounted"
import { gtm } from "../../../../lib/gtm";
import { accessGroupApi } from "../../../../api/access-groups";
import accessGroupEntranceApi from "../../../../api/access-group-entrance-n-to-n";
import entranceApi from "../../../../api/entrance";
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
import { EntranceBasicDetails } from "../../../../components/dashboard/entrances/details/entrance-basic-details";
import toast from "react-hot-toast";
import { Confirmdelete } from '../../../../components/dashboard/access-groups/confirm-delete';
import { set } from "date-fns";
import AccessGroupDetails from "../../../../components/dashboard/entrances/details/entrance-access-group-details";

const EntranceDetails = () => {

    // load entrance details
    const isMounted = useMounted();
    const [entrance, setEntrance] = useState(null);
    const { entranceId }  = router.query;

    useEffect(() => { // copied from original template
        gtm.push({ event: 'page_view' });
    }, [])

    const [accessGroup, setAccessGroup] = useState(null);

    const getAccessGroups = async (entranceId) => {
        try {
            const res = await accessGroupEntranceApi.getAccessGroupWhereEntranceId(entranceId);
            if (res.status == 200) {
                const body = await res.json();
                setAccessGroup(body.map(e => e.accessGroup));
            } else {
                toast.error('Access Group info not loaded');
                throw new Error('Access Group info not loaded');
            }
        } catch(err) {
            console.error(err);
        }
    }

    const getEntrance = useCallback(async() => {
        try {
            const res = await entranceApi.getEntrance(entranceId);
            if(res.status != 200) {
                toast.error('Entrance not found');
                router.replace('/dashboard/entrances')
            }
            const body = await res.json();

            if (isMounted()) {
                setEntrance(body);
                getAccessGroups(body.entranceId);
            }
        } catch(err) {
            console.error(err);
        }
    }, [isMounted]);

    useEffect(() => {
        getEntrance();
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

    //Set to true if an entrance is selected. controls form input visibility.
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
/*	const handleDeleteAction = () => {
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
    }; */

    // render view
    if (!entrance) {
        return null;
    }
    return (
        <>
            <Head>
                <title>
                    Etlas: Entrance Details
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
                                href="/dashboard/entrances"
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
                                    <Typography variant="subtitle2">Entrances</Typography>
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
                                        { entrance.entranceName || "Entrance Not Found" }    
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
                                        href="/dashboard/entrances/create"
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
                                            "/dashboard/entrances/edit?ids=" + encodeURIComponent(JSON.stringify([Number(entrance.entranceId)])) 
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
                                   {/* <Confirmdelete 
                                    selectedState={selectedState}
                                    setAnchorEl={setAnchorEl} 
                                    deleteOpen={deleteOpen}
                                    handleDeleteClose={handleDeleteClose}
                                    handleDeleteAction={handleDeleteAction}
                                    handleDeleteOpen={handleDeleteOpen}
                                    handleTextChange={handleTextChange}
                                    deleteBlock={deleteBlock}/> */}
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
                                <EntranceBasicDetails entrance={entrance} />
                            </Grid>
                            <Grid
                                item
                                xs={12}
                            >
                                <AccessGroupDetails accessGroup={accessGroup} />
                            </Grid>
                        </Grid>
                    </Box>
                </Container>
            </Box>
        </>
    )
}

EntranceDetails.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>
            { page }
        </DashboardLayout>
    </AuthGuard>
)

export default EntranceDetails;