const readFn = require("../../helpers/mainFn/readFn");
const { uniqueArrObj } = require("../../helpers/uniqueArr_ArrObj");
const { penelitian } = require("../../models");
const deleteFn = require("../../helpers/mainFn/deleteFn");
const multipleFn = require("../../helpers/mainFn/multipleFn");
const errResponse = require("../../helpers/errResponse");

const rescrapePenelitian = async ({
  nip,
  oldArrPenelitian,
  newArrPenelitian,
  res,
}) => {
  if (nip) {
    if (oldArrPenelitian?.length) {
      const uniqueNewArrPenelitian = uniqueArrObj({
        arr: [...newArrPenelitian, ...oldArrPenelitian],
        props: "judulPenelitian",
      });

      deleteFn({
        model: penelitian,
        where: {
          nip,
        },
      })?.then(() => {
        multipleFn({
          model: penelitian,
          arrDatas: uniqueNewArrPenelitian?.map((data) => ({
            ...data,
            nip,
          })),
          type: "add",
        })?.then(async () => {
          const getDatasPenelitian = await readFn({
            model: penelitian,
            where: {
              nip,
            },
            usePaginate: false,
            isExcludeId: false,
            exclude: ["updatedAt", "createdAt"],
          });

          res.status(200).send({
            status: 200,
            data: getDatasPenelitian,
            message: "Berhasil rescrape data",
          });
        });
      });
    } else {
      multipleFn({
        model: penelitian,
        arrDatas: newArrPenelitian?.map((data) => ({
          ...data,
          nip,
        })),
        type: "add",
      })?.then(async () => {
        const getDatasPenelitian = await readFn({
          model: penelitian,
          where: {
            nip,
          },
          usePaginate: false,
          isExcludeId: false,
          exclude: ["updatedAt", "createdAt"],
        });

        res.status(200).send({
          status: 200,
          data: getDatasPenelitian,
          message: "Berhasil rescrape data",
        });
      });
    }
  } else {
    errResponse({
      res,
      e: "Mohon nip diisi, kalau tidak bisa hubungi administrator (restu)",
    });
  }
};

module.exports = rescrapePenelitian;
