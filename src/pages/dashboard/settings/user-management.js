import { Add, ArrowBack } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  RadioGroup,
  FormControl,
  FormLabel,
  Radio,
  FormControlLabel,
  Collapse,
  Divider,
  Container,
  Link,
  Stack,
  Item,
  Table,
  TableRow,
  TableCell,
  TextField,
  Typography,
  Switch,
  Grid,
} from "@mui/material";
import toast from "react-hot-toast";
import Head from "next/head";
import NextLink from "next/link";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import formUtils, {
  createCounterObject,
  createNegativeCounterObject,
  getDuplicates,
} from "../../../utils/form-utils";
import { useCallback, useEffect, useState } from "react";
import { useMounted } from "../../../hooks/use-mounted";
import { arraySameContents, isObject } from "../../../utils/utils";
import router, { useRouter } from "next/router";
import { serverDownCode } from "../../../api/api-helpers";
import { notificationsApi } from "../../../api/notifications";
import { ServerDownError } from "../../../components/dashboard/errors/server-down-error";
import ExpandMore from "../../../components/dashboard/shared/expand-more";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import SMTPForm from "../../../components/dashboard/notifications/SMTP-form";
import { ErrorPopUp } from "../../../components/dashboard/errors/error-popup";
import { EditAccountDetails } from "../../../components/account/edit-details";
import { UsersList } from "../../../components/account/users-list";
import { authGetProfile, authGetAccounts } from "../../../api/auth-api";

const AccountManagement = () => {
  const router = useRouter();
  const [serverDownOpen, setServerDownOpen] = useState(false);
  const [errorPopUp, setErrorPopUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMessageValue, setErrorMessageValue] = useState("");
  const isMounted = useMounted();

  const [expandedUsers, setExpandedUsers] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [isUpdated, setIsUpdated] = useState(false);

  const handleExpandedUsers = () => setExpandedUsers(!expandedUsers);

  const getUserList = async () => {
    try {
      const res = await authGetAccounts();
      if (res.type == "success") {
        const body = res.response;
        console.log(body);
        const newList = [];
        for (const role of Object.keys(body)) {
          for (const user of body[role]) {
            user["role"] = role;
            newList.push(user);
          }
        }
        setUsersList(newList);
        setIsUpdated(true);
        console.log(usersList);
      } else {
        if (res.status == serverDownCode) {
          setServerDownOpen(true);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getInfo = useCallback(() => {
    getUserList();
  }, [isMounted]);

  useEffect(() => {
    getInfo();
  }, []);

  useEffect(() => {
    setErrorMessageValue(errorMessage);
  }, [errorPopUp]);

  return (
    <>
      <Head>
        <title>Etlas: Notifications</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <ErrorPopUp
          open={errorPopUp}
          errorMessage={errorMessageValue}
          handleDialogClose={() => setErrorPopUp(false)}
        />
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <ServerDownError
              open={serverDownOpen}
              handleDialogClose={() => setServerDownOpen(false)}
            />
          </Box>
          <div>
            <Typography variant="h3">User Management</Typography>
          </div>
          <Stack spacing={4} sx={{ mt: 4 }}>
            <Card>
              <CardHeader
                title="Manage System Users"
                avatar={
                  <ExpandMore
                    expand={expandedUsers}
                    onClick={handleExpandedUsers}
                  >
                    <ExpandMoreIcon />
                  </ExpandMore>
                }
              />
              <Collapse in={expandedUsers}>
                {usersList && isUpdated ? <UsersList /> : null}
              </Collapse>
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

AccountManagement.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default AccountManagement;
