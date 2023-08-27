require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { mhsRoute } = require("./routes/mhs");
const { dsnRoute } = require("./routes/dosen");
const { kategoriRoute } = require("./routes/kategori");
const { usulanRoute } = require("./routes/usulan");
const { bimbinganRoute } = require("./routes/bimbingan");
const { dashboardRoute } = require("./routes/dashboard");
const { prodiRoute } = require("./routes/prodi");
const { judulDataRoute } = require("./routes/judulData");
const { loginRoute } = require("./routes/login");
const { forbidMethodsRoute } = require("./routes/forbiddenmethods");
const { settingRoute } = require("./routes/setting");
const { keputusanRoute } = require("./routes/keputusan");
const { tesRoute } = require("./routes/tes");
const { downloadRoute } = require("./routes/download");
const { penelitianRoute } = require("./routes/penelitian");
const { uploadRoute } = require("./routes/upload");

const app = express();

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "https://sidos.vercel.app",
      "https://simple_winnowing_tools.vercel.app",
    ],
    credentials: true,
    // exposedHeaders: ["set-cookie"],
  })
);
app.use(express.urlencoded({ extended: true, limit: "16mb" }));
app.use(express.json({ limit: "16mb" }));

app.use(mhsRoute);
app.use(dsnRoute);
app.use(kategoriRoute);
app.use(usulanRoute);
app.use(bimbinganRoute);
app.use(dashboardRoute);
app.use(prodiRoute);
app.use(judulDataRoute);
app.use(loginRoute);
app.use(forbidMethodsRoute);
app.use(settingRoute);
app.use(keputusanRoute);
app.use(tesRoute);
app.use(downloadRoute);
app.use(penelitianRoute);
app.use(uploadRoute);

app.listen(3000);
