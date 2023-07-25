const { JSDOM } = require("jsdom");
const sameArrObj = require("../../../helpers/sameArrObj");
const scrapePages = require("../../scrapePages");

const scrapeGS = async (gs_url) => {
  const pages = await scrapePages(gs_url);

  const dom = new JSDOM(pages).window.document;

  const arrPenelitian = [];
  const arrBidang = [];

  dom.querySelectorAll(".gsc_a_tr").forEach((data) => {
    const title = data?.querySelector(".gsc_a_at").textContent;
    const baseUrl = gs_url?.split("/c")?.[0];
    const link_title = `${baseUrl}${data
      ?.querySelector(".gsc_a_at")
      .getAttribute("href")}`;

    arrPenelitian.push({ title, link_title });
  });

  dom.querySelectorAll("#gsc_prf_int a").forEach((data) => {
    arrBidang.push(data?.textContent);
  });

  return {
    dataPenelitian: sameArrObj({ arr: arrPenelitian, props: "title" }),
    bidang: arrBidang,
  };
};

module.exports = scrapeGS;
