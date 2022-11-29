import { useRouter } from 'next/router';
import * as Yup from 'yup';
import "yup-phone";
import { ErrorMessage, useFormik } from 'formik';
import { Box, Button, Checkbox, FormHelperText, TextField, Typography, Link, Select, MenuItem, InputLabel, Grid, InputAdornment } from '@mui/material';
import { useAuth } from '../../hooks/use-auth';
import { useMounted } from '../../hooks/use-mounted';
import { userApi } from '../../api/user';
import toast from "react-hot-toast";


export const JWTRegister = (props) => {
  const isMounted = useMounted();
  const router = useRouter();
  const { register } = useAuth();
  
  const formik = useFormik({
    initialValues: {
      email: '',
      firstName: '',
      lastName: '',
      mobileNumber: '',
      password: '',
      passwordConfirm: '',
      role: 'Admin-User',
      policy: false,
      submit: null
    },
    validationSchema: Yup.object({
      email: Yup
        .string()
        .email('Must be a valid email')
        .max(255)
        .required('Email is required'),
      firstName: Yup
        .string()
        .max(255)
        .required('First Name is required'),
      lastName: Yup
        .string()
        .max(255)
        .required('Last Name is required'),
      mobileNumber: Yup
        .string()
        .required('Mobile Number is required')
        .phone(),
      password: Yup
        .string()
        .min(7)
        .max(255)
        .required('Password is required'),
      passwordConfirm: Yup
        .string()
        .required('Please reconfirm password')
        .when("password", {
          is: val => (val && val.length > 0 ? true : false),
          then: Yup.string().oneOf(
            [Yup.ref("password")],
            "Both passwords need to be the same"
          )
        }),
      role: Yup
        .string()
        .required('Role is required')
      ,
      policy: Yup
        .boolean()
        .oneOf([true], 'This field must be checked')
    }),
    onSubmit: async (values, helpers) => {
      try {
        const userSettings = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          role: [values.role],
          mobile: values.mobileNumber
        }
        const res = await userApi.registerUser(userSettings);
        
        if (isMounted()) {
          if(res.status == 200){
            toast.success('You have successfully registered as a User')
            const returnUrl = router.query.returnUrl || '/dashboard';
            router.push(returnUrl);
          }
        }
      } catch (err) {
        toast.error('There has been an error with the registration.')
        console.error(err);

        if (isMounted()) {
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: err.message });
          helpers.setSubmitting(false);
        }
      }
    }
  });

  return (
    <form
      noValidate
      onSubmit={formik.handleSubmit}
      {...props}>
      <InputLabel id="role" sx={{ mt: 5, ml: 1 }}>Select Role</InputLabel>
      <Select
        id="role"
        error={Boolean(formik.touched.role && formik.errors.role)}
        sx={{ mb: 1 }}
        fullWidth
        name="role"
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        value={formik.values.role}
      >
        <MenuItem value="System-Admin">
          System Admin
        </MenuItem>
        <MenuItem value="Tech-Admin">
          Tech Admin
        </MenuItem>
        <MenuItem value="Admin-User">
          Admin User
        </MenuItem>
      </Select>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            error={Boolean(formik.touched.firstName && formik.errors.firstName)}
            fullWidth
            helperText={formik.touched.firstName && formik.errors.firstName}
            label="First Name"
            margin="normal"
            name="firstName"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.firstName}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            error={Boolean(formik.touched.lastName && formik.errors.lastName)}
            fullWidth
            helperText={formik.touched.lastName && formik.errors.lastName}
            label="Last Name"
            margin="normal"
            name="lastName"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.lastName}
          />
        </Grid>
      </Grid>
      
      <TextField
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
        error={Boolean(formik.touched.mobileNumber && formik.errors.mobileNumber)}
        fullWidth
        helperText={formik.touched.mobileNumber && formik.errors.mobileNumber}
        label="Mobile Number"
        margin="normal"
        name="mobileNumber"
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        value={formik.values.mobileNumber}
        InputProps={{
          startAdornment: <InputAdornment position="start">+</InputAdornment>,
        }}
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
      <TextField
        error={Boolean(formik.touched.passwordConfirm && formik.errors.passwordConfirm)}
        fullWidth
        helperText={formik.touched.passwordConfirm && formik.errors.passwordConfirm}
        label="Reconfirm Password"
        margin="normal"
        name="passwordConfirm"
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        type="password"
        value={formik.values.passwordConfirm}
      />
      
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          ml: -1,
          mt: 2
        }}
      >
        <Checkbox
          checked={formik.values.policy}
          name="policy"
          onChange={formik.handleChange}
        />
        <Typography
          color="textSecondary"
          variant="body2"
        >
          I have read the
          {' '}
          <Link
            component="a"
            href="#"
          >
            Terms and Conditions
          </Link>
        </Typography>
      </Box>
      {Boolean(formik.touched.policy && formik.errors.policy) && (
        <FormHelperText error>
          {formik.errors.policy}
        </FormHelperText>
      )}
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
          Register
        </Button>
      </Box>
    </form>
  );
};
