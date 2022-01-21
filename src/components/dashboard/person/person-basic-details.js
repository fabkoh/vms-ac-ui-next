import PropTypes from 'prop-types';
import { Card, CardHeader, Divider, useMediaQuery } from '@mui/material';
import { PropertyList } from '../../property-list';
import { PropertyListItem } from '../../property-list-item';
import { SeverityPill } from '../../severity-pill';
import WarningIcon from '@mui/icons-material/Warning';

export const PersonBasicDetails = (props) => {
  const { firstName, lastName, uid, mobileNumber, email, ...other } = props;
  const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));

  const align = mdUp ? 'horizontal' : 'vertical';

  return (
    <Card {...other}>
      <CardHeader title="Basic Details" />
      <Divider />
      <PropertyList>
        <PropertyListItem
          align={align}
          divider
          label="First Name"
          value={firstName}
        />
        <PropertyListItem
          align={align}
          divider
          label="Last Name"
          value={lastName}
        />
        <PropertyListItem
          align={align}
          divider
          label="UID"
          value={uid}
        />
        <PropertyListItem
          align={align}
          divider
          label="Mobile Number"
          value={mobileNumber}
          children={!mobileNumber && (
            <SeverityPill
              color='warning'
            >
              <WarningIcon fontSize="small" />
              No mobile number
            </SeverityPill>
          )}
        />                   
        <PropertyListItem
          align={align}
          divider
          label="Email"
          value={email}
          children={!email && (
            <SeverityPill
              color='warning'
            >
              <WarningIcon fontSize="small" />
              No email
            </SeverityPill>
          )}
        />
      </PropertyList>
    </Card>
  );
};

PersonBasicDetails.propTypes = {
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  uid: PropTypes.string.isRequired,
  mobileNumber: PropTypes.string,
  email: PropTypes.string
};
