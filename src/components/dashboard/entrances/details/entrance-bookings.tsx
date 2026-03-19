import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import NextLink from "next/link";
import router from "next/router";
import toast from "react-hot-toast";
import { rrulestr } from "rrule";
import { accessGroupApi } from "../../../../api/access-groups";
import { accessGroupScheduleApi } from "../../../../api/access-group-schedules";
import accessGroupEntranceApi from "../../../../api/access-group-entrance-n-to-n";
import { getBookingCreateLink } from "../../../../utils/entrance";
import { getAccessGroupDetailsLink } from "../../../../utils/access-group";
import rruleDescription from "../../../../utils/rrule-desc";

interface Props {
  entranceId: string | number;
  accessGroupEntrance: any[];
  onDeleted: () => void;
}

export default function EntranceBookings({ entranceId, accessGroupEntrance, onDeleted }: Props) {
  const [scheduleMap, setScheduleMap] = useState<Record<number, any[]>>({});
  // keyed by accessGroupId → full access group (with persons)
  const [fullAgMap, setFullAgMap] = useState<Record<number, any>>({});

  useEffect(() => {
    if (accessGroupEntrance.length === 0) return;
    accessGroupEntrance.forEach((entry) => {
      const agId = entry.accessGroup?.accessGroupId;
      if (agId == null) return;
      accessGroupApi.getAccessGroup(agId).then(async (res) => {
        if (res.status !== 200) return;
        const body = await res.json();
        setFullAgMap((prev) => ({ ...prev, [agId]: body }));
      });
    });
    const ids = accessGroupEntrance.map((e) => e.groupToEntranceId);
    accessGroupScheduleApi
      .getAccessGroupSchedulesWhereGroupToEntranceIdsIn(ids)
      ?.then(async (res) => {
        if (res.status !== 200) return;
        const body: any[] = await res.json();
        const map: Record<number, any[]> = {};
        body.forEach((s) => {
          const gteId = s.groupToEntranceId;
          if (!map[gteId]) map[gteId] = [];
          map[gteId].push(s);
        });
        setScheduleMap(map);
      });
  }, [accessGroupEntrance]);

  const handleDelete = async (accessGroupId: number) => {
    try {
      // Unlink entrance(s) from the access group — this also soft-deletes
      // the N-to-N rows and their associated schedules on the backend.
      const unlinkRes = await accessGroupEntranceApi.assignEntrancesToAccessGroup([], accessGroupId);
      if (unlinkRes && unlinkRes.status !== 204) {
        throw new Error("Failed to unlink booking from entrance");
      }

      // Now safe to delete the (now-orphaned) access group itself.
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

  return (
    <Card>
      <CardHeader
        title="Meeting Room Bookings"
        action={
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            size="small"
            onClick={() => router.push(getBookingCreateLink(entranceId))}
          >
            New Booking
          </Button>
        }
      />
      <Divider />
      <CardContent>
        {accessGroupEntrance.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            No bookings
          </Typography>
        ) : (
          <List disablePadding>
            {accessGroupEntrance.map((entry) => {
              const ag = entry.accessGroup;
              const persons: any[] = fullAgMap[ag?.accessGroupId]?.persons ?? [];
              const schedules = scheduleMap[entry.groupToEntranceId];

              const personsTooltip = (
                <Box sx={{ maxHeight: 250, overflowY: "auto", p: 0.5 }}>
                  {persons.length > 0 ? (
                    persons.map((p) => (
                      <Typography key={p.personId} variant="body2" sx={{ py: 0.25 }}>
                        {[p.personFirstName, p.personLastName].filter(Boolean).join(" ") ||
                          `Person #${p.personId}`}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2">No persons</Typography>
                  )}
                </Box>
              );

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
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <NextLink
                          href={getAccessGroupDetailsLink(ag)}
                          passHref
                          legacyBehavior
                        >
                          <Typography
                            variant="body1"
                            component="a"
                            sx={{ color: "inherit", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                          >
                            {ag?.accessGroupName ?? "(unnamed)"}
                          </Typography>
                        </NextLink>
                        <Tooltip
                          title={personsTooltip}
                          arrow
                          componentsProps={{
                            tooltip: { sx: { maxWidth: 280, bgcolor: "background.paper", color: "text.primary", boxShadow: 3, p: 1 } },
                            arrow: { sx: { color: "background.paper" } },
                          }}
                        >
                          <InfoOutlinedIcon fontSize="small" sx={{ color: "text.secondary", cursor: "default" }} />
                        </Tooltip>
                      </Box>
                    }
                    secondary={formatSchedule(schedules)}
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
