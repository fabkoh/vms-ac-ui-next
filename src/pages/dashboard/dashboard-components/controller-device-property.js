import {
    Card,
    CardActionArea,
    CardContent,
    Divider,
    Typography,
    Table, TableBody, TableCell, TableHead, TableRow
  } from '@mui/material';
import { Scrollbar } from '../../../components/scrollbar';
import { ArrowRight as ArrowRightIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { controllerApi } from '../../../api/controllers';
import { useEffect, useState } from 'react';
import { ControllerDevicePropertyRow } from './controller-device-property-row';
import toast from "react-hot-toast";
  
  export const ControllerDeviceProperty = () => {
      const router = useRouter();
      const [controllers, setControllers] = useState([]);

      const handleClickController = () => {
      };

      // Sets number of controllers
      const getControllers = async () => {
          const controllersRes = await controllerApi.getControllers();
          if (controllersRes.status !== 200) {
            toast.error("Error loading controllers");
            return;
          }
          const controllersJson = await controllersRes.json();
          setControllers(controllersJson);
      };

      useEffect(() => {
        getControllers();
      }, []);
  
      return (
        <Card variant='outlined'>
            <CardContent>
                <Scrollbar>
                    <Table>
                        <TableHead sx={{ backgroundColor: "neutral.200" }}>
                            <TableRow>
                                <TableCell>Controller Name</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {controllers.map((controller) => (
                                <ControllerDevicePropertyRow key={controller.controllerId} controller={controller} />
                            ))}
                        </TableBody>
                    </Table>
                </Scrollbar>
            </CardContent>
        </Card>
      );
  }