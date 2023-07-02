const { JSDOM } = require("jsdom");
const scrapePages = require("../../scrapePages");

const scrapeGS = async (gs_url) => {
  const pages = await scrapePages(gs_url);

  const dom = new JSDOM(pages).window.document;

  const arrPenelitian = [];
  const arrBidang = [];

  dom.querySelectorAll(".gsc_a_tr").forEach((data) => {
    const judul = data?.querySelector(".gsc_a_at").textContent;
    const link = data?.querySelector(".gsc_a_at").getAttribute("href");

    arrPenelitian.push({ judul, link });
  });

  dom.querySelectorAll("#gsc_prf_int a").forEach((data) => {
    arrBidang.push(data?.textContent);
  });

  return { dataPenelitian: arrPenelitian, bidang: arrBidang };
};

module.exports = scrapeGS;
