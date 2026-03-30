import { useState } from 'react';
import Head from 'next/head';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Divider,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { Logo } from '../../components/logo';

const apiBase = () => (process.env.NEXT_PUBLIC_URI || '').replace(/\/$/, '');

const VisitorRegisterPage = () => {
  const [step, setStep] = useState(1);
  const [visitorUid, setVisitorUid] = useState('');
  const [existingVisitor, setExistingVisitor] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    emailAdd: '',
    mobileNumber: '',
    company: ''
  });
  const [visitData, setVisitData] = useState({
    visitDate: '',
    purpose: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!apiBase()) {
      setError('NEXT_PUBLIC_URI is not configured.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${apiBase()}/api/visitor/check?visitorUid=${encodeURIComponent(visitorUid.trim())}`
      );
      if (res.ok) {
        const data = await res.json();
        setExistingVisitor(data);
        setStep(2);
      } else if (res.status === 404) {
        setExistingVisitor(null);
        setStep(2);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const goToVisitDetails = () => {
    setError('');
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!apiBase()) {
      setError('NEXT_PUBLIC_URI is not configured.');
      return;
    }
    if (!visitData.visitDate) {
      setError('Please choose a visit date.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!existingVisitor) {
        const registerRes = await fetch(`${apiBase()}/api/visitor/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorUid: visitorUid.trim(), ...formData })
        });
        if (!registerRes.ok) {
          const err = await registerRes.json().catch(() => ({}));
          setError(err.message || 'Registration failed.');
          setLoading(false);
          return;
        }
      }

      const scheduleRes = await fetch(`${apiBase()}/api/visitor/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorUid: existingVisitor ? existingVisitor.visitorUid : visitorUid.trim(),
          visitDate: visitData.visitDate,
          purpose: visitData.purpose || ''
        })
      });
      if (scheduleRes.ok) {
        setStep(4);
      } else {
        const err = await scheduleRes.json().catch(() => ({}));
        setError(err.message || 'Scheduling failed.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const emailForConfirmation = existingVisitor
    ? existingVisitor.emailAdd
    : formData.emailAdd;

  return (
    <>
      <Head>
        <title>Visitor registration</title>
      </Head>
      <Box
        component="main"
        sx={{
          backgroundColor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh'
        }}
      >
        <Container
          maxWidth="sm"
          sx={{ py: { xs: '60px', md: '120px' } }}
        >
          <Card
            elevation={16}
            sx={{ p: 4 }}
          >
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                mb: 3
              }}
            >
              <Logo sx={{ height: 50, width: 50, mb: 1 }} />
              <Typography variant="h4">
                Visitor Registration
              </Typography>
              <Typography
                color="textSecondary"
                variant="body2"
                sx={{ mt: 1 }}
              >
                Step {step} of 4
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {step === 1 && (
              <Stack spacing={3}>
                <Typography color="textSecondary" variant="body2">
                  Enter your NRIC or passport number to continue.
                </Typography>
                <TextField
                  label="NRIC / Passport"
                  value={visitorUid}
                  onChange={(e) => setVisitorUid(e.target.value)}
                  fullWidth
                  autoComplete="off"
                />
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  onClick={handleCheck}
                  disabled={loading || !visitorUid.trim()}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Continue'}
                </Button>
              </Stack>
            )}

            {step === 2 && existingVisitor && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6">We found your details</Typography>
                  <Divider sx={{ mt: 1, mb: 1 }} />
                  <Stack spacing={0.5}>
                    <Typography color="textSecondary" variant="body2">
                      Name: <strong>{existingVisitor.firstName} {existingVisitor.lastName}</strong>
                    </Typography>
                    {existingVisitor.company && (
                      <Typography color="textSecondary" variant="body2">
                        Company: <strong>{existingVisitor.company}</strong>
                      </Typography>
                    )}
                  </Stack>
                </Box>
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  onClick={goToVisitDetails}
                >
                  This is me
                </Button>
                <Button
                  fullWidth
                  size="large"
                  variant="outlined"
                  onClick={() => {
                    setFormData({
                      firstName: existingVisitor.firstName || '',
                      lastName: existingVisitor.lastName || '',
                      emailAdd: existingVisitor.emailAdd || '',
                      mobileNumber: existingVisitor.mobileNumber || '',
                      company: existingVisitor.company || ''
                    });
                    setExistingVisitor(null);
                  }}
                >
                  Edit my details
                </Button>
              </Stack>
            )}

            {step === 2 && !existingVisitor && (
              <Stack spacing={3}>
                <Typography variant="h6">Your details</Typography>
                <TextField
                  label="First name"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Last name"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Email"
                  type="email"
                  required
                  value={formData.emailAdd}
                  onChange={(e) => setFormData({ ...formData, emailAdd: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Mobile number"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  fullWidth
                />
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  onClick={goToVisitDetails}
                  disabled={
                    !formData.firstName.trim() ||
                    !formData.lastName.trim() ||
                    !formData.emailAdd.trim()
                  }
                >
                  Continue
                </Button>
              </Stack>
            )}

            {step === 3 && (
              <Stack spacing={3}>
                <Typography variant="h6">Visit details</Typography>
                <TextField
                  label="Visit date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={visitData.visitDate}
                  onChange={(e) => setVisitData({ ...visitData, visitDate: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Purpose of visit"
                  value={visitData.purpose}
                  onChange={(e) => setVisitData({ ...visitData, purpose: e.target.value })}
                  fullWidth
                  multiline
                  minRows={2}
                />
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading || !visitData.visitDate}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
                </Button>
              </Stack>
            )}

            {step === 4 && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6">You are all set</Typography>
                  <Divider sx={{ mt: 1, mb: 1 }} />
                  <Typography color="textSecondary" variant="body2">
                    Your QR code has been sent to{' '}
                    <strong>{emailForConfirmation}</strong>. Please check your
                    email and present the QR code at the entrance.
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  size="large"
                  variant="outlined"
                  onClick={() => {
                    setStep(1);
                    setVisitorUid('');
                    setExistingVisitor(null);
                    setFormData({
                      firstName: '',
                      lastName: '',
                      emailAdd: '',
                      mobileNumber: '',
                      company: ''
                    });
                    setVisitData({ visitDate: '', purpose: '' });
                    setError('');
                  }}
                >
                  Register another visit
                </Button>
              </Stack>
            )}
          </Card>
        </Container>
      </Box>
    </>
  );
};

VisitorRegisterPage.getLayout = (page) => page;

export default VisitorRegisterPage;
