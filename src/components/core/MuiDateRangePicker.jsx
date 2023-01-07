import * as React from "react";
import * as Mui from "@mui/material";
import { makeStyles } from "@mui/styles";
import { DateRangePicker } from "materialui-daterange-picker";
import DateRangeIcon from "@mui/icons-material/DateRange";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

export const MuiDateRangePicker = (props) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen(!open);

  const getDisplayDateRange = (dateRange) => {
    const startDate =
      new Date(dateRange.startDate).getFullYear() +
      "-" +
      (new Date(dateRange.startDate).getMonth() + 1) +
      "-" +
      new Date(dateRange.startDate).getDate();
    const endDate =
      new Date(dateRange.endDate).getFullYear() +
      "-" +
      (new Date(dateRange.endDate).getMonth() + 1) +
      "-" +
      new Date(dateRange.endDate).getDate();

    return `${startDate} - ${endDate}`;
  };

  return (
    <>
      <Mui.TextField
        value={getDisplayDateRange(props.dateRange)}
        onClick={toggle}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <Mui.IconButton>
              <DateRangeIcon />
            </Mui.IconButton>
          ),
        }}
        {...props.TextFieldProps}
      />
      <Mui.Modal
        classes={classes}
        open={open}
        closeAfterTransition
        BackdropComponent={Mui.Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Mui.Fade in={open}>
          <Mui.Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              paddingTop: "100px",
            }}
          >
            <DateRangePicker
              open={open}
              maxDate={new Date()}
              toggle={toggle}
              onChange={(range) => {
                props.onDateRangeChange(range);
                toggle();
              }}
              initialDateRange={props.dateRange}
            />
          </Mui.Box>
        </Mui.Fade>
      </Mui.Modal>
    </>
  );
};
