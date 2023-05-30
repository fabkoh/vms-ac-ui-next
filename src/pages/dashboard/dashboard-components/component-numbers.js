import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import { controllerApi } from '../../../api/controllers'; 
import videoRecorderApi from '../../../api/videorecorder';

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

    // Renders based on numberType
    useEffect(() => {
        if (numberType === 'Controllers') {
          getControllers();
        } else if (numberType === 'Video Recorders') {
          getVideoRecorders();
        } else {
          setCountType(0);
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
