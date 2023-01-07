import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./reducers/authReducer";
import mainReducer from "./reducers/mainReducer";
import settingsReducer from "./reducers/settingsReducer";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    main: mainReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
