import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const axios = require("axios");

export const ranges = [
  {
    type: 1,
    days: 7,
    label: "1w",
  },
  {
    type: 2,
    days: 31,
    label: "1m",
  },
  {
    type: 3,
    days: 95,
    label: "3m",
  },
  {
    type: 4,
    days: 183,
    label: "6m",
  },
  {
    type: 5,
    days: 365,
    label: "1y",
  },
  {
    type: 6,
    days: 365 * 2,
    label: "2y",
  },
  {
    type: 7,
    days: 365 * 3,
    label: "3y",
  },
  {
    type: 8,
    days: 365 * 5,
    label: "5y",
  },
  {
    type: 9,
    days: 365 * 10,
    label: "10y",
  },
  {
    type: 10,
    label: "all",
  },
];

export const indexes = [
  { symbol: "^IBEX", no: 0 },
  { symbol: "^RUA", no: 1 },
  { symbol: "^AEX", no: 2 },
  { symbol: "^DJT", no: 3 },
  { symbol: "^MID", no: 4 },
  { symbol: "^NDX", no: 5 },
  { symbol: "^STI", no: 6 },
  { symbol: "^BVSP", no: 7 },
  { symbol: "^MXX", no: 8 },
  { symbol: "^FTSE", no: 9 },
  { symbol: "^GSPC", no: 10 },
  { symbol: "^IXIC", no: 11 },
  { symbol: "^BSESN", no: 12 },
  { symbol: "^KS11", no: 13 },
  { symbol: "^KLSE", no: 14 },
  { symbol: "^TWII", no: 15 },
  { symbol: "^N225", no: 16 },
  { symbol: "^NZ50", no: 17 },
  { symbol: "^AORD", no: 18 },
  { symbol: "^RUT", no: 19 },
  { symbol: "^GDAXI", no: 20 },
  { symbol: "^JKSE", no: 21 },
  { symbol: "^HSI", no: 22 },
  { symbol: "^NSEI", no: 23 },
  { symbol: "^NSEBANK", no: 24 },
  { symbol: "IMOEX.ME", no: 25 },
  { symbol: "^FCHI", no: 26 },
  { symbol: "^TA125.TA", no: 27 },
  { symbol: "^HSCE", no: 28 },
];

export const getDate = (date) => {
  return (
    date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
  );
};

const initialState = {
  loading: false,
  rangeType: 5,
  fromDate: new Date(),
  toDate: new Date(),
  pageSize: 50,
  rows: [],
  from: getDate(new Date(new Date().getTime() - 365 * 24 * 3600 * 1000)),
  to: getDate(new Date()),
  currentSymbols: [],
  currentRowId: 0,
  currentR: 0,
};

// run process
export const analyzeIndice = createAsyncThunk(
  "main/analyzeIndice",
  async (req) => {
    const response = await axios.get(`/analyze/${req.range}`);
    return response.data;
  }
);

export const { reducer, actions } = createSlice({
  name: "main",
  initialState,
  reducers: {
    setRangeType(state, action) {
      state.rangeType = action.payload.rangeType;
    },
    setFromDate(state, action) {
      state.fromDate = action.payload.fromDate;
    },
    setToDate(state, action) {
      state.toDate = action.payload.toDate;
    },
    setLoading(state, action) {
      state.loading = action.payload.loading;
    },
    setPageSize(state, action) {
      state.pageSize = action.payload.pageSize;
    },
    setFrom(state, action) {
      state.from = action.payload.from;
    },
    setTo(state, action) {
      state.to = action.payload.to;
    },
    setCurrentSymbols(state, action) {
      state.currentSymbols = action.payload.currentSymbols;
    },
    setCurrentRowId(state, action) {
      state.currentRowId = action.payload.currentRowId;
    },
    setCurrentR(state, action) {
      state.currentR = action.payload.currentR;
    },
    rangeChange(state, action) {
      const { rangeType } = action.payload;
      state.rangeType = rangeType;
      let date = new Date();
      const to = getDate(date);
      date.setDate(date.getDate() - ranges[rangeType - 1].days);
      const from = rangeType === 10 ? "2000-10-10" : getDate(date);
      state.from = from;
      state.to = to;
    },
    tagChange(state, action) {
      const { tags } = action.payload;
      let symbols = [];
      tags.map((tag) => symbols.push(tag.symbol));
      if (tags.length === 2) {
        // get all pairs
        let pairs = indexes.reduce(
          (acc, first, i) =>
            acc.concat(
              indexes.slice(i + 1).map((second) => ({ first, second }))
            ),
          []
        );

        const found = pairs.find(
          (pair) =>
            (pair.first.symbol === tags[0].symbol &&
              pair.second.symbol === tags[1].symbol) ||
            (pair.second.symbol === tags[0].symbol &&
              pair.first.symbol === tags[1].symbol)
        );

        const R = state.rows.find(
          (row) => row.pair === found.first.symbol + "-" + found.second.symbol
        ).correlation;

        state.currentSymbols = [found.first.symbol, found.second.symbol];
        state.currentRowId = pairs.indexOf(found);
        state.currentR = R;
      }
    },
    resetState(state, action) {
      state.rangeType = 5;
      state.fromDate = new Date();
      state.toDate = new Date();
      state.pageSize = 50;
      state.rows = [];
      state.from = getDate(
        new Date(new Date().getTime() - 365 * 24 * 3600 * 1000)
      );
      state.to = getDate(new Date());
      state.currentSymbols = [];
      state.currentRowId = 0.0;
      state.currentR = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzeIndice.pending, (state, action) => {
        state.loading = true;
        state.rows = [];
      })
      .addCase(analyzeIndice.fulfilled, (state, action) => {
        let rows = action.payload;
        state.rows = rows;
        // state.currentSymbols = rows[0].pair.split("-");
        if (state.currentRowId === 0) state.currentRowId = rows[0].pairID;
        else {
          const found = state.rows.find(
            (row) =>
              row.pair ===
              state.currentSymbols[0] + "-" + state.currentSymbols[1]
          );
          state.currentRowId = found.pairID;
        }

        state.currentR = rows[0].correlation;
        state.loading = false;
      })
      .addCase(analyzeIndice.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export const {
  setRangeType,
  setFromDate,
  setToDate,
  setLoading,
  setPageSize,
  setFrom,
  setTo,
  setCurrentSymbols,
  setCurrentRowId,
  setCurrentR,
  rangeChange,
  tagChange,
  resetState,
} = actions;

export default reducer;
