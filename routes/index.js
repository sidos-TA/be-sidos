const express = require("express");
const { dsnRoute } = require("./dosen");
const { mhsRoute } = require("./mhs");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(mhsRoute);
app.use(dsnRoute);

app.listen(3000);
