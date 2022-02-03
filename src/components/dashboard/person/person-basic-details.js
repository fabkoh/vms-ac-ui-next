import PropTypes from 'prop-types';
import { Card, CardHeader, Divider, useMediaQuery } from '@mui/material';
import { PropertyList } from '../../property-list';
import { PropertyListItem } from '../../property-list-item';
import { SeverityPill } from '../../severity-pill';
import WarningIcon from '@mui/icons-material/Warning';

export const PersonBasicDetails = (props) => {
  const { 
    personFirstName, 
    personLastName, 
    personUid, 
    personMobileNumber, 
    personEmail } = props.person;
  
  const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));

  const align = mdUp ? 'horizontal' : 'vertical';

  return (
    <Card>
      <CardHeader title="Basic Details" />
      <Divider />
      <PropertyList>
        <PropertyListItem
          align={align}
          divider
          label="First Name"
          value={personFirstName}
        />
        <PropertyListItem
          align={align}
          divider
          label="Last Name"
          value={personLastName}
        />
        <PropertyListItem
          align={align}
          divider
          label="UID"
          value={personUid}
        />
        <PropertyListItem
          align={align}
          divider
          label="Mobile Number"
          value={personMobileNumber}
        >
          { !personMobileNumber && (
            <SeverityPill
              color='warning'
            >
              <WarningIcon fontSize="small" />
              No mobile number
            </SeverityPill>
          )}
        </PropertyListItem>                   
        <PropertyListItem
          align={align}
          divider
          label="Email"
          value={personEmail}
        >
          { !personEmail && (
            <SeverityPill
              color='warning'
            >
              <WarningIcon fontSize="small" />
              No email
            </SeverityPill>
          )}
        </PropertyListItem>
      </PropertyList>
    </Card>
  );
};

PersonBasicDetails.propTypes = {
  personFirstName: PropTypes.string.isRequired,
  personLastName: PropTypes.string.isRequired,
  personUid: PropTypes.string.isRequired,
  personMobileNumber: PropTypes.string,
  personEmail: PropTypes.string
};
