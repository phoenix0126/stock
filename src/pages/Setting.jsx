import * as React from "react";
import * as Mui from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import TimelineIcon from "@mui/icons-material/Timeline";

import {
  updateMinXSD,
  createNewMinXSD,
  enableSetting,
  disableSetting,
} from "../redux/reducers/settingsReducer";
import { ranges } from "../redux/reducers/mainReducer";
import Navbar from "./Navbar";

export default function Setting(props) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const checks = useSelector((state) => state.settings.checks);
  const minXSDs = useSelector((state) => state.settings.minXSDs);
  const ids = useSelector((state) => state.settings.ids);

  const handleCheck = React.useCallback(
    async (index) => {
      if (ids[index] !== -1) {
        const resultAction = await dispatch(
          checks[index]
            ? disableSetting({ id: ids[index] })
            : enableSetting({ id: ids[index] })
        );

        if (
          disableSetting.fulfilled.match(resultAction) ||
          enableSetting.fulfilled.match(resultAction)
        ) {
          toast.success("Active state updated!");
        }
      } else {
        const resultAction = await dispatch(
          createNewMinXSD({ timeframe: index + 1, minXSD: 2, userId: user.id })
        );
        if (createNewMinXSD.fulfilled.match(resultAction))
          toast.success("New mail notification added!");
      }
    },
    [checks, dispatch, ids, user]
  );

  const handleChange = React.useCallback(
    async (e, id) => {
      const resultAction = await dispatch(
        updateMinXSD({
          id: id,
          minXSD: e.target.value === "" ? 0 : e.target.value,
        })
      );
      if (updateMinXSD.fulfilled.match(resultAction))
        toast.success("minXSD updated!");
    },
    [dispatch]
  );

  const settingsCard = React.useMemo(() => {
    return ranges.map((range, index) => {
      return (
        <Mui.ListItem key={range.type}>
          <ToastContainer />
          <Mui.ListItemIcon>
            <TimelineIcon />
          </Mui.ListItemIcon>
          <Mui.ListItemText id="switch-list-label-wifi" primary={range.label} />
          <Mui.TextField
            label="minXSD"
            type="number"
            id="outlined-size-small"
            size="small"
            value={minXSDs[index]}
            disabled={!checks[index]}
            onChange={(e) => handleChange(e, ids[index])}
          />
          <Mui.Switch
            edge="end"
            inputProps={{
              "aria-labelledby": "switch-list-label-wifi",
            }}
            onChange={() => handleCheck(index)}
            checked={checks[index]}
          />
        </Mui.ListItem>
      );
    });
  }, [minXSDs, checks, ids, handleChange, handleCheck]);

  return (
    <Mui.Box>
      <Navbar />
      <Mui.Container
        maxWidth="md"
        sx={{ height: "90vh", display: "flex", alignItems: "center" }}
      >
        <Mui.List
          sx={{ width: "100%" }}
          subheader={
            <Mui.ListSubheader>Mail Notification Settings</Mui.ListSubheader>
          }
        >
          {settingsCard}
        </Mui.List>
      </Mui.Container>
    </Mui.Box>
  );
}
