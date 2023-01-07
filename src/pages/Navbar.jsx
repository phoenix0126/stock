import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as Mui from "@mui/material";
import AdbIcon from "@mui/icons-material/Adb";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import Home from "@mui/icons-material/Home";
import ManageAccounts from "@mui/icons-material/ManageAccounts";
import AccountCircle from "@mui/icons-material/AccountCircle";

import { signout } from "../redux/reducers/authReducer";
import { resetState as resetMainState } from "../redux/reducers/mainReducer";
import { resetState as resetSettingsState } from "../redux/reducers/settingsReducer";

function stringToColor(string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function stringAvatar(name) {
  const childrenArr = name.split(" ");
  let children = "";
  childrenArr.map((item) => (children += item[0]));
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: children,
  };
}

export default function Navbar(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const user = useSelector((state) => state.auth.user);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleSignOut = React.useCallback(() => {
    dispatch(resetMainState());
    dispatch(resetSettingsState());
    dispatch(signout());
  }, [dispatch]);

  return (
    <Mui.AppBar position="static">
      <Mui.Container maxWidth="xl">
        <Mui.Toolbar
          sx={{ display: "flex", justifyContent: "space-between" }}
          disableGutters
        >
          <Mui.Box sx={{ display: "flex", alignItems: "center" }}>
            <AdbIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
            <Mui.Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              TD
            </Mui.Typography>

            <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
            <Mui.Typography
              variant="h5"
              noWrap
              component="a"
              href=""
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              LOGO
            </Mui.Typography>
          </Mui.Box>

          <Mui.Box>
            <Mui.Tooltip title="Open menu">
              <Mui.IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Mui.Avatar alt={user.name} {...stringAvatar(user.name)} />
              </Mui.IconButton>
            </Mui.Tooltip>
            <Mui.Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {user.role === "ADMIN" ? (
                <div>
                  <Mui.MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate("/main");
                    }}
                  >
                    <Mui.ListItemIcon>
                      <Home fontSize="small" />
                    </Mui.ListItemIcon>
                    <Mui.Typography textAlign="center">Home</Mui.Typography>
                  </Mui.MenuItem>
                  <Mui.MenuItem onClick={handleCloseUserMenu}>
                    <Mui.ListItemIcon>
                      <Settings fontSize="small" />
                    </Mui.ListItemIcon>
                    <Mui.Typography
                      onClick={() => {
                        handleCloseUserMenu();
                        navigate("/setting");
                      }}
                      textAlign="center"
                    >
                      Setting
                    </Mui.Typography>
                  </Mui.MenuItem>
                  <Mui.MenuItem onClick={handleCloseUserMenu}>
                    <Mui.ListItemIcon>
                      <ManageAccounts fontSize="small" />
                    </Mui.ListItemIcon>
                    <Mui.Typography textAlign="center">Admin</Mui.Typography>
                  </Mui.MenuItem>
                  <Mui.MenuItem onClick={handleCloseUserMenu}>
                    <Mui.ListItemIcon>
                      <AccountCircle fontSize="small" />
                    </Mui.ListItemIcon>
                    <Mui.Typography textAlign="center">Profile</Mui.Typography>
                  </Mui.MenuItem>
                  <Mui.MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      handleSignOut();
                    }}
                  >
                    <Mui.ListItemIcon>
                      <Logout fontSize="small" />
                    </Mui.ListItemIcon>
                    <Mui.Typography textAlign="center">Logout</Mui.Typography>
                  </Mui.MenuItem>
                </div>
              ) : (
                <div>
                  <Mui.MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate("/main");
                    }}
                  >
                    <Mui.ListItemIcon>
                      <Home fontSize="small" />
                    </Mui.ListItemIcon>
                    <Mui.Typography textAlign="center">Home</Mui.Typography>
                  </Mui.MenuItem>
                  <Mui.MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate("/setting");
                    }}
                  >
                    <Mui.ListItemIcon>
                      <Settings fontSize="small" />
                    </Mui.ListItemIcon>
                    <Mui.Typography textAlign="center">Setting</Mui.Typography>
                  </Mui.MenuItem>
                  <Mui.MenuItem onClick={handleCloseUserMenu}>
                    <Mui.ListItemIcon>
                      <AccountCircle fontSize="small" />
                    </Mui.ListItemIcon>
                    <Mui.Typography textAlign="center">Profile</Mui.Typography>
                  </Mui.MenuItem>
                  <Mui.MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      handleSignOut();
                    }}
                  >
                    <Mui.ListItemIcon>
                      <Logout fontSize="small" />
                    </Mui.ListItemIcon>
                    <Mui.Typography textAlign="center">Logout</Mui.Typography>
                  </Mui.MenuItem>
                </div>
              )}
            </Mui.Menu>
          </Mui.Box>
        </Mui.Toolbar>
      </Mui.Container>
    </Mui.AppBar>
  );
}
