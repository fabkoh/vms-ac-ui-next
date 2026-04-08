import { useCallback, useEffect, useMemo, useState } from "react";
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
import BookingCalendar, {
  injectTimeIntoDtstart,
  calcDuration,
  formatTimeHHMM,
} from "../../../../../components/dashboard/entrances/booking-calendar";

type Person = {
  personId: number;
  personFirstName?: string;
  personLastName?: string;
};

type AccessGroup = {
  accessGroupId: number;
  accessGroupName: string;
};

type Mode = "persons" | "duplicate";

const EXISTING_COLORS = [
  "#78909c", "#90a4ae", "#a1887f", "#80cbc4", "#b0bec5",
];

const CreateBooking = () => {
  const isMounted = useMounted();
  const { entranceId: entranceIdRaw } = router.query;
  const entranceId = entranceIdRaw as string;
  const entranceIdNum = Number(entranceId);

  // form state
  const [mode, setMode] = useState<Mode>("persons");
  const [bookingName, setBookingName] = useState("");
  const [selectedPersons, setSelectedPersons] = useState<Person[]>([]);
  const [sourceAccessGroupId, setSourceAccessGroupId] = useState<
    number | null
  >(null);

  // schedule state — set by calendar drag (one-time only)
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [timeStart, setTimeStart] = useState<string>("");
  const [timeEnd, setTimeEnd] = useState<string>("");

  // data
  const [allPersons, setAllPersons] = useState<Person[]>([]);
  const [allAccessGroups, setAllAccessGroups] = useState<AccessGroup[]>([]);

  // existing bookings for this entrance
  const [existingEntries, setExistingEntries] = useState<any[]>([]);
  const [existingScheduleMap, setExistingScheduleMap] = useState<
    Record<number, any[]>
  >({});

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

  const fetchExistingBookings = useCallback(async () => {
    if (!entranceIdNum || !Number.isFinite(entranceIdNum)) return;
    try {
      const res = await accessGroupEntranceApi.getAccessGroupWhereEntranceId(
        entranceIdNum
      );
      if (!res || res.status !== 200) return;
      const entries: any[] = await res.json();
      if (!isMounted()) return;
      setExistingEntries(entries);

      const gteIds = entries.map((e: any) => e.groupToEntranceId);
      if (gteIds.length === 0) return;
      const schedRes =
        await accessGroupScheduleApi.getAccessGroupSchedulesWhereGroupToEntranceIdsIn(
          gteIds
        );
      if (!schedRes || schedRes.status !== 200) return;
      const schedules: any[] = await schedRes.json();
      const map: Record<number, any[]> = {};
      schedules.forEach((s: any) => {
        const id = s.groupToEntranceId;
        if (!map[id]) map[id] = [];
        map[id].push(s);
      });
      if (isMounted()) setExistingScheduleMap(map);
    } catch (e) {
      console.error(e);
    }
  }, [entranceIdNum, isMounted]);

  useEffect(() => {
    fetchPersons();
    fetchAccessGroups();
    fetchExistingBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build one-time rrule from the selected date (floating/local — no UTC offset)
  // Note: RRule.toString() always converts dates to UTC internally, so we build
  // the string manually to preserve the local calendar date.
  const rruleString = useMemo(() => {
    if (!startDate) return "";
    const y = startDate.getFullYear();
    const m = String(startDate.getMonth() + 1).padStart(2, "0");
    const d = String(startDate.getDate()).padStart(2, "0");
    return `DTSTART:${y}${m}${d}T000000\nRRULE:FREQ=DAILY;COUNT=1`;
  }, [startDate]);

  const description = useMemo(() => {
    if (!startDate || !timeStart || !timeEnd) return "";
    const dateStr = startDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return `${dateStr}, ${timeStart} – ${timeEnd}`;
  }, [startDate, timeStart, timeEnd]);

  // Calendar drag handler
  const handleCalendarSelect = (info: {
    start: Date;
    end: Date;
    allDay: boolean;
  }) => {
    if (info.allDay) return;
    setStartDate(info.start);
    setTimeStart(formatTimeHHMM(info.start));
    setTimeEnd(formatTimeHHMM(info.end));
  };

  // Existing bookings as read-only calendar events
  const existingEvents = useMemo(() => {
    const result: any[] = [];
    existingEntries.forEach((entry: any, idx: number) => {
      const ag = entry.accessGroup;
      if (!ag) return;
      const schedules = existingScheduleMap[entry.groupToEntranceId] ?? [];
      const color = EXISTING_COLORS[idx % EXISTING_COLORS.length];

      schedules.forEach((s: any) => {
        const isAllDay = s.timeStart === "00:00" && s.timeEnd === "24:00";
        if (isAllDay) {
          result.push({
            title: ag.accessGroupName ?? "(booked)",
            rrule: s.rrule,
            allDay: true,
            backgroundColor: color,
            borderColor: color,
            editable: false,
          });
        } else {
          result.push({
            title: ag.accessGroupName ?? "(booked)",
            rrule: injectTimeIntoDtstart(s.rrule, s.timeStart),
            duration: calcDuration(s.timeStart, s.timeEnd),
            backgroundColor: color,
            borderColor: color,
            editable: false,
          });
        }
      });
    });
    return result;
  }, [existingEntries, existingScheduleMap]);

  // New booking preview event
  const previewEvents = useMemo(() => {
    if (!rruleString || !timeStart || !timeEnd || timeStart === timeEnd)
      return [];
    return [
      {
        title: bookingName || "New Booking",
        rrule: injectTimeIntoDtstart(rruleString, timeStart),
        duration: calcDuration(timeStart, timeEnd),
        backgroundColor: "#1976d2",
        borderColor: "#1976d2",
      },
    ];
  }, [rruleString, timeStart, timeEnd, bookingName]);

  const allCalendarEvents = useMemo(
    () => [...existingEvents, ...previewEvents],
    [existingEvents, previewEvents]
  );

  const nameError = attempted && !bookingName.trim();
  const [nameDuplicateError, setNameDuplicateError] = useState(false);
  const personsError =
    attempted && mode === "persons" && selectedPersons.length === 0;
  const duplicateError =
    attempted && mode === "duplicate" && !sourceAccessGroupId;
  const scheduleError = attempted && (!startDate || !timeStart || !timeEnd);

  const checkNameDuplicate = (name: string) => {
    const trimmed = name.trim().toLowerCase();
    const isDupe = allAccessGroups.some(
      (ag) => ag.accessGroupName.toLowerCase() === trimmed
    );
    setNameDuplicateError(isDupe);
    return isDupe;
  };

  const handleBookingNameChange = (val: string) => {
    setBookingName(val);
    checkNameDuplicate(val);
  };

  const isValid = () => {
    if (!bookingName.trim()) return false;
    if (checkNameDuplicate(bookingName)) return false;
    if (mode === "persons" && selectedPersons.length === 0) return false;
    if (mode === "duplicate" && !sourceAccessGroupId) return false;
    if (!rruleString) return false;
    if (!timeStart || !timeEnd || timeStart === timeEnd) return false;
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
      if (!Number.isFinite(entranceIdNum)) {
        throw new Error("Invalid entrance id");
      }

      // Step 1: resolve persons
      let persons: Person[] = [];
      if (mode === "persons") {
        persons = selectedPersons;
      } else {
        const res = await accessGroupApi.getAccessGroup(sourceAccessGroupId!);
        if (res.status !== 200)
          throw new Error("Failed to load source access group");
        const body = await res.json();
        persons = body.persons ?? [];
      }

      // Step 2: create access group
      const createRes = await accessGroupApi.createAccessGroup({
        accessGroupName: bookingName,
        accessGroupDesc: "",
        persons,
      });
      if (createRes.status === 409) {
        throw new Error(
          "Booking name already exists. Please choose a different name."
        );
      }
      if (createRes.status !== 201)
        throw new Error("Failed to create access group");
      const newGroup = await createRes.json();
      const accessGroupId: number = newGroup.accessGroupId;

      // Step 3: link to entrance
      const linkRes =
        await accessGroupEntranceApi.assignEntrancesToAccessGroup(
          [entranceIdNum],
          accessGroupId
        );
      if (linkRes && linkRes.status !== 204) {
        await accessGroupApi.deleteAccessGroup(accessGroupId);
        throw new Error("Failed to link entrance to access group");
      }

      // Step 4: get groupToEntranceId
      const gteRes =
        await accessGroupEntranceApi.getEntranceWhereAccessGroupId(
          accessGroupId
        );
      if (!gteRes || gteRes.status !== 200) {
        await accessGroupEntranceApi.assignEntrancesToAccessGroup(
          [],
          accessGroupId
        );
        await accessGroupApi.deleteAccessGroup(accessGroupId);
        throw new Error("Failed to get group-to-entrance link");
      }
      const gteBody = await gteRes.json();
      if (!gteBody || gteBody.length === 0) {
        await accessGroupEntranceApi.assignEntrancesToAccessGroup(
          [],
          accessGroupId
        );
        await accessGroupApi.deleteAccessGroup(accessGroupId);
        throw new Error("No group-to-entrance link found");
      }
      const groupToEntranceId: number = gteBody[0].groupToEntranceId;

      // Step 5: replace schedule
      const scheduleRes =
        await accessGroupScheduleApi.replaceAccessGroupSchedules(
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
      if (
        scheduleRes &&
        scheduleRes.status !== 200 &&
        scheduleRes.status !== 204
      ) {
        await accessGroupEntranceApi.assignEntrancesToAccessGroup(
          [],
          accessGroupId
        );
        await accessGroupApi.deleteAccessGroup(accessGroupId);
        throw new Error("Failed to set schedule");
      }

      toast.success("Booking created");
      router.push(getEntranceDetailsLink({ entranceId: entranceIdNum }));
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const backLink = Number.isFinite(entranceIdNum)
    ? getEntranceDetailsLink({ entranceId: entranceIdNum })
    : "/dashboard/entrances";

  return (
    <>
      <Head>
        <title>Etlas: Create Booking</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="md">
          <Box sx={{ mb: 4 }}>
            <NextLink href={backLink} passHref legacyBehavior>
              <Link
                color="textPrimary"
                sx={{ alignItems: "center", display: "flex" }}
              >
                <Box sx={{ alignItems: "center", display: "flex" }}>
                  <ArrowBackIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2">Back to Entrance</Typography>
                </Box>
              </Link>
            </NextLink>
          </Box>

          <Typography variant="h4" sx={{ mb: 3 }}>
            New Meeting Room Booking
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
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
                      onChange={(e) => handleBookingNameChange(e.target.value)}
                      error={nameError || nameDuplicateError}
                      helperText={
                        nameError
                          ? "Booking name is required"
                          : nameDuplicateError
                          ? "This name is already taken. Please choose a different name."
                          : ""
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Mode */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Persons" />
                  <Divider />
                  <CardContent>
                    <ToggleButtonGroup
                      value={mode}
                      exclusive
                      onChange={(_, v) => v && setMode(v)}
                      sx={{ mb: 2 }}
                    >
                      <ToggleButton value="persons">
                        Select Persons
                      </ToggleButton>
                      <ToggleButton value="duplicate">
                        Duplicate Access Group
                      </ToggleButton>
                    </ToggleButtonGroup>

                    {mode === "persons" && (
                      <Box>
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
                          <FormHelperText error>
                            Select at least one person
                          </FormHelperText>
                        )}
                      </Box>
                    )}

                    {mode === "duplicate" && (
                      <Box>
                        <Select
                          fullWidth
                          value={sourceAccessGroupId ?? ""}
                          onChange={(e) =>
                            setSourceAccessGroupId(e.target.value as number)
                          }
                          displayEmpty
                        >
                          <MenuItem value="" disabled>
                            — Select access group —
                          </MenuItem>
                          {allAccessGroups.map((ag) => (
                            <MenuItem
                              key={ag.accessGroupId}
                              value={ag.accessGroupId}
                            >
                              {ag.accessGroupName}
                            </MenuItem>
                          ))}
                        </Select>
                        {duplicateError && (
                          <FormHelperText error>
                            Select a source access group
                          </FormHelperText>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Schedule — calendar with existing bookings + drag to create */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader
                    title="Schedule"
                    subheader="Drag on the calendar to select the booking time. Grey blocks are existing bookings."
                  />
                  <Divider />
                  <CardContent>
                    <Stack spacing={2}>
                      {startDate && (
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <TextField
                            label="Start time"
                            type="time"
                            size="small"
                            value={timeStart}
                            onChange={(e) => setTimeStart(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 900 }}
                            sx={{ flex: 1 }}
                          />
                          <TextField
                            label="End time"
                            type="time"
                            size="small"
                            value={timeEnd}
                            onChange={(e) => setTimeEnd(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 900 }}
                            sx={{ flex: 1 }}
                          />
                        </Box>
                      )}

                      <BookingCalendar
                        events={allCalendarEvents}
                        selectable
                        onSelect={handleCalendarSelect}
                        date={startDate}
                        onDateChange={setStartDate}
                      />

                      {scheduleError && (
                        <FormHelperText error>
                          Please drag on the calendar above to select a time
                          block
                        </FormHelperText>
                      )}

                      {description && (
                        <TextField
                          fullWidth
                          label="Booking summary"
                          value={description}
                          size="small"
                          disabled
                        />
                      )}
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
                    <NextLink href={backLink} passHref legacyBehavior>
                      <Button
                        component="a"
                        variant="outlined"
                        color="error"
                        size="large"
                      >
                        Cancel
                      </Button>
                    </NextLink>
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

CreateBooking.getLayout = (page: any) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default CreateBooking;
