import React, { useRef, useState } from "react";
import { Box, Button, IconButton, TextField, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";

export function injectTimeIntoDtstart(
  rruleStr: string,
  timeStart: string
): string {
  if (!timeStart) return rruleStr;
  const [h, m] = timeStart.split(":");
  const hhmmss = h.padStart(2, "0") + m.padStart(2, "0") + "00";
  return rruleStr.replace(
    /(DTSTART[^:]*:\d{8})T\d{6}Z?/,
    `$1T${hhmmss}`
  );
}

export function calcDuration(timeStart: string, timeEnd: string): string {
  const [sh, sm] = (timeStart || "00:00").split(":").map(Number);
  const [eh, em] = (timeEnd || "01:00").split(":").map(Number);
  let totalMinutes = eh * 60 + em - (sh * 60 + sm);
  if (totalMinutes <= 0) totalMinutes = 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
}

export function formatTimeHHMM(date: Date): string {
  return (
    String(date.getHours()).padStart(2, "0") +
    ":" +
    String(date.getMinutes()).padStart(2, "0")
  );
}

export interface BookingCalendarProps {
  events: any[];
  selectable?: boolean;
  onSelect?: (info: { start: Date; end: Date; allDay: boolean }) => void;
  onEventClick?: (info: any) => void;
  height?: string | number;
  date?: Date | null;
  onDateChange?: (date: Date) => void;
}

export default function BookingCalendar({
  events,
  selectable = false,
  onSelect,
  onEventClick,
  height = "auto",
  date,
  onDateChange,
}: BookingCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [viewDate, setViewDate] = useState("");

  const plugins = selectable
    ? [timeGridPlugin, rrulePlugin, interactionPlugin]
    : [timeGridPlugin, rrulePlugin];

  function toDateString(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => calendarRef.current?.getApi().prev()}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => calendarRef.current?.getApi().next()}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
          <Button
            size="small"
            onClick={() => calendarRef.current?.getApi().today()}
            sx={{ ml: 0.5 }}
          >
            Today
          </Button>
        </Box>
        <TextField
          type="date"
          size="small"
          variant="standard"
          value={date ? toDateString(date) : viewDate}
          onChange={(e) => {
            if (!e.target.value) return;
            calendarRef.current?.getApi().gotoDate(e.target.value);
            if (onDateChange) {
              const [y, m, d] = e.target.value.split("-").map(Number);
              onDateChange(new Date(y, m - 1, d));
            }
          }}
          InputProps={{ disableUnderline: true }}
          inputProps={{
            style: { textAlign: "right", fontWeight: 600, fontSize: "1rem" },
          }}
          sx={{ width: 160 }}
        />
      </Box>

      <FullCalendar
        ref={calendarRef}
        plugins={plugins}
        initialView="timeGridWeek"
        headerToolbar={false}
        events={events}
        height={height}
        slotMinTime="00:00:00"
        slotMaxTime="24:00:00"
        allDaySlot
        nowIndicator
        selectable={selectable}
        selectMirror={selectable}
        select={
          onSelect
            ? (info) =>
                onSelect({
                  start: info.start,
                  end: info.end,
                  allDay: info.allDay,
                })
            : undefined
        }
        eventClick={onEventClick}
        datesSet={(info) => setViewDate(toDateString(info.view.currentStart))}
      />
    </Box>
  );
}
