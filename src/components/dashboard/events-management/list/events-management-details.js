import PropTypes from 'prop-types';
import NextLink from 'next/link';
import { Card, CardHeader, Divider, Link, useMediaQuery, Typography, Chip } from '@mui/material';
import { PropertyList } from '../../../property-list'
import { PropertyListItem } from '../../../property-list-item';
import { SeverityPill } from '../../../severity-pill';
import WarningIcon from '@mui/icons-material/Warning';
import BasicDetailsCard from '../../shared/basic-details-card';
import { getAccessGroupDetailsLink, getAccessGroupLabel } from "../../../../utils/access-group";
import { LockClosed } from '../../../../icons/lock-closed';
import { displayEntranceOrController, eventActionInputText, eventActionOutputText, listDescription } from '../../../../utils/eventsManagement';

export const EventManagementDetails = (props) => {
  const { 
    eventsManagementId, 
    eventsManagementName, 
    eventsManagementNotification,
    inputEvents, 
    outputActions, 
    triggerSchedules,
    entrance,
    controller,
  } = props.eventManagement;
  
  const mdUp = useMediaQuery((theme) => theme.breakpoints.up('xs'));

  const align = mdUp ? 'horizontal' : 'vertical';

  return (
    <BasicDetailsCard>
      <PropertyList>
        <PropertyListItem
          align={align}
          divider
          label="Name"
          value={eventsManagementName}
        />
        <PropertyListItem
          align={align}
          divider
          label="Entrance/Controller"
          value={displayEntranceOrController(props.eventManagement)}
        />
        <PropertyListItem
          align={align}
          divider
          label="Input Events"
          value={inputEvents ? eventActionInputText(inputEvents): ""}
        />
        <PropertyListItem
          align={align}
          divider
          label="Output Actions"
          value={outputActions ? eventActionOutputText(outputActions): ""}
        /> 
        <PropertyListItem
          align={align}
          divider
          label="Trigger Schedules"
          value={triggerSchedules ? listDescription(props.eventManagement): ""}
        /> 
                  {/* {
            accessGroup ? (
              <Link component="a">
                <NextLink href={getAccessGroupDetailsLink(accessGroup)}
                  passHref>                
                  <Chip color={accessGroup.isActive &&  accessGroupInSchedule? "success" : "default"}
                        label={getAccessGroupLabel(accessGroup)}
                        icon={<LockClosed />}/>
                </NextLink>
              </Link>
            ) : (
              <SeverityPill color="warning">
                <WarningIcon fontSize="small"
                sx={{ mr: 1 }} />
                No access group
              </SeverityPill>
            )
          } */}
      </PropertyList>
    </BasicDetailsCard>
  );
};

