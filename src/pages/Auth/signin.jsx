import React from "react";
import { useNavigate } from "react-router-dom";
import * as Mui from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";

import LoadingButton from "@mui/lab/LoadingButton";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { useDispatch, useSelector } from "react-redux";
import { signin, removeErrors } from "../../redux/reducers/authReducer";

import isEmpty from "../../utils/is-empty";

function SignIn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loading = useSelector((state) => state.auth.loading);
  const server_errors = useSelector((state) => state.auth.errors);

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email field is required")
      .email("Invalid Email"),
    password: Yup.string()
      .required("Password field is required")
      .min(8, "Password must be at least 8 characters")
      .max(30, "Password must not be greater than 30 characters"),
  });

  const handleSignIn = React.useCallback(
    async (values) => {
      const resultAction = await dispatch(signin(values));
      if (signin.fulfilled.match(resultAction)) navigate("/");
    },
    [dispatch, navigate]
  );

  return (
    <div className="login">
      <Mui.Container component="main" maxWidth="xs">
        <Mui.CssBaseline />
        <Mui.Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Mui.Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Mui.Avatar>
          <Mui.Typography component="h1" variant="h5">
            Sign In
          </Mui.Typography>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSignIn}
          >
            {({ handleSubmit, handleChange, errors, values, touched }) => (
              <Mui.Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{ mt: 1 }}
              >
                <Mui.TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(e) => {
                    handleChange(e);
                    if (!isEmpty(server_errors)) dispatch(removeErrors({}));
                  }}
                  error={
                    (touched.email && Boolean(errors.email)) ||
                    !isEmpty(server_errors?.email)
                  }
                  helperText={
                    (touched.email && errors.email) || server_errors?.email
                  }
                />

                <Mui.TextField
                  margin="normal"
                  required
                  fullWidth
                  id="password"
                  label="Password"
                  name="password"
                  type="password"
                  autoComplete="password"
                  value={values.password}
                  onChange={(e) => {
                    handleChange(e);
                    if (!isEmpty(server_errors)) dispatch(removeErrors({}));
                  }}
                  error={
                    (touched.password && Boolean(errors.password)) ||
                    !isEmpty(server_errors?.password)
                  }
                  helperText={
                    (touched.password && errors.password) ||
                    server_errors?.password
                  }
                />

                <LoadingButton
                  sx={{ marginY: 2 }}
                  type="submit"
                  loadingIndicator="Signining..."
                  loading={loading}
                  variant="contained"
                  onClick={() => handleSubmit()}
                  fullWidth
                >
                  Sign In
                </LoadingButton>
                <Mui.Grid container justifyContent="end" marginY={2}>
                  <Mui.Grid item>
                    <Mui.Link
                      href="#"
                      variant="body2"
                      onClick={() => navigate("/signup")}
                    >
                      Don't have an account? Sign Up
                    </Mui.Link>
                  </Mui.Grid>
                </Mui.Grid>
              </Mui.Box>
            )}
          </Formik>
        </Mui.Box>
      </Mui.Container>
    </div>
  );
}

export default SignIn;