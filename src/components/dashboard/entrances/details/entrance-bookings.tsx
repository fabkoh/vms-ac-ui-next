import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ViewListIcon from "@mui/icons-material/ViewList";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NextLink from "next/link";
import router from "next/router";
import ExpandMore from "../../shared/expand-more";
import toast from "react-hot-toast";
import { rrulestr } from "rrule";
import { accessGroupApi } from "../../../../api/access-groups";
import { accessGroupScheduleApi } from "../../../../api/access-group-schedules";
import accessGroupEntranceApi from "../../../../api/access-group-entrance-n-to-n";
import { getBookingCreateLink } from "../../../../utils/entrance";
import { getAccessGroupDetailsLink } from "../../../../utils/access-group";
import rruleDescription from "../../../../utils/rrule-desc";
import BookingCalendar, {
  injectTimeIntoDtstart,
  calcDuration,
} from "../booking-calendar";

const EVENT_COLORS = [
  "#1976d2", "#388e3c", "#f57c00", "#7b1fa2", "#c62828",
  "#00838f", "#4527a0", "#bf360c", "#1b5e20", "#ad1457",
];

type ViewMode = "list" | "calendar";

interface Props {
  entranceId: string | number;
  accessGroupEntrance: any[];
  onDeleted: () => void;
}

export default function EntranceBookings({
  entranceId,
  accessGroupEntrance,
  onDeleted,
}: Props) {
  const [expanded, setExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [scheduleMap, setScheduleMap] = useState<Record<number, any[]>>({});
  const [fullAgMap, setFullAgMap] = useState<Record<number, any>>({});

  useEffect(() => {
    if (accessGroupEntrance.length === 0) return;

    accessGroupEntrance.forEach((entry: any) => {
      const agId = entry.accessGroup?.accessGroupId;
      if (agId == null) return;
      accessGroupApi.getAccessGroup(agId).then(async (res: any) => {
        if (res.status !== 200) return;
        const body = await res.json();
        setFullAgMap((prev) => ({ ...prev, [agId]: body }));
      });
    });

    const ids = accessGroupEntrance.map((e: any) => e.groupToEntranceId);
    accessGroupScheduleApi
      .getAccessGroupSchedulesWhereGroupToEntranceIdsIn(ids)
      ?.then(async (res: any) => {
        if (res.status !== 200) return;
        const body: any[] = await res.json();
        const map: Record<number, any[]> = {};
        body.forEach((s: any) => {
          const gteId = s.groupToEntranceId;
          if (!map[gteId]) map[gteId] = [];
          map[gteId].push(s);
        });
        setScheduleMap(map);
      });
  }, [accessGroupEntrance]);

  const handleDelete = async (accessGroupId: number) => {
    try {
      const unlinkRes =
        await accessGroupEntranceApi.assignEntrancesToAccessGroup(
          [],
          accessGroupId
        );
      if (unlinkRes && unlinkRes.status !== 204) {
        throw new Error("Failed to unlink booking from entrance");
      }
      const deleteRes = await accessGroupApi.deleteAccessGroup(accessGroupId);
      if (deleteRes.status !== 204) {
        throw new Error("Unlinked, but failed to remove the access group");
      }
      toast.success("Booking deleted");
      onDeleted();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to delete booking");
    }
  };

  const colorMap = useMemo(() => {
    const map: Record<number, string> = {};
    accessGroupEntrance.forEach((entry: any, idx: number) => {
      const agId = entry.accessGroup?.accessGroupId;
      if (agId != null) map[agId] = EVENT_COLORS[idx % EVENT_COLORS.length];
    });
    return map;
  }, [accessGroupEntrance]);

  const calendarEvents = useMemo(() => {
    const result: any[] = [];
    accessGroupEntrance.forEach((entry: any) => {
      const ag = entry.accessGroup;
      if (!ag) return;
      const schedules = scheduleMap[entry.groupToEntranceId] ?? [];
      const color = colorMap[ag.accessGroupId] ?? EVENT_COLORS[0];

      schedules.forEach((s: any) => {
        const isAllDay = s.timeStart === "00:00" && s.timeEnd === "24:00";
        if (isAllDay) {
          result.push({
            title: ag.accessGroupName ?? "(unnamed)",
            rrule: s.rrule,
            allDay: true,
            backgroundColor: color,
            borderColor: color,
            extendedProps: { accessGroupId: ag.accessGroupId },
          });
        } else {
          result.push({
            title: ag.accessGroupName ?? "(unnamed)",
            rrule: injectTimeIntoDtstart(s.rrule, s.timeStart),
            duration: calcDuration(s.timeStart, s.timeEnd),
            backgroundColor: color,
            borderColor: color,
            extendedProps: { accessGroupId: ag.accessGroupId },
          });
        }
      });
    });
    return result;
  }, [accessGroupEntrance, scheduleMap, colorMap]);

  const formatSchedule = (schedules: any[]): string => {
    if (!schedules || schedules.length === 0) return "No schedule";
    return schedules
      .map((s) => {
        try {
          const rruleObj = rrulestr(s.rrule);
          return rruleDescription(rruleObj, s.timeStart, s.timeEnd);
        } catch {
          return `${s.timeStart} – ${s.timeEnd}`;
        }
      })
      .join(" | ");
  };

  const renderPersonsTooltip = (persons: any[]) => (
    <Box sx={{ maxHeight: 250, overflowY: "auto", p: 0.5 }}>
      {persons.length > 0 ? (
        persons.map((p: any) => (
          <Typography key={p.personId} variant="body2" sx={{ py: 0.25 }}>
            {[p.personFirstName, p.personLastName]
              .filter(Boolean)
              .join(" ") || `Person #${p.personId}`}
          </Typography>
        ))
      ) : (
        <Typography variant="body2">No persons</Typography>
      )}
    </Box>
  );

  const tooltipProps = {
    arrow: true as const,
    componentsProps: {
      tooltip: {
        sx: {
          maxWidth: 280,
          bgcolor: "background.paper",
          color: "text.primary",
          boxShadow: 3,
          p: 1,
        },
      },
      arrow: { sx: { color: "background.paper" } },
    },
  };

  return (
    <Card>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
      >
        <Box>
          <CardHeader
            title="Meeting Room Bookings"
            avatar={
              <ExpandMore
                expand={expanded}
                onClick={() => setExpanded(!expanded)}
              >
                <ExpandMoreIcon />
              </ExpandMore>
            }
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, m: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, v) => v && setViewMode(v)}
            size="small"
          >
            <ToggleButton value="list">
              <ViewListIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="calendar">
              <CalendarMonthIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            size="small"
            onClick={() => router.push(getBookingCreateLink(entranceId))}
          >
            New Booking
          </Button>
        </Box>
      </Box>
      <Collapse in={expanded}>
        <Divider />
        <CardContent>
          {accessGroupEntrance.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            No bookings
          </Typography>
        ) : viewMode === "list" ? (
          /* ---- List view ---- */
          <List disablePadding>
            {accessGroupEntrance.map((entry: any) => {
              const ag = entry.accessGroup;
              if (!ag) return null;
              const persons: any[] =
                fullAgMap[ag.accessGroupId]?.persons ?? [];
              const schedules = scheduleMap[entry.groupToEntranceId];

              return (
                <ListItem
                  key={entry.groupToEntranceId}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(ag.accessGroupId)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                  divider
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <NextLink
                          href={getAccessGroupDetailsLink(ag)}
                          passHref
                          legacyBehavior
                        >
                          <Typography
                            variant="body1"
                            component="a"
                            sx={{
                              color: "inherit",
                              textDecoration: "none",
                              "&:hover": { textDecoration: "underline" },
                            }}
                          >
                            {ag?.accessGroupName ?? "(unnamed)"}
                          </Typography>
                        </NextLink>
                        <Tooltip
                          title={renderPersonsTooltip(persons)}
                          {...tooltipProps}
                        >
                          <InfoOutlinedIcon
                            fontSize="small"
                            sx={{
                              color: "text.secondary",
                              cursor: "default",
                            }}
                          />
                        </Tooltip>
                      </Box>
                    }
                    secondary={formatSchedule(schedules)}
                  />
                </ListItem>
              );
            })}
          </List>
        ) : (
          /* ---- Calendar view ---- */
          <>
            <BookingCalendar
              events={calendarEvents}
              onEventClick={(info) => {
                const agId = info.event.extendedProps?.accessGroupId;
                if (agId != null) {
                  router.push(
                    getAccessGroupDetailsLink({ accessGroupId: agId })
                  );
                }
              }}
            />

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Bookings
            </Typography>
            <Stack spacing={1}>
              {accessGroupEntrance.map((entry: any) => {
                const ag = entry.accessGroup;
                if (!ag) return null;
                const persons: any[] =
                  fullAgMap[ag.accessGroupId]?.persons ?? [];
                const color =
                  colorMap[ag.accessGroupId] ?? EVENT_COLORS[0];

                return (
                  <Box
                    key={entry.groupToEntranceId}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: color,
                        flexShrink: 0,
                      }}
                    />
                    <NextLink
                      href={getAccessGroupDetailsLink(ag)}
                      passHref
                      legacyBehavior
                    >
                      <Typography
                        variant="body2"
                        component="a"
                        sx={{
                          color: "inherit",
                          textDecoration: "none",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {ag.accessGroupName ?? "(unnamed)"}
                      </Typography>
                    </NextLink>
                    <Tooltip
                      title={renderPersonsTooltip(persons)}
                      {...tooltipProps}
                    >
                      <InfoOutlinedIcon
                        fontSize="small"
                        sx={{
                          color: "text.secondary",
                          cursor: "default",
                        }}
                      />
                    </Tooltip>
                    <Box sx={{ flex: 1 }} />
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(ag.accessGroupId)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                );
              })}
            </Stack>
          </>
        )}
        </CardContent>
      </Collapse>
    </Card>
  );
}
