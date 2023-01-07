import * as React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import * as Mui from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

// pages
import Main from "./pages/Main";
import Setting from "./pages/Setting";
import SignIn from "./pages/Auth/signin";
import SignUp from "./pages/Auth/signup";
import { verify } from "./redux/reducers/authReducer";
import MainProvider from "./pages/MainProvider";

import axios from "axios";

// const SERVER_API_URL_LOCAL = "http://localhost:5000/";
const SERVER_API_URL_DEPLOY = "https://phillip-stock-server.herokuapp.com/";

axios.defaults.baseURL = process.env.BASE_URL || SERVER_API_URL_DEPLOY;

export default function App() {
  const dispatch = useDispatch();
  const isVerifying = useSelector((state) => state.auth.isVerifying);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  React.useEffect(() => {
    dispatch(verify());
  }, [dispatch]);

  return isVerifying ? (
    <Mui.CircularProgress />
  ) : (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/main" /> : <Navigate to="/signin" />
        }
      />
      {isAuthenticated ? (
        <Route path="/" element={<MainProvider />}>
          <Route path="/main" element={<Main />} />
          <Route path="/setting" element={<Setting />} />
          <Route path="/*" element={<Navigate to="/main" />} />
        </Route>
      ) : (
        <Route>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/*" element={<Navigate to="/signin" />} />
        </Route>
      )}
    </Routes>
  );
}
