import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const axios = require("axios");

const setAuthToken = require("../../utils/setAuthToken").setAuthToken;

const initialState = {
  loading: false,
  isAuthenticated: false,
  isVerifying: true,
  user: {
    id: 0,
    name: "",
    email: "",
    avatar: "",
    role: 0,
  },
  errors: {},
};

// signin
export const signin = createAsyncThunk(
  "auth/signin",
  async (request, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post("/signin", request);

      const { token } = response.data;
      // set token to local storage
      localStorage.setItem("jwtToken", token);

      await dispatch(verify());

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// signup
export const signup = createAsyncThunk(
  "auth/signup",
  async (request, { rejectWithValue }) => {
    try {
      const response = await axios.post("/signup", request);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response.data);
    }
  }
);

// verify token
export const verify = createAsyncThunk("auth/verify", async () => {
  try {
    const response = await axios.post("/verify", {
      token: localStorage.getItem("jwtToken"),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
});

// update author
export const updateAuth = createAsyncThunk(
  "auth/updateAuth",
  async (request, { rejectWithValue }) => {
    try {
      const response = await axios.put("/" + request.id, {
        name: request.name,
        email: request.email,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response.data);
    }
  }
);

// reset password
export const resetPassword = createAsyncThunk(
  "auth/resetpassword",
  async (request, { rejectWithValue }) => {
    try {
      const response = await axios.post("/resetPassword", request);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response.data);
    }
  }
);

export const { reducer, actions } = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signout(state) {
      // remove token from local storage
      localStorage.removeItem("jwtToken");

      // set empty token
      setAuthToken("");
      state.isAuthenticated = false;
      state.user = {};
    },
    removeErrors(state, action) {
      state.errors = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signin.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(signin.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(signin.rejected, (state, action) => {
        state.loading = false;
        state.errors = action.payload;
      })
      .addCase(signup.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.errors = action.payload;
      })
      .addCase(verify.pending, (state, action) => {
        state.isVerifying = true;
      })
      .addCase(verify.fulfilled, (state, action) => {
        state.isVerifying = false;
        state.isAuthenticated = true;
        state.user = action.payload;

        setAuthToken(localStorage.getItem("jwtToken"));
      })
      .addCase(verify.rejected, (state, action) => {
        state.isVerifying = false;
        state.isAuthenticated = false;
      })
      .addCase(updateAuth.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(updateAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateAuth.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(resetPassword.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.errors = action.payload;
      });
  },
});

export const { signout, removeErrors } = actions;

export default reducer;
