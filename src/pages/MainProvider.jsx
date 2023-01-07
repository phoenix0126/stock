import * as React from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";

import { analyzeIndice } from "../redux/reducers/mainReducer";
import { getSettings } from "../redux/reducers/settingsReducer";

export default function MainProvider(props) {
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(analyzeIndice({ range: 5 }));
    dispatch(getSettings());
  }, [dispatch]);

  return (
    <div>
      <Outlet />
    </div>
  );
}
