import { useCallback, useEffect, useState } from "react";
import { useMounted } from "../../../../hooks/use-mounted"
import { gtm } from "../../../../lib/gtm";
import { accessGroupApi } from "../../../../api/access-groups";
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

const AccessGroupDetails = () => {

    // load access group details
    const isMounted = useMounted();
    const [accessGroup, setAccessGroup] = useState(null);
    const { accessGroupId }  = router.query;

    useEffect(() => { // copied from original template
        gtm.push({ event: 'page_view' });
    }, [])

    const getAccessGroup = useCallback(async() => {
        try {
            const res = await accessGroupApi.getAccessGroup(accessGroupId);
            if(res.status != 200) {
                toast.error('Access group not found');
                router.replace('/dashboard/access-groups')
            }
            const body = await res.json();

            if (isMounted()) {
                setAccessGroup(body);
            }
        } catch(err) {
            console.error(err);
        }
    }, [isMounted]);

    useEffect(() => {
        getAccessGroup();
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

    const [deleteOpen, setDeleteOpen] = useState(false);  

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
    };

    // render view
    if (!accessGroup) {
        return null;
    }
    console.log(accessGroup);
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
                                            Create new access group
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
                                            Edit access group
                                        </MenuItem>
                                    </NextLink>
                                    <MenuItem
                                        disableRipple
                                        onClick={handleDeleteOpen}
                                    >
                                        <DeleteIcon />
                                        Delete access group
                                    </MenuItem>
                                    <Confirmdelete setAnchorEl={setAnchorEl} deleteOpen={deleteOpen} handleDeleteClose={handleDeleteClose}
                                    handleDeleteAction={handleDeleteAction}
                                    handleDeleteOpen={handleDeleteOpen}/>
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