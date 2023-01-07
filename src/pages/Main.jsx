import * as React from "react";
import * as Mui from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import SsidChartIcon from "@mui/icons-material/SsidChart";
import CheckIcon from "@mui/icons-material/Check";

import Navbar from "./Navbar";
import Chart from "./Chart";
import {
  setFromDate,
  setToDate,
  setPageSize,
  setFrom,
  setTo,
  setCurrentSymbols,
  setCurrentRowId,
  setCurrentR,
  rangeChange,
  tagChange,
  indexes,
  ranges,
  getDate,
  analyzeIndice,
} from "../redux/reducers/mainReducer";

function Main() {
  const dispatch = useDispatch();
  const rangeType = useSelector((state) => state.main.rangeType);
  const fromDate = useSelector((state) => state.main.fromDate);
  const toDate = useSelector((state) => state.main.toDate);
  const loading = useSelector((state) => state.main.loading);
  const rows = useSelector((state) => state.main.rows);
  const pageSize = useSelector((state) => state.main.pageSize);
  const from = useSelector((state) => state.main.from);
  const to = useSelector((state) => state.main.to);
  const currentSymbols = useSelector((state) => state.main.currentSymbols);
  const currentRowId = useSelector((state) => state.main.currentRowId);
  const currentR = useSelector((state) => state.main.currentR);
  const [openAlert, setOpenAlert] = React.useState(false);
  const [tagOptions, setTagOptions] = React.useState([]);
  const [isTagOptionInit, setIsTagOptionInit] = React.useState(false);
  const refAutoComplete = React.useRef(null);

  const columns = [
    { field: "pairID", headerName: "ID", width: 70, hide: true },
    { field: "pair", headerName: "Pair", flex: 2 },
    { field: "correlation", headerName: "R", flex: 1 },
    { field: "gap", headerName: "G", flex: 1 },
    { field: "xsd", headerName: "xSD", flex: 1 },
    {
      field: "action",
      headerName: "View",
      flex: 1,
      renderCell: (params) => (
        <Mui.Button
          color={params.row.pairID === currentRowId ? "success" : "secondary"}
          onClick={() => {
            dispatch(
              setCurrentSymbols({ currentSymbols: params.row.pair.split("-") })
            );
            dispatch(setCurrentRowId({ currentRowId: params.row.pairID }));
            dispatch(setCurrentR({ currentR: params.row.correlation }));
          }}
        >
          {params.row.pairID === currentRowId ? <CheckIcon /> : <SsidChartIcon />}
        </Mui.Button>
      ),
    },
  ];

  const handleRangeChange = React.useCallback(
    (rangeType) => {
      dispatch(
        rangeChange({
          rangeType: rangeType,
        })
      );

      dispatch(analyzeIndice({ range: rangeType }));
    },
    [dispatch]
  );

  const handleTagChange = React.useCallback(
    (e, tags) => {
      setTagOptions(tags);
      dispatch(tagChange({ tags: tags }));
    },
    [dispatch]
  );

  const ChartMemo = React.useMemo(() => {
    return rows.length === 0 ? (
      <Mui.Box sx={{ display: "flex", justifyContent: "center", padding: 2 }}>
        <Mui.CircularProgress />
      </Mui.Box>
    ) : (
      <Chart symbols={currentSymbols} from={from} to={to} r={currentR} />
    );
  }, [currentR, currentSymbols, from, rows, to]);

  React.useEffect(() => {
    if (currentSymbols.length)
      setTagOptions([
        {
          symbol: currentSymbols[0],
          no: indexes.find((index) => index.symbol === currentSymbols[0]).no,
        },
        {
          symbol: currentSymbols[1],
          no: indexes.find((index) => index.symbol === currentSymbols[1]).no,
        },
      ]);
  }, [currentSymbols]);

  React.useEffect(() => {
    if (rows.length && !isTagOptionInit) {
      dispatch(
        setCurrentSymbols({
          currentSymbols: rows[0].pair.split("-"),
        })
      );
      setIsTagOptionInit(true);
    }
  }, [dispatch, rows, isTagOptionInit]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Navbar />
      <Mui.Snackbar
        open={openAlert}
        autoHideDuration={6000}
        onClose={() => setOpenAlert(false)}
      >
        <Mui.Alert
          onClose={() => setOpenAlert(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          You must select validated date. To must to be behind From.
        </Mui.Alert>
      </Mui.Snackbar>
      {currentSymbols.length === 0 ? (
        <Mui.Box sx={{ display: "flex", justifyContent: "center", padding: 2 }}>
          <Mui.CircularProgress />
        </Mui.Box>
      ) : (
        <Mui.Stack>
          <Mui.Autocomplete
            multiple
            ref={refAutoComplete}
            id="tags-outlined"
            sx={{ paddingTop: 5, paddingX: 1 }}
            options={indexes}
            isOptionEqualToValue={(option, value) =>
              option.symbol === value.symbol
            }
            getOptionLabel={(option) => option.symbol}
            defaultValue={tagOptions}
            value={tagOptions}
            filterSelectedOptions
            renderInput={(params) => (
              <Mui.TextField
                {...params}
                label="Indexes"
                placeholder="Select Index"
              />
            )}
            onChange={handleTagChange}
          />
          {ChartMemo}
        </Mui.Stack>
      )}
      <Mui.Stack>
        <Mui.Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ paddingX: 1, paddingTop: 1 }}
        >
          <Mui.Grid container spacing={2}>
            {ranges.map((range, index) => (
              <Mui.Grid item xs key={index}>
                <Mui.Button
                  variant={range.type === rangeType ? "contained" : "outlined"}
                  onClick={() => handleRangeChange(range.type)}
                >
                  {range.label}
                </Mui.Button>
              </Mui.Grid>
            ))}
          </Mui.Grid>
          <Mui.Stack spacing={2}>
            <MobileDatePicker
              label="From"
              value={fromDate}
              onChange={(newValue) => {
                dispatch(setFromDate({ fromDate: newValue }));
              }}
              renderInput={(params) => <Mui.TextField {...params} />}
            />
            <MobileDatePicker
              label="To"
              value={toDate}
              onChange={(newValue) => {
                if (newValue.getTime() > new Date(fromDate).getTime()) {
                  dispatch(setToDate({ toDate: newValue }));
                  dispatch(setFrom({ from: getDate(new Date(fromDate)) }));
                  dispatch(setTo({ to: getDate(newValue) }));
                } else setOpenAlert(true);
              }}
              renderInput={(params) => <Mui.TextField {...params} />}
            />
          </Mui.Stack>
        </Mui.Stack>
        <Mui.Container maxWidth="false" sx={{ paddingTop: 5, paddingX: 1 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={pageSize}
            onPageSizeChange={(newPageSize) =>
              dispatch(setPageSize({ pageSize: newPageSize }))
            }
            rowsPerPageOptions={[5, 10, 20, 50]}
            components={{
              Toolbar: GridToolbar,
            }}
            componentsProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            loading={loading}
            autoHeight
            pagination
            disableColumnFilter
            disableColumnSelector
            disableDensitySelector
          />
        </Mui.Container>
      </Mui.Stack>
    </LocalizationProvider>
  );
}

export default Main;
