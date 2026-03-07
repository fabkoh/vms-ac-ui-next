import { Box, Typography } from '@mui/material';
import { Logo } from './logo';
import { keyframes } from '@emotion/react';
import Head from "next/head";

// import etlasname from '../components/etlas_logo_name.png'
// import Image from 'next/image'



const bounce1 = keyframes`
  0% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, 1px, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
`;

const bounce3 = keyframes`
  0% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, 3px, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
`;

export const SplashScreen = () => (
  <>
  <Head>
    <title>Etlas </title>
  </Head>
  <Box
    sx={{
      alignItems: 'center',
      backgroundColor: 'neutral.900',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      justifyContent: 'center',
      left: 0,
      p: 3,
      position: 'fixed',
      top: 0,
      width: '100vw',
      zIndex: 2000
    }}
  >
    <Logo
      sx={{
        height: 55,
        width: 55,
        '& path:nth-child(1)': {
          animation: `${bounce1} 1s ease-in-out infinite`
        },
        '& path:nth-child(3)': {
          animation: `${bounce3} 1s ease-in-out infinite`
        }
      }}
    />
    <h1>
      <Typography fontSize={10} color={'whitesmoke'}>
         Loading ...
      </Typography>
    </h1>
    {/* <Image src={etlasname}/> */}
  </Box>
  </>    
);
