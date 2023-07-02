const axios = require("axios");
const https = require("https");

// let status;
const scrapePages = async (url) => {
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });
  try {
    const response = await axios.get(url, { httpsAgent });
    // status = response?.status;
    return response?.data;
  } catch (e) {
    // status = e?.response?.status;
    console.log("e : ", e);
  }
};

module.exports = scrapePages;
