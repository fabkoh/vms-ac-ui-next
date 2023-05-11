import PropTypes from 'prop-types';
import { Card, CardHeader, Divider, Link, useMediaQuery, Typography, Chip } from '@mui/material';
import { SelectAll } from "@mui/icons-material";
import { PropertyList } from '../../../property-list'
import { PropertyListItem } from '../../../property-list-item';
import WarningIcon from '@mui/icons-material/Warning';
import BasicDetailsCard from '../../shared/basic-details-card';
import RenderTableCell from "../../../dashboard/shared/renderTableCell";


export const EventManagementNotifDetails = (props) => {
  const mdUp = useMediaQuery((theme) => theme.breakpoints.up('xs'));
  const align = mdUp ? 'horizontal' : 'vertical';
  console.log(props)
  const {
    eventsManagementNotificationContent,
    eventsManagementNotificationId,
    eventsManagementNotificationRecipients,
    eventsManagementNotificationTitle,
    eventsManagementNotificationType,
  } = props.eventManagementNotification;

    const recipientarr = eventsManagementNotificationRecipients.split(',')

    console.log(recipientarr)

    return (
      <BasicDetailsCard title={'Notification Details [' + eventsManagementNotificationType +']'}>
        <PropertyList>
          <PropertyListItem
            align={align}
            divider
            label="Recipients"
            value={
                recipientarr.map((e) => (
                  <Chip label={e}></Chip>
                ))
            }
          />
          { eventsManagementNotificationType=="EMAIL" ?
          <PropertyListItem
          align={align}
          divider
          label="Title"
          value={eventsManagementNotificationTitle}
          />: null}
          <PropertyListItem
            align={align}
            divider
            label="Content"
            value={eventsManagementNotificationContent}
          />
        </PropertyList>
      </BasicDetailsCard>
    ); 
};


