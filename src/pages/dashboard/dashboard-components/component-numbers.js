import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import { controllerApi } from '../../../api/controllers'; 
import videoRecorderApi from '../../../api/videorecorder';
import { personApi } from '../../../api/person';
import entranceApi from '../../../api/entrance';
import { accessGroupApi } from '../../../api/access-groups';
import { eventslogsApi } from '../../../api/events';
import { notificationLogsApi } from '../../../api/notifications-log';
import toast from "react-hot-toast";

export const ComponentNumbers = (props) => {
    const {
        numberType
    } = props;

    const [countType, setCountType] = useState(0);

    // Sets number of controllers
    const getControllers = async () => {
        const controllersRes = await controllerApi.getControllers();
        if (controllersRes.status !== 200) {
          toast.error("Error loading controllers");
          return;
        }
        const controllersJson = await controllersRes.json();
        setCountType(controllersJson.length);
    };

    // Sets number of video recorders
    const getVideoRecorders = async () => {
        const recordersRes = await videoRecorderApi.getRecorders();
        if (recordersRes.status !== 200) {
          toast.error("Error loading video recorders");
          return;
        }
        const recordersJson = await recordersRes.json();
        setCountType(recordersJson.length);
    };
  
    // Set number of persons
    const getPersons = async () => {
        const personsRes = await personApi.getPersons();
        if (personsRes.status !== 200) {
          toast.error("Error loading persons");
          return;
        }
        const personsJson = await personsRes.json();
        setCountType(personsJson.length);
    };

    // Set number of entrances
    const getEntrances = async () => {
      const entrancesRes = await entranceApi.getEntrances();
      if (entrancesRes.status !== 200) {
        toast.error("Error loading entrances");
        return;
      }
      const entrancesJson = await entrancesRes.json();
      setCountType(entrancesJson.length);
    };

    // Set number of access groups
    const getAccessGroups = async () => {
      const accessGroupRes = await accessGroupApi.getAccessGroups();
      if (accessGroupRes.status !== 200) {
        toast.error("Error loading entrances");
        return;
      }
      const accessGroupJson = await accessGroupRes.json();
      setCountType(accessGroupJson.length);
    };

    // Set number of event logs
    const getEventLogs = async () => {
      console.log("event is checked");
      const eventsRes = await eventslogsApi.getEventsCount();
      if (eventsRes.status !== 200) {
        toast.error("Error loading event logs");
        return;
      }
      const eventsJson = await eventsRes.json();
      console.log("events");
      console.log(eventsJson);
      setCountType(eventsJson);
    };

    // Set number of notification logs
    const getNotificationLogs = async () => {
      const notifRes = await notificationLogsApi.getNotifsCount();
      if (notifRes.status !== 200) {
        toast.error("Error loading notification logs");
        return;
      }
      const notifJson = await notifRes.json();
      setCountType(notifJson);
    };

    // Renders based on numberType
    useEffect(() => {
        if (numberType === 'Controllers') {
          getControllers();
        } else if (numberType === 'Recorders') {
          getVideoRecorders();
        } else if (numberType === 'Persons') {
          getPersons();
        } else if (numberType === 'Entrances') {
          getEntrances();
        } else if (numberType === 'Access Groups') {
          getAccessGroups();
        } else if (numberType === 'Events') {
          getEventLogs();
        } else if (numberType === 'Notifications') {
          getNotificationLogs();
        }
      }, [numberType]);

    return (
        <Typography
        fontSize={30}
        color="textPrimary"
        variant="overline"
        >
            {countType}
        </Typography>
    );
}
