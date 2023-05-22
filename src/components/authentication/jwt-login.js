import { useRouter } from 'next/router';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Alert, Box, Button, FormHelperText, TextField } from '@mui/material';
import { useAuth } from '../../hooks/use-auth';
import { useMounted } from '../../hooks/use-mounted';
import { useEffect, useState } from "react";
import { sendApi } from "../../api/api-helpers";

export const JWTLogin = (props) => {
  const isMounted = useMounted();
  const router = useRouter();
  const { login } = useAuth();
  // const [isPolling, setIsPolling] = useState(false);

  // useEffect(
  //   () => {
  //     let timer;
  //     console.log("refreshToken useEffect");
  //     console.log(isPolling);

  //     if (isPolling) {
  //       console.log("isPolling is true")
  //       timer = setInterval(() => {
  //         refreshTokenChecker();
  //       }, 5 * 1000);
  //     } else {
  //       return () => clearInterval(timer);
  //     }
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [isPolling]
  // );

  

  // const refreshTokenChecker = async () => {
  //   try {
  //     console.log("refreshTokenChecker");

  //     const response = await sendApi("/api/auth/refreshTokenChecker", {
  //       method: "POST",
  //       body: JSON.stringify({ refreshToken: localStorage.getItem("refreshToken") })
  //     },
  //       false);

  //     if (response.status === 404) {
  //       console.log("refreshTokenChecker 404");
  //       // Stop the interval when refreshTokenChecker API returns 404
  //       setIsPolling(false);

  //       // // Redirect to login page
  //       router.replace("");
  //     }
  //   } catch (error) {
  //     console.error("Error here")
  //     console.error("Error:", error);
  //     // Stop the interval when an error occurs
  //     setIsPolling(false);
  //   }
  // }

  const formik = useFormik({
    initialValues: {
      email: 'ISSAdmin@isssecurity.sg',
      password: 'ISSAdmin',
      submit: null
    },
    validationSchema: Yup.object({
      email: Yup
        .string()
        .email('Must be a valid email')
        .max(255)
        .required('Email is required'),
      password: Yup
        .string()
        .max(255)
        .required('Password is required')
    }),
    onSubmit: async (values, helpers) => {
      const res = await login(values.email, values.password);
      if (res.type === "success") {
        if (isMounted()) {
          // console.log("JWTLogin onSubmit");
          // setIsPolling(true);
          const returnUrl = router.query.returnUrl || '/dashboard';
          router.push(returnUrl);
        }
      }
      else {
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: res.response.message });
        helpers.setSubmitting(false);
      }

    }
  });

  return (
    <form
      noValidate
      onSubmit={formik.handleSubmit}
      {...props}>
      <TextField
        autoFocus
        error={Boolean(formik.touched.email && formik.errors.email)}
        fullWidth
        helperText={formik.touched.email && formik.errors.email}
        label="Email Address"
        margin="normal"
        name="email"
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        type="email"
        value={formik.values.email}
      />
      <TextField
        error={Boolean(formik.touched.password && formik.errors.password)}
        fullWidth
        helperText={formik.touched.password && formik.errors.password}
        label="Password"
        margin="normal"
        name="password"
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        type="password"
        value={formik.values.password}
      />
      {formik.errors.submit && (
        <Box sx={{ mt: 3 }}>
          <FormHelperText error>
            {formik.errors.submit}
          </FormHelperText>
        </Box>
      )}
      <Box sx={{ mt: 2 }}>
        <Button
          disabled={formik.isSubmitting}
          fullWidth
          size="large"
          type="submit"
          variant="contained"
        >
          Log In
        </Button>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Alert severity="info">
          <div>
            Use
            {' '}
            <b>ISSAdmin@isssecurity.sg</b>
            {' '}
            and password
            {' '}
            <b>ISSAdmin</b>
          </div>
        </Alert>
      </Box>
    </form>
  );
};
