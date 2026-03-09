import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import router from "next/router";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import toast from "react-hot-toast";
import { AuthGuard } from "../../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../../components/dashboard/dashboard-layout";
import { useMounted } from "../../../../../hooks/use-mounted";
import { personApi } from "../../../../../api/person";
import { accessGroupApi } from "../../../../../api/access-groups";
import accessGroupEntranceApi from "../../../../../api/access-group-entrance-n-to-n";
import { accessGroupScheduleApi } from "../../../../../api/access-group-schedules";
import { getEntranceDetailsLink } from "../../../../../utils/entrance";
import Rrule from "../../../../../components/dashboard/shared/rrule-form";
import rruleDescription from "../../../../../utils/rrule-desc";
import type { Person, AccessGroup } from "../../../../../types/models";

type Mode = "persons" | "duplicate";

const CreateBooking = () => {
  const isMounted = useMounted();
  const { entranceId: entranceIdRaw } = router.query;
  const entranceId = entranceIdRaw as string;

  // form state
  const [mode, setMode] = useState<Mode>("persons");
  const [bookingName, setBookingName] = useState("");
  const [selectedPersons, setSelectedPersons] = useState<Person[]>([]);
  const [sourceAccessGroupId, setSourceAccessGroupId] = useState<number | null>(null);

  // schedule state — populated by the Rrule component callbacks
  const [rruleString, setRruleString] = useState<string>("");
  const [timeStart, setTimeStart] = useState<string>("");
  const [timeEnd, setTimeEnd] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [beginInvalid, setBeginInvalid] = useState(false);
  const [untilInvalid, setUntilInvalid] = useState(false);

  // data
  const [allPersons, setAllPersons] = useState<Person[]>([]);
  const [allAccessGroups, setAllAccessGroups] = useState<AccessGroup[]>([]);

  // validation
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchPersons = useCallback(async () => {
    try {
      const res = await personApi.getPersons();
      if (res.status === 200) {
        const body = await res.json();
        if (isMounted()) setAllPersons(body);
      } else {
        toast.error("Failed to load persons");
      }
    } catch (e) {
      console.error(e);
    }
  }, [isMounted]);

  const fetchAccessGroups = useCallback(async () => {
    try {
      const res = await accessGroupApi.getAccessGroups();
      if (res.status === 200) {
        const body = await res.json();
        if (isMounted()) setAllAccessGroups(body);
      } else {
        toast.error("Failed to load access groups");
      }
    } catch (e) {
      console.error(e);
    }
  }, [isMounted]);

  useEffect(() => {
    fetchPersons();
    fetchAccessGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rrule component callbacks — same pattern as access-group-schedule-edit-form
  const [ruleObj, setRuleObj] = useState<any>(null);
  const handleRrule = (rruleObj: any) => {
    setRuleObj(rruleObj);
    setRruleString(rruleObj.toString());
    setDescription(rruleDescription(rruleObj, timeStart, timeEnd));
  };
  const getStart = (t: string) => setTimeStart(t);
  const getEnd = (t: string) => setTimeEnd(t);

  useEffect(() => {
    if (ruleObj) setDescription(rruleDescription(ruleObj, timeStart, timeEnd));
  }, [timeStart, timeEnd]);

  const nameError = attempted && !bookingName.trim();
  const personsError = attempted && mode === "persons" && selectedPersons.length === 0;
  const duplicateError = attempted && mode === "duplicate" && !sourceAccessGroupId;

  const isValid = () => {
    if (!bookingName.trim()) return false;
    if (mode === "persons" && selectedPersons.length === 0) return false;
    if (mode === "duplicate" && !sourceAccessGroupId) return false;
    if (!rruleString || beginInvalid || untilInvalid) return false;
    return true;
  };

  const togglePerson = (person: Person) => {
    setSelectedPersons((prev) =>
      prev.some((p) => p.personId === person.personId)
        ? prev.filter((p) => p.personId !== person.personId)
        : [...prev, person]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (!isValid()) return;

    setSubmitting(true);
    try {
      // Step 1: resolve persons
      let persons: Person[] = [];
      if (mode === "persons") {
        persons = selectedPersons;
      } else {
        const res = await accessGroupApi.getAccessGroup(sourceAccessGroupId!);
        if (res.status !== 200) throw new Error("Failed to load source access group");
        const body = await res.json();
        persons = body.persons ?? [];
      }

      // Step 2: create access group
      const createRes = await accessGroupApi.createAccessGroup({
        accessGroupName: bookingName,
        persons,
      });
      if (createRes.status !== 201) throw new Error("Failed to create access group");
      const newGroup = await createRes.json();
      const accessGroupId: number = newGroup.accessGroupId;

      // Step 3: link to entrance
      const linkRes = await accessGroupEntranceApi.assignEntrancesToAccessGroup(
        [entranceId],
        accessGroupId
      );
      if (linkRes && linkRes.status !== 204) throw new Error("Failed to link entrance to access group");

      // Step 4: get groupToEntranceId
      const gteRes = await accessGroupEntranceApi.getEntranceWhereAccessGroupId(accessGroupId);
      if (!gteRes || gteRes.status !== 200) throw new Error("Failed to get group-to-entrance link");
      const gteBody = await gteRes.json();
      if (!gteBody || gteBody.length === 0) throw new Error("No group-to-entrance link found");
      const groupToEntranceId: number = gteBody[0].groupToEntranceId;

      // Step 5: replace schedule
      const scheduleRes = await accessGroupScheduleApi.replaceAccessGroupSchedules(
        [
          {
            accessGroupScheduleName: bookingName,
            rrule: rruleString,
            timeStart,
            timeEnd,
          } as any,
        ],
        [groupToEntranceId]
      );
      if (scheduleRes && scheduleRes.status !== 200 && scheduleRes.status !== 204) {
        throw new Error("Failed to set schedule");
      }

      toast.success("Booking created");
      router.push(getEntranceDetailsLink({ entranceId: Number(entranceId) }));
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const backLink = entranceId
    ? getEntranceDetailsLink({ entranceId: Number(entranceId) })
    : "/dashboard/entrances";

  return (
    <>
      <Head>
        <title>Etlas: Create Booking</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="md">
          <Box sx={{ mb: 4 }}>
            <Link
              color="textPrimary"
              component={NextLink}
              href={backLink}
              sx={{ alignItems: "center", display: "flex" }}
            >
              <ArrowBackIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="subtitle2">Back to Entrance</Typography>
            </Link>
          </Box>

          <Typography variant="h4" sx={{ mb: 3 }}>
            New Meeting Room Booking
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>

              {/* Mode */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Mode" />
                  <Divider />
                  <CardContent>
                    <ToggleButtonGroup
                      value={mode}
                      exclusive
                      onChange={(_, v) => v && setMode(v)}
                    >
                      <ToggleButton value="persons">Select Persons</ToggleButton>
                      <ToggleButton value="duplicate">Duplicate Access Group</ToggleButton>
                    </ToggleButtonGroup>

                    {mode === "persons" && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Select persons for this booking
                        </Typography>
                        <FormGroup>
                          {allPersons.map((person) => (
                            <FormControlLabel
                              key={person.personId}
                              control={
                                <Checkbox
                                  checked={selectedPersons.some(
                                    (p) => p.personId === person.personId
                                  )}
                                  onChange={() => togglePerson(person)}
                                />
                              }
                              label={
                                [person.personFirstName, person.personLastName]
                                  .filter(Boolean)
                                  .join(" ") || `Person #${person.personId}`
                              }
                            />
                          ))}
                        </FormGroup>
                        {personsError && (
                          <FormHelperText error>Select at least one person</FormHelperText>
                        )}
                      </Box>
                    )}

                    {mode === "duplicate" && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Source access group
                        </Typography>
                        <Select
                          fullWidth
                          value={sourceAccessGroupId ?? ""}
                          onChange={(e) => setSourceAccessGroupId(e.target.value as number)}
                          displayEmpty
                        >
                          <MenuItem value="" disabled>
                            — Select access group —
                          </MenuItem>
                          {allAccessGroups.map((ag) => (
                            <MenuItem key={ag.accessGroupId} value={ag.accessGroupId}>
                              {ag.accessGroupName}
                            </MenuItem>
                          ))}
                        </Select>
                        {duplicateError && (
                          <FormHelperText error>Select a source access group</FormHelperText>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Booking name */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Booking Name" />
                  <Divider />
                  <CardContent>
                    <TextField
                      fullWidth
                      label="Booking name"
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      error={nameError}
                      helperText={nameError ? "Booking name is required" : ""}
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Schedule — same component as access group schedule creation */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Schedule" />
                  <Divider />
                  <CardContent>
                    <Stack spacing={3}>
                      {/* Human-readable description, same as in the edit form */}
                      <TextField
                        fullWidth
                        multiline
                        value={description}
                        disabled
                      />
                      <Divider />
                      <Rrule
                        handleRrule={handleRrule}
                        getStart={getStart}
                        getEnd={getEnd}
                        timeEndInvalid={false}
                        handleInvalidUntil={(v: boolean) => setUntilInvalid(v)}
                        handleInvalidBegin={(v: boolean) => setBeginInvalid(v)}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Actions */}
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={submitting}
                    >
                      Create Booking
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      component={NextLink}
                      href={backLink}
                      variant="outlined"
                      color="error"
                      size="large"
                    >
                      Cancel
                    </Button>
                  </Grid>
                </Grid>
              </Grid>

            </Grid>
          </form>
        </Container>
      </Box>
    </>
  );
};

CreateBooking.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default CreateBooking;
