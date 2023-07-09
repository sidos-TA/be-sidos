const express = require("express");
const { bimbinganRoute } = require("./bimbingan");
const { dsnRoute } = require("./dosen");
const { kategoriRoute } = require("./kategori");
const { mhsRoute } = require("./mhs");
const { usulanRoute } = require("./usulan");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(mhsRoute);
app.use(dsnRoute);
app.use(kategoriRoute);
app.use(usulanRoute);
app.use(bimbinganRoute);

app.listen(3000);
