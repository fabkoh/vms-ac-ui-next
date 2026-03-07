import NextLink from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import {
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Popover,
  Typography,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../../hooks/use-auth";
import { Cog as CogIcon } from "../../icons/cog";
import { UserCircle as UserCircleIcon } from "../../icons/user-circle";
import { useEffect } from "react";

export const AccountPopover = (props) => {
  const { anchorEl, onClose, open, ...other } = props;
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      onClose?.();
      await logout();
      //Ensure that the login page is routed upon logout
      router.push("/authentication/login"); 
    } catch (err) {
      console.error(err);
      toast.error("Unable to logout.");
    }
  };

  useEffect(() => {
    console.log("user", user);
  }
  , [user]);

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: "center",
        vertical: "bottom",
      }}
      keepMounted
      onClose={onClose}
      open={open}
      PaperProps={{ sx: { width: 300 } }}
      transitionDuration={0}
      {...other}
    >
      <Box
        sx={{
          alignItems: "center",
          p: 2,
          display: "flex",
        }}
      >
        <Avatar>
          <UserCircleIcon fontSize="small" />
        </Avatar>
        <Box
          sx={{
            ml: 1,
          }}
        >
          {/* Prevents crash if user is null */}
          <Typography variant="body1">
            {user ? `${user.firstName} ${user.lastName}` : ""}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {user ? user.username : ""}
          </Typography>
        </Box>
      </Box>
      <Divider />
      <Box sx={{ my: 1 }}>
        {/* <NextLink
          href="/dashboard/social/profile"
          passHref legacyBehavior
        >
          <MenuItem component="a">
            <ListItemIcon>
              <UserCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={(
                <Typography variant="body1">
                  Profile
                </Typography>
              )}
            />
          </MenuItem>
        </NextLink> */}
        <NextLink href="/dashboard/settings/account" passHref legacyBehavior>
          <MenuItem component="a">
            <ListItemIcon>
              <CogIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={<Typography variant="body1">Settings</Typography>}
            />
          </MenuItem>
        </NextLink>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography variant="body1">Logout</Typography>}
          />
        </MenuItem>
      </Box>
    </Popover>
  );
};

AccountPopover.propTypes = {
  anchorEl: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool,
};