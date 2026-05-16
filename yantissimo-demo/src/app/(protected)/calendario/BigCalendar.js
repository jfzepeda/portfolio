// src/components/BigCalendar.js
"use client";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "~/styles/CalendarStyles.css";

import moment from "moment";
import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";

const localizer = momentLocalizer(moment);

const EVENT_COLORS = {
  completed: "#9E9A92",
  ongoing: "#2E7D52",
  event: "#1A7A6E",
  default: "#6366F1",
};

const CustomEvent = ({ event }) => {
  const ext = event.extendedProps || {};
  return (
    <div style={{ padding: "3px 5px", lineHeight: 1.3, overflow: "hidden" }}>
      <div
        style={{
          fontWeight: 600,
          fontSize: "0.8rem",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {event.sucursal}-{ext.id ?? event.id}
      </div>
      {ext.client_name && (
        <div
          style={{
            fontSize: "0.72rem",
            opacity: 0.9,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginTop: 1,
          }}
        >
          {ext.client_name}
        </div>
      )}
      {ext.technician && (
        <div
          style={{
            fontSize: "0.70rem",
            opacity: 0.75,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {ext.technician}
        </div>
      )}
    </div>
  );
};

const BigCalendar = ({ events, handleDateClick, handleEventClick, ramps }) => {
  const [currentView, setCurrentView] = useState("day");
  console.debug("Ramps prop in BigCalendar:", ramps);

  const resources = ramps.map((rampa) => ({
    resourceId: rampa,
    resourceTitle: rampa,
  }));

  const mappedEvents = events.map((event) => ({
    ...event,
    start_at: event.start_at.toDate
      ? event.start_at.toDate()
      : new Date(event.start_at),
    end_at: event.end_at.toDate
      ? event.end_at.toDate()
      : new Date(event.end_at),
  }));

  const onViewChange = (view) => {
    setCurrentView(view);
  };

  const eventPropGetter = (event) => {
    const type = event.extendedProps?.type;
    const backgroundColor = EVENT_COLORS[type] ?? EVENT_COLORS.default;
    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        opacity: 1,
        color: "white",
        border: "none",
        display: "block",
        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
      },
    };
  };

  const extraProps =
    currentView === "day"
      ? {
          resources,
          resourceIdAccessor: "resourceId",
          resourceTitleAccessor: "resourceTitle",
        }
      : {};

  return (
    <Calendar
      defaultView="day"
      localizer={localizer}
      events={mappedEvents}
      startAccessor="start_at"
      endAccessor="end_at"
      style={{ height: 700 }}
      min={new Date(2021, 0, 1, 9, 0)}
      max={new Date(2021, 0, 1, 19, 0)}
      selectable
      onSelectSlot={(slotInfo) => {
        handleDateClick(slotInfo.start, slotInfo.resourceId);
      }}
      onSelectEvent={(event) => {
        handleEventClick({ event });
      }}
      onView={onViewChange}
      eventPropGetter={eventPropGetter}
      components={{ event: CustomEvent }}
      {...extraProps}
    />
  );
};

export default BigCalendar;
