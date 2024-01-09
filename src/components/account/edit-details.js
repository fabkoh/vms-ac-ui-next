import { useRouter } from "next/router";
import * as Yup from "yup";
import "yup-phone";
import { ErrorMessage, useFormik, Formik, Form } from "formik";
import {
  Box,
  Button,
  Checkbox,
  FormHelperText,
  TextField,
  Typography,
  Link,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  InputAdornment,
} from "@mui/material";
import { useAuth } from "../../hooks/use-auth";
import { useMounted } from "../../hooks/use-mounted";
import MuiPhoneNumber from "material-ui-phone-number";
import { authEditProfile } from "../../api/auth-api";
import toast from "react-hot-toast";

export const EditAccountDetails = (accountDetails) => {
  const isMounted = useMounted();
  const router = useRouter();
  const { register } = useAuth();

  const handlePersonMobileNumberChange = () =>
    onPersonMobileNumberChange(personMobileNumberRef);

  const formik = useFormik({
    initialValues: {
      email: accountDetails.props.email,
      firstName: accountDetails.props.firstName,
      lastName: accountDetails.props.lastName,
      mobileNumber: accountDetails.props.mobile,
      submit: null,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Must be a valid email")
        .max(255)
        .required("Email is required"),
      firstName: Yup.string()
        .min(3, "Must be at least 3 characters")
        .max(20, "Must be at most 20 characters")
        .required("First Name is required"),
      lastName: Yup.string()
        .min(3, "Must be at least 3 characters")
        .max(20, "Must be at most 20 characters")
        .required("Last Name is required"),
        mobileNumber: Yup.string()
        .required("Mobile Number is required")
    }),



    onSubmit: async (values, helpers) => {
      try {
        const userSettings = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          role: [values.role],
          mobile: values.mobileNumber,
          password: "asdasd",
        };
        const res = await authEditProfile(userSettings);
        if (res.type == "success") {
          toast.success("You have successfully edited your user details");
        }
      } catch (err) {
        toast.error("There has been an error, please try again.");
        console.error(err);

        if (isMounted()) {
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: err.message });
          helpers.setSubmitting(false);
        }
      }
    },
  });

  return (
    <form noValidate onSubmit={formik.handleSubmit}>
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
            required
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
            required
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
        required
      />
      <MuiPhoneNumber
        fullWidth
        label="Mobile Number"
        name="mobileNumber"
        defaultCountry="sg"
        onChange={formik.handleChange}
        value={formik.values.mobileNumber || "+65"}
        variant="outlined"
        required
        error={Boolean(formik.touched.mobileNumber && formik.errors.mobileNumber)}
        helperText={formik.touched.mobileNumber && formik.errors.mobileNumber}
      />

      {formik.errors.submit && (
        <Box sx={{ mt: 3 }}>
          <FormHelperText error>{formik.errors.submit}</FormHelperText>
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
          Save Changes
        </Button>
      </Box>
    </form>
  );
};
