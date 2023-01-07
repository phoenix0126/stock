const axios = require("axios");

const setAuthToken = (token) => {
  if (token) axios.defaults.headers.common["Authorization"] = "Bearer " + token;
  else axios.defaults.headers.common["Authorization"] = "";
};

module.exports = {
  setAuthToken: setAuthToken,
};
