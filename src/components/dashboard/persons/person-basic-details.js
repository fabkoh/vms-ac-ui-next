import PropTypes from 'prop-types';
import NextLink from 'next/link';
import { Card, CardHeader, Divider, Link, useMediaQuery, Typography, Chip } from '@mui/material';
import { PropertyList } from '../../property-list';
import { PropertyListItem } from '../../property-list-item';
import { SeverityPill } from '../../severity-pill';
import WarningIcon from '@mui/icons-material/Warning';
import BasicDetailsCard from '../shared/basic-details-card';
import { getAccessGroupDetailsLink, getAccessGroupLabel } from "../../../utils/access-group";
import { LockClosed } from '../../../icons/lock-closed';

export const PersonBasicDetails = (props) => {
  const { 
    personFirstName, 
    personLastName, 
    personUid, 
    personMobileNumber, 
    personEmail,
    accessGroup
  } = props.person;
  
  const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));

  const align = mdUp ? 'horizontal' : 'vertical';

  return (
    <BasicDetailsCard>
      <PropertyList>
        <PropertyListItem
          align={align}
          divider
          label="First name"
          value={personFirstName}
        />
        <PropertyListItem
          align={align}
          divider
          label="Last name"
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
          label="Mobile number"
          value={personMobileNumber}
        >
          { !personMobileNumber && (
            <SeverityPill
              color='warning'
            >
              <WarningIcon fontSize="small"
sx={{ mr: 1 }} />
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
              <WarningIcon fontSize="small"
sx={{ mr: 1 }} />
              No email
            </SeverityPill>
          )}
        </PropertyListItem>
        <PropertyListItem
          align={align}
          divider
          label="Access group"
        >
          {
            accessGroup ? (
              <Link component="a">
                <NextLink href={getAccessGroupDetailsLink(accessGroup)}
                  passHref>                
                  <Chip color={accessGroup.isActive ? "default" : "error"}
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
          }
        </PropertyListItem>
      </PropertyList>
    </BasicDetailsCard>
  );
};

PersonBasicDetails.propTypes = {
  personFirstName: PropTypes.string.isRequired,
  personLastName: PropTypes.string.isRequired,
  personUid: PropTypes.string.isRequired,
  personMobileNumber: PropTypes.string,
  personEmail: PropTypes.string
};
