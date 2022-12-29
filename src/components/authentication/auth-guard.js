import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useAuth } from '../../hooks/use-auth';

export const AuthGuard = (props) => {
  const { children } = props;
  const { user } = useAuth;
  const auth = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
      if (!router.isReady) {
        return;
      }

      if (!auth.isAuthenticated) {
        router.push({
          pathname: '/authentication/login',
          query: { returnUrl: router.asPath }
        });    
      } else {
        // add a condition to check the page and roles allowed to access
        
        // if any of the given role is not present redirect back  
        if(props.page==='Controllers' && user && !( 
            user.authorities.some(pair => pair.authority === "ROLE_SYSTEM_ADMIN")|| 
            user.authorities.some(pair => pair.authority === "ROLE_TECH_ADMIN")) ) 
            
        {
          router.back();        
        }
        // else go forward
        setChecked(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.isReady]);

  if (!checked) {
    return null;
  }

  // If got here, it means that the redirect did not occur, and that tells us that the user is
  // authenticated / authorized.

  return <>{children}</>;
};

AuthGuard.propTypes = {
  children: PropTypes.node
};
