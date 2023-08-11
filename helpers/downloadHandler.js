const xlsx = require("json-as-xlsx");
const fs = require("fs");
const errResponse = require("./errResponse");

const downloadHandler = ({
  arrDatas = [],
  res,
  fileName = "tes",
  sheetName = "Sheet1",
  columns = [],
}) => {
  const settings = {
    fileName, // Name of the resulting spreadsheet
    extraLength: 3, // A bigger number means that columns will be wider
    writeMode: "writeFile", // The available parameters are 'WriteFile' and 'write'. This setting is optional. Useful in such cases https://docs.sheetjs.com/docs/solutions/output#example-remote-file
    writeOptions: {}, // Style options from https://docs.sheetjs.com/docs/api/write-options
  };
  if (arrDatas?.length) {
    const arrColumns = Object.keys(arrDatas?.[0])?.map((data) => ({
      label: data,
      value: data,
    }));

    const formatDataBimbingan = [
      {
        sheet: sheetName,
        columns: columns?.length ? columns : arrColumns,
        content: arrDatas,
      },
    ];
    xlsx(formatDataBimbingan, settings, () => {
      setTimeout(() => {
        res.download(`${fileName}.xlsx`, () => {
          fs.unlink(`${fileName}.xlsx`, (err) => {
            if (err) {
              errResponse({ res, e: err });
            }
          });
        });
      }, 280);
    });
  } else {
    res
      .status(404)
      ?.send({ status: 404, message: "Data yang akan didownload tidak ada" });
  }
};

module.exports = downloadHandler;
