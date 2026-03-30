import { Refresh } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  Grid,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthGuard } from '../../../components/authentication/auth-guard';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import { Search } from '../../../icons/search';
import { visitorsApi } from '../../../api/visitors';
import { useMounted } from '../../../hooks/use-mounted';
import toast from 'react-hot-toast';

const applyFilter = (visits, query) => {
  if (!query) return visits;
  const q = query.toLowerCase();
  return visits.filter(
    (v) =>
      (v.firstName && v.firstName.toLowerCase().includes(q)) ||
      (v.lastName && v.lastName.toLowerCase().includes(q)) ||
      (v.visitorUid && v.visitorUid.toLowerCase().includes(q)) ||
      (v.emailAdd && v.emailAdd.toLowerCase().includes(q)) ||
      (v.company && v.company.toLowerCase().includes(q)) ||
      (v.purpose && v.purpose.toLowerCase().includes(q))
  );
};

const VisitorLogs = () => {
  const isMounted = useMounted();
  const queryRef = useRef(null);
  const [visits, setVisits] = useState([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchVisits = useCallback(async () => {
    try {
      const res = await visitorsApi.getScheduledVisits();
      if (res.status === 200) {
        const data = await res.json();
        if (isMounted()) setVisits(data);
      } else {
        toast.error('Failed to load visitor logs');
      }
    } catch {
      toast.error('Failed to load visitor logs');
    }
  }, [isMounted]);

  useEffect(() => { fetchVisits(); }, [fetchVisits]);

  const filtered = applyFilter(visits, query);
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleQueryChange = (e) => {
    e.preventDefault();
    setPage(0);
    setQuery(queryRef.current?.value ?? '');
  };

  return (
    <>
      <Head>
        <title>Etlas: Visitor Logs</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item sx={{ m: 2.5 }}>
                <Typography variant="h4">Visitor Logs</Typography>
              </Grid>
              <Grid item sx={{ m: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Refresh fontSize="small" />}
                  onClick={fetchVisits}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Card>
            <Divider />
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexWrap: 'wrap',
                m: -1.5,
                p: 3,
              }}
            >
              <Box
                component="form"
                onChange={handleQueryChange}
                sx={{ flexGrow: 1, m: 1.5 }}
              >
                <TextField
                  defaultValue=""
                  fullWidth
                  inputProps={{ ref: queryRef }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Search by name, NRIC/passport, email, company or purpose"
                />
              </Box>
            </Box>

            <Table sx={{ minWidth: 700 }}>
              <TableHead sx={{ backgroundColor: 'neutral.200' }}>
                <TableRow>
                  <TableCell sx={{ color: 'neutral.700' }}>Name</TableCell>
                  <TableCell sx={{ color: 'neutral.700' }}>NRIC / Passport</TableCell>
                  <TableCell sx={{ color: 'neutral.700' }}>Company</TableCell>
                  <TableCell sx={{ color: 'neutral.700' }}>Email</TableCell>
                  <TableCell sx={{ color: 'neutral.700' }}>Visit Date</TableCell>
                  <TableCell sx={{ color: 'neutral.700' }}>Purpose</TableCell>
                  <TableCell sx={{ color: 'neutral.700' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="textSecondary" variant="body2" sx={{ py: 3 }}>
                        No visit records found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((visit) => (
                    <TableRow hover key={visit.scheduledVisitId}>
                      <TableCell>
                        {visit.firstName} {visit.lastName}
                      </TableCell>
                      <TableCell>{visit.visitorUid}</TableCell>
                      <TableCell>{visit.company || '—'}</TableCell>
                      <TableCell>{visit.emailAdd}</TableCell>
                      <TableCell>{visit.visitDate || '—'}</TableCell>
                      <TableCell>{visit.purpose || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={visit.valid ? 'Valid' : 'Expired'}
                          color={visit.valid ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={filtered.length}
              onPageChange={(_e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10, 25, 50]}
            />
          </Card>
        </Container>
      </Box>
    </>
  );
};

VisitorLogs.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default VisitorLogs;
