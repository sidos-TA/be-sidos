const { JSDOM } = require("jsdom");
const sameArrObj = require("../../../helpers/sameArrObj");
const scrapePages = require("../../scrapePages");

const scrapeSINTA = async (link) => {
  const pages = await scrapePages(link);

  const dom = new JSDOM(pages).window.document;

  const arrPenelitian = [];
  const arrBidang = [];

  dom.querySelectorAll(".ar-list-item").forEach((data) => {
    const judulPenelitian = data?.querySelector(".ar-title a").textContent;
    const link = data?.querySelector(".ar-title a").getAttribute("href");
    const tahun = data?.querySelector(".ar-year").textContent?.trim();
    arrPenelitian.push({ judulPenelitian, link, tahun });
  });

  dom.querySelectorAll(".subject-list li a").forEach((data) => {
    arrBidang.push(data?.textContent?.trim());
  });

  return {
    dataPenelitian: sameArrObj({
      arr: arrPenelitian,
      props: "judulPenelitian",
    }),
    bidang: arrBidang,
  };
};

module.exports = scrapeSINTA;
