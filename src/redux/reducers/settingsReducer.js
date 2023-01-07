import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const axios = require("axios");

const initialState = {
  loading: false,
  settings: [],
  checks: Array(10).fill(false),
  minXSDs: Array(10).fill(0),
  ids: Array(10).fill(-1),
};

export const getSettings = createAsyncThunk(
  "settings/getSettings",
  async () => {
    const response = await axios.get(`/setting`);

    return response.data;
  }
);

export const createNewMinXSD = createAsyncThunk(
  "settings/createNewMinXSD",
  async (request) => {
    const response = await axios.post("/setting", request);

    return response.data;
  }
);

export const updateMinXSD = createAsyncThunk(
  "settings/updateMinXSD",
  async (request) => {
    const { id, minXSD } = request;
    const response = await axios.put(`/setting/${id}`, { minXSD: minXSD });

    return response.data;
  }
);

export const enableSetting = createAsyncThunk(
  "settings/enableSetting",
  async (request) => {
    const { id } = request;
    const response = await axios.put(`/setting/${id}/enable`);

    return response.data;
  }
);

export const disableSetting = createAsyncThunk(
  "settings/disableSetting",
  async (request) => {
    const { id } = request;
    const response = await axios.put(`/setting/${id}/disable`);

    return response.data;
  }
);

export const { reducer, actions } = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetState(state, action) {
      state.loading = false;
      state.settings = [];
      state.checks = Array(10).fill(false);
      state.minXSDs = Array(10).fill(0);
      state.ids = Array(10).fill(-1);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSettings.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(getSettings.fulfilled, (state, action) => {
        const settings = action.payload;
        state.loading = false;
        state.settings = settings;

        settings.forEach((setting) => {
          state.ids = [
            ...state.ids.slice(0, setting.timeframe - 1),
            setting.id,
            ...state.ids.slice(setting.timeframe, 10),
          ];

          state.checks = [
            ...state.checks.slice(0, setting.timeframe - 1),
            setting.active,
            ...state.checks.slice(setting.timeframe, 10),
          ];

          state.minXSDs = [
            ...state.minXSDs.slice(0, setting.timeframe - 1),
            setting.minXSD,
            ...state.minXSDs.slice(setting.timeframe, 10),
          ];
        });
      })
      .addCase(getSettings.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(updateMinXSD.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(updateMinXSD.fulfilled, (state, action) => {
        state.loading = false;
        state.minXSDs = [
          ...state.minXSDs.slice(0, action.payload.timeframe - 1),
          action.payload.minXSD,
          ...state.minXSDs.slice(action.payload.timeframe, 10),
        ];
      })
      .addCase(updateMinXSD.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(createNewMinXSD.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(createNewMinXSD.fulfilled, (state, action) => {
        state.loading = false;

        state.ids = [
          ...state.ids.slice(0, action.payload.timeframe - 1),
          action.payload.id,
          ...state.ids.slice(action.payload.timeframe, 10),
        ];

        state.checks = [
          ...state.checks.slice(0, action.payload.timeframe - 1),
          action.payload.active,
          ...state.checks.slice(action.payload.timeframe, 10),
        ];

        state.minXSDs = [
          ...state.minXSDs.slice(0, action.payload.timeframe - 1),
          action.payload.minXSD,
          ...state.minXSDs.slice(action.payload.timeframe, 10),
        ];
      })
      .addCase(createNewMinXSD.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(enableSetting.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(enableSetting.fulfilled, (state, action) => {
        state.loading = false;
        state.checks = [
          ...state.checks.slice(0, action.payload.timeframe - 1),
          action.payload.active,
          ...state.checks.slice(action.payload.timeframe, 10),
        ];
      })
      .addCase(enableSetting.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(disableSetting.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(disableSetting.fulfilled, (state, action) => {
        state.loading = false;
        state.checks = [
          ...state.checks.slice(0, action.payload.timeframe - 1),
          action.payload.active,
          ...state.checks.slice(action.payload.timeframe, 10),
        ];
      })
      .addCase(disableSetting.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export const { resetState } = actions;

export default reducer;
