import {
    Card,
    CardActionArea,
    CardContent,
    Divider,
    Typography,
    TableRow,
    TableCell,
  } from '@mui/material';
import { ArrowRight as ArrowRightIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { controllerApi } from '../../../api/controllers';
import { useEffect, useState } from 'react';
import toast from "react-hot-toast";

  
  export const ControllerDevicePropertyRow = (controller) => {
      const {
        controllerId,
        controllerName,
        controllerIP,
        created,
        lastSync,
      } = controller;
  
      const router = useRouter();
      const [properties, setProperties] = useState("Controller is okay.");

      const getProperties = async () => {
        const propertiesRes = await controllerApi.getPiProperty(controllerId);
        if (propertiesRes.status !== 200) {
          toast.error("Error loading properties");
          return;
        }
        const propertiesJson = await propertiesRes.json();
        setProperties(propertiesJson);
      };

      useEffect(() => {
        getProperties();
      }, []);
  
      return (
                        <TableRow>
                            <TableCell>{controllerName}</TableCell>
                            <TableCell>{properties}</TableCell>
                        </TableRow>
      );
  }