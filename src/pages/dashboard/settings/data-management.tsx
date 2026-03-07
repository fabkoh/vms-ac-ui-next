import {
  Box,
  Button,
  Card,
  Container,
  Stack,
  Typography,
  CardHeader,
  Collapse,
  CardContent,
  Grid,
} from "@mui/material";
import toast from "react-hot-toast";
import Head from "next/head";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { ServerDownError } from "../../../components/dashboard/errors/server-down-error";
import { ErrorPopUp } from "../../../components/dashboard/errors/error-popup";
import { dataManagementApi } from "../../../api/data-management";
import { useState } from "react";
import ExpandMore from "../../../components/dashboard/shared/expand-more";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";

const DataManagement = () => {
  const [serverDownOpen, setServerDownOpen] = useState(false);
  const [errorPopUp, setErrorPopUp] = useState(false);
  const [errorMessageValue, setErrorMessageValue] = useState("");
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleBackupDownload = () => {
    dataManagementApi.downloadBackup()
      .then((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onload = () => {
            // Get today's date
            let today = new Date();

            // Format today's date in YYYY-MM-DD format
            let dateString = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();

            const dataUrl = reader.result;
            const link = document.createElement('a');
            link.href = dataUrl;
            link.setAttribute('download', `backup${dateString}.sql`); // Or use a dynamic name if provided by the server
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          };
          reader.readAsDataURL(blob);
        } else {
          console.log('No backup file available.');
          toast.error('Failed to download backup.');
        }
      })
      .catch((error) => {
        console.log('Error during backup download:', error);
        toast.error('Failed to download backup.');
      });
  };

  return (
    <>
      <Head>
        <title>Etlas: Data Management</title>
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
            <Typography variant="h3">Data Management</Typography>
          </div>
          <Stack spacing={4} sx={{ mt: 4 }}>
            <Card>
              <CardHeader
                title="Database Backup"
                avatar={
                  <ExpandMore
                    expand={expanded}
                    onClick={handleExpandClick}
                  >
                    <ExpandMoreIcon />
                  </ExpandMore>
                }
              />
              <Collapse in={expanded}>
                <CardContent>
                  <Grid
                    container
                    alignItems="center"
                    spacing={3}
                    justifyContent="flex-start"
                    padding="10px">
                    <Grid item>
                      <Button variant="contained" onClick={handleBackupDownload}>
                        Download Backup
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Collapse>
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

DataManagement.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default DataManagement;
