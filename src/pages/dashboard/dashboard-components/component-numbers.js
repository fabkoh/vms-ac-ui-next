import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import { controllerApi } from '../../../api/controllers'; 
import videoRecorderApi from '../../../api/videorecorder';
import { personApi } from '../../../api/person';
import entranceApi from '../../../api/entrance';
import { accessGroupApi } from '../../../api/access-groups';

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

    // Renders based on numberType
    useEffect(() => {
        if (numberType === 'Controllers') {
          getControllers();
        } else if (numberType === 'Video Recorders') {
          getVideoRecorders();
        } else if (numberType === 'Persons') {
          getPersons();
        } else if (numberType === 'Entrances') {
          getEntrances();
        } else if (numberType === 'Access Groups') {
          getAccessGroups();
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
