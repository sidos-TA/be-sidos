const { JSDOM } = require("jsdom");
const sameArrObj = require("../../../helpers/sameArrObj");
const scrapePages = require("../../scrapePages");

const scrapeGS = async (gs_url) => {
  const pages = await scrapePages(gs_url);

  const dom = new JSDOM(pages).window.document;

  const arrPenelitian = [];
  const arrBidang = [];

  const baseUrl = gs_url?.split("/c")?.[0];

  dom.querySelectorAll(".gsc_a_tr").forEach((data) => {
    const judulPenelitian = data?.querySelector(".gsc_a_at").textContent;
    const link = `${baseUrl}${data
      ?.querySelector(".gsc_a_at")
      .getAttribute("href")}`;
    const tahun = data?.querySelector(".gsc_a_y").textContent;

    arrPenelitian.push({ judulPenelitian, link, tahun });
  });

  dom.querySelectorAll("#gsc_prf_int a").forEach((data) => {
    arrBidang.push(data?.textContent);
  });

  return {
    dataPenelitian: sameArrObj({
      arr: arrPenelitian,
      props: "judulPenelitian",
    }),
    bidang: arrBidang,
  };
};

module.exports = scrapeGS;
