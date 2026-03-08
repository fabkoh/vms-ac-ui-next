import { useEffect, useState, useCallback } from 'react';
import NextLink from 'next/link';
import Head from 'next/head';
import {
  Link,
  Box,
  Container,
  Typography,
  Stack,
  Button,
  Grid,
  Alert,
} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { AuthGuard } from '../../../../components/authentication/auth-guard';
import { DashboardLayout } from '../../../../components/dashboard/dashboard-layout';
import Add from '@mui/icons-material/Add';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router'; // Removed singleton 'router' import
import formUtils from '../../../../utils/form-utils';
import EditEntSchedForm from '../../../../components/dashboard/entrance-schedule/entrance-schedule-edit-form';
import MultipleSelectInput from '../../../../components/dashboard/shared/multi-select-input';
import entranceApi from '../../../../api/entrance';
import { entranceScheduleApi } from '../../../../api/entrance-schedule';
import { serverDownCode } from '../../../../api/api-helpers';
import { ServerDownError } from '../../../../components/dashboard/errors/server-down-error';

const ModifyEntranceSchedule = () => {
  const router = useRouter();
  const { entranceId } = router.query;

  const [allEntrances, setAllEntrances] = useState<any[]>([]);
  const [entrances, setEntrances] = useState<any[]>([]);
  const [serverDownOpen, setServerDownOpen] = useState(false);

  // Initial State Helpers
  const getEmptyEntranceScheduleInfo = (id: number) => ({
    entranceScheduleId: id,
    entranceScheduleName: '',
    rrule: '',
    timeStart: '00:00',
    timeEnd: '23:59',
  });

  const getEmptyEntranceScheduleValidations = (id: number) => ({
    entranceScheduleId: id,
    entranceScheduleNameBlank: true,
    timeEndInvalid: false,
    timeStartInvalid: false,
    untilInvalid: false,
    beginInvalid: true,
  });

  const [entranceScheduleInfoArr, setEntranceScheduleInfoArr] = useState([
    getEmptyEntranceScheduleInfo(0),
  ]);
  const [entranceScheduleValidationsArr, setEntranceScheduleValidationsArr] =
    useState([getEmptyEntranceScheduleValidations(0)]);

  // Data Fetching
  const getEntrance = useCallback(async () => {
    try {
      const res = await entranceApi.getEntrances();
      if (res.status !== 200) {
        if (res.status === serverDownCode) setServerDownOpen(true);
        toast.error('Error loading entrances');
        return;
      }
      const data = await res.json();
      setAllEntrances(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (router.isReady) {
      getEntrance();
    }
  }, [router.isReady, getEntrance]);

  // Card Management
  const addCard = () => {
    const newId =
      entranceScheduleInfoArr.length > 0
        ? Math.max(
            ...entranceScheduleInfoArr.map((i) => i.entranceScheduleId)
          ) + 1
        : 0;
    setEntranceScheduleInfoArr((prev) => [
      ...prev,
      getEmptyEntranceScheduleInfo(newId),
    ]);
    setEntranceScheduleValidationsArr((prev) => [
      ...prev,
      getEmptyEntranceScheduleValidations(newId),
    ]);
  };

  const removeCard = (id: number) => {
    setEntranceScheduleInfoArr((prev) =>
      prev.filter((i) => i.entranceScheduleId !== id)
    );
    setEntranceScheduleValidationsArr((prev) =>
      prev.filter((v) => v.entranceScheduleId !== id)
    );
  };

  // --- IMMUTABLE STATE UPDATERS ---
  const updateInfo = (id: number, patch: any) => {
    setEntranceScheduleInfoArr((prev) =>
      prev.map((item) =>
        item.entranceScheduleId === id ? { ...item, ...patch } : item
      )
    );
  };

  const updateValidation = (id: number, patch: any) => {
    setEntranceScheduleValidationsArr((prev) =>
      prev.map((v) => (v.entranceScheduleId === id ? { ...v, ...patch } : v))
    );
  };

  // Input Handlers
  const changeTextField = (e: any, id: number) => {
    const { name, value } = e.target;
    updateInfo(id, { [name]: value });
    if (name === 'entranceScheduleName') {
      updateValidation(id, {
        entranceScheduleNameBlank: formUtils.checkBlank(value),
      });
    }
  };

  const changeTimeStart = (start: string, id: number) => {
    updateInfo(id, { timeStart: start });
    updateValidation(id, { timeStartInvalid: formUtils.checkBlank(start) });
  };

  const changeTimeEnd = (end: string, id: number) => {
    const currentInfo = entranceScheduleInfoArr.find(
      (i) => i.entranceScheduleId === id
    );
    const startTime = currentInfo?.timeStart || '00:00';

    updateInfo(id, { timeEnd: end });
    updateValidation(id, {
      timeEndInvalid:
        formUtils.checkBlank(end) ||
        (startTime !== '00:00' && end <= startTime),
    });
  };

  const changeRrule = (rrule: string, id: number) => updateInfo(id, { rrule });

  // Submission Logic
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const action = (e.nativeEvent as any).submitter.name;
    const entIdArr = entrances.map((ent) => ent.entranceId);

    // This is where the fix for the "2" vs 2 error happens
    // Ensure entranceScheduleApi handles the array joining as we discussed!
    try {
      const apiCall =
        action === 'add'
          ? entranceScheduleApi.addEntranceSchedules(
              entranceScheduleInfoArr,
              entIdArr
            )
          : entranceScheduleApi.replaceEntranceSchedules(
              entranceScheduleInfoArr,
              entIdArr
            );

      const res = await apiCall;
      if (res.status !== 200) throw new Error();

      toast.success(
        action === 'add' ? 'Schedules added' : 'Schedules replaced'
      );
      router.replace(`/dashboard/entrances/details/${entranceId}`);
    } catch (err) {
      toast.error('Failed to update schedules');
    }
  };

  // MultiSelect Helpers
  const entranceEqual = (opt, val) => opt.entranceId === val.entranceId;
  const getEntranceName = (e) => e.entranceName;
  const entranceFilter = (options, state) => {
    const text = state.inputValue.toLowerCase();
    return options.filter((e) => e.entranceName.toLowerCase().includes(text));
  };

  return (
    <>
      <Head>
        <title>Etlas: Modify Entrance Schedule</title>
      </Head>
      <ServerDownError
        open={serverDownOpen}
        handleDialogClose={() => setServerDownOpen(false)}
      />
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Link
              color="textPrimary"
              component={NextLink}
              href={`/dashboard/entrances/details/${entranceId}`}
              sx={{ alignItems: 'center', display: 'flex' }}
            >
              <ArrowBack fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="subtitle2">Entrance Details</Typography>
            </Link>
          </Box>
          <Box marginBottom={3}>
            <Typography variant="h3" mb={2}>
              Modify Entrance Schedule
            </Typography>
            <Alert severity="info" variant="outlined">
              Quick tip: You may apply these schedules to multiple entrances by
              selecting more than one.
            </Alert>
          </Box>

          <Grid container alignItems="center" mb={3}>
            <Grid item mr={2}>
              <Typography fontWeight="bold">Entrance(s) :</Typography>
            </Grid>
            <Grid item xs={11} md={7}>
              <MultipleSelectInput
                options={allEntrances}
                setSelected={setEntrances}
                getOptionLabel={getEntranceName}
                label="Entrances"
                filterOptions={entranceFilter}
                value={entrances}
                isOptionEqualToValue={entranceEqual}
                error={entrances.length === 0}
                helperText={
                  entrances.length === 0 && 'Error: no entrance selected'
                }
              />
            </Grid>
          </Grid>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {entranceScheduleInfoArr.map((info, i) => (
                <EditEntSchedForm
                  key={info.entranceScheduleId}
                  accessGroupScheduleInfo={info}
                  removeCard={removeCard}
                  changeTimeStart={changeTimeStart}
                  changeTimeEnd={changeTimeEnd}
                  accessGroupScheduleValidations={
                    entranceScheduleValidationsArr[i]
                  }
                  changeTextField={(e) =>
                    changeTextField(e, info.entranceScheduleId)
                  }
                  changeRrule={changeRrule}
                  checkUntil={(val) =>
                    updateValidation(info.entranceScheduleId, {
                      untilInvalid: val,
                    })
                  }
                  checkBegin={(val) =>
                    updateValidation(info.entranceScheduleId, {
                      beginInvalid: val,
                    })
                  }
                />
              ))}
              <Button
                size="large"
                variant="outlined"
                startIcon={<Add />}
                onClick={addCard}
                sx={{ width: 'fit-content' }}
              >
                Add another
              </Button>
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    type="submit"
                    name="replace"
                    size="large"
                    variant="contained"
                    disabled={
                      entrances.length === 0 ||
                      entranceScheduleValidationsArr.some((v) =>
                        Object.values(v).includes(true)
                      )
                    }
                  >
                    Replace all
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    type="submit"
                    name="add"
                    size="large"
                    variant="contained"
                    disabled={
                      entrances.length === 0 ||
                      entranceScheduleValidationsArr.some((v) =>
                        Object.values(v).includes(true)
                      )
                    }
                  >
                    Add on
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    component={NextLink}
                    href={`/dashboard/entrances/details/${entranceId}`}
                    size="large"
                    variant="outlined"
                    color="error"
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </Stack>
          </form>
        </Container>
      </Box>
    </>
  );
};

ModifyEntranceSchedule.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default ModifyEntranceSchedule;
