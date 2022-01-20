import PropTypes from 'prop-types';
import { Button, Card, CardActions, CardHeader, Divider, useMediaQuery } from '@mui/material';
import { PropertyList } from '../../property-list';
import { PropertyListItem } from '../../property-list-item';

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
        />
        <PropertyListItem
          align={align}
          divider
          label="Email"
          value={email}
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
