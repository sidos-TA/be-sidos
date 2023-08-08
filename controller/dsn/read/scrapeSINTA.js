const { JSDOM } = require("jsdom");
const sameArrObj = require("../../../helpers/sameArrObj");
const scrapePages = require("../../scrapePages");

const scrapeSINTA = async (sinta_url) => {
  const pages = await scrapePages(sinta_url);

  const dom = new JSDOM(pages).window.document;

  const arrPenelitian = [];
  const arrBidang = [];

  dom.querySelectorAll(".ar-list-item").forEach((data) => {
    const title = data?.querySelector(".ar-title a").textContent;
    const link_title = data?.querySelector(".ar-title a").getAttribute("href");

    arrPenelitian.push({ title, link_title });
  });

  dom.querySelectorAll(".subject-list").forEach((data) => {
    arrBidang.push(data?.textContent?.trim());
  });

  return {
    dataPenelitian: sameArrObj({ arr: arrPenelitian, props: "title" }),
    bidang: arrBidang,
  };
};

module.exports = scrapeSINTA;
