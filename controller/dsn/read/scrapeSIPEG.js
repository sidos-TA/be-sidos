const { JSDOM } = require("jsdom");
const scrapePages = require("../../scrapePages");
// const {dosen} = require('../../../models')

const scrapeSIPEG = async (nip) => {
  const pages = await scrapePages(
    `https://sipeg.pnp.ac.id/index.php/data-staf-pengajar?i=${nip}`
  );

  const dom = new JSDOM(pages)?.window?.document;

  const name = dom
    ?.querySelector(
      "#content-shift > div > div > div > table.table-portrait > tbody > tr:nth-child(2) > td"
    )
    .textContent?.trimStart();
  const jabatan = dom
    ?.querySelector(
      "#content-shift > div > div > div > table.table-portrait > tbody > tr:nth-child(23) > td"
    )
    ?.textContent?.trimStart();
  const pendidikan = dom
    ?.querySelector(
      "#content-shift > div > div > div > table.table-portrait > tbody > tr:nth-child(25) > td"
    )
    ?.textContent?.trimStart();

  return { name, jabatan, pendidikan };
};

module.exports = scrapeSIPEG;
