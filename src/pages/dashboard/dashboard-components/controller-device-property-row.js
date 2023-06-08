import {
    Card,
    CardActionArea,
    CardContent,
    Divider,
    Typography,
    TableRow,
    TableCell,
    Chip
  } from '@mui/material';
import { ArrowRight as ArrowRightIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { controllerApi } from '../../../api/controllers';
import { useEffect, useState } from 'react';
import toast from "react-hot-toast";

  
  const ControllerDevicePropertyRow = ({controller}) => {
      const {
        controllerId,
        controllerName,
      } = controller;
  
      const router = useRouter();
      const [temp, setTemp] = useState(0);
      const [cpu, setCpu] = useState(0);
      const [mem, setMem] = useState(0);

      const getProperties = async () => {
        const propertiesRes = await controllerApi.getPiProperty(controllerId);
        if (propertiesRes.status !== 200) {
          toast.error("Error loading properties");
          return;
        }
        const propertiesJson = await propertiesRes.json();
        setTemp(propertiesJson.Math.ceil(cpu_temperature));
        setCpu(propertiesJson.Math.ceil(cpu_usage_percentage));
        setMem(propertiesJson.Math.ceil(ram_usage_percentage));
      };

      // mem above 90% util
      // cpu above 90% util
      // temperature past 90 degrees

      useEffect(() => {
        getProperties();
      }, []);

      // Determine labels based on conditions
      const labels = [];
      if (temp >= 10) labels.push("CPU Temperature: " + temp + "°C");
      if (cpu >= 10) labels.push("CPU Usage: " + cpu + "%");
      if (mem >= 10) labels.push("Memory Usage: " + mem + "%");

      // piProperties are normal, no rendering of rows required
      if (labels.length === 0) {
        return null;
      } else {
        return (
          <TableRow>
            <TableCell>{controllerName}</TableCell>
            <TableCell>
            <div style={{ display: 'flex', gap: '8px' }}>
              {labels.map((label) => (
                <Chip key={label} label={label} color="error" />
              ))}
            </div>
            </TableCell>
          </TableRow>
        );
      }
  }

  export default ControllerDevicePropertyRow;