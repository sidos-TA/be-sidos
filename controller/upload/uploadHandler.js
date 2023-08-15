const cloudinary = require("cloudinary");
const errResponse = require("../../helpers/errResponse");
const readFn = require("../../helpers/mainFn/readFn");
const updateFn = require("../../helpers/mainFn/updateFn");

const uploadPhotoHandler = async ({
  req,
  res,
  cloudinaryFolderPath,
  model,
  whereRemoveUnused,
  whereUpdated,
  cloudinaryConfig,
}) => {
  const fileSize = parseInt(req.headers["content-length"]);

  const imageFile = `download_file/${req.file?.originalname}`;

  if (req.file?.originalname) {
    if (fileSize <= 200000) {
      const url = await cloudinary.v2.uploader.upload(imageFile, {
        folder: `SIDOS/${cloudinaryFolderPath}`,
        ...cloudinaryConfig,
      });

      // ------ update field photo ------
      if (whereUpdated) {
        await updateFn({
          model,
          where: whereUpdated,
          data: {
            photo: url?.secure_url,
          },
        });
      }

      // ------ hapus data cloudinary yg publicId nya ga kepake ------
      const getDatas = await readFn({
        model,
        where: whereRemoveUnused,
      });

      const arrDatas = JSON.parse(JSON.stringify(getDatas));

      cloudinary.v2.api
        .resources({
          type: "upload",
          prefix: `SIDOS/${cloudinaryFolderPath}`,
        })
        ?.then(({ resources }) => {
          // ambil public_id dari cloudinary
          const arrPubIdCloudinary = resources?.map((data) => {
            const publicIdSplitted = data?.public_id?.split("/");
            return publicIdSplitted?.[publicIdSplitted?.length - 1];
          });

          const arrUnusedPubId = [];

          // cari pub_id mana saja yg udh g kepake oleh si arrDatas
          arrDatas?.forEach((data) => {
            const arrDataPhotoSplitted = data?.photo?.split("/");
            const pubId =
              arrDataPhotoSplitted?.[arrDataPhotoSplitted?.length - 1];
            const pubIdNoExt = pubId?.split(".")?.[0];

            arrPubIdCloudinary?.forEach((pubIdCdn) => {
              if (pubIdNoExt !== pubIdCdn) {
                arrUnusedPubId?.push(pubIdCdn);
              }
            });
          });

          // delete yg udah g kepake
          arrUnusedPubId?.forEach((pubId) => {
            cloudinary.v2.uploader.destroy(
              `SIDOS/${cloudinaryFolderPath}/${pubId}`
            );
          });

          res.status(200).send({
            status: 200,
            message: "sukses",
            data: url.secure_url,
          });
        });
    } else {
      errResponse({ res, e: "File gambar setidaknya kurang dari 200kb" });
    }
  } else {
    res.end();
  }
};

const uploadPraProposalHandler = async ({
  req,
  res,
  cloudinaryFolderPath,
  cloudinaryConfig,
  additionalResProps = [],
}) => {
  const fileSize = parseInt(req.headers["content-length"]);

  const imageFile = `download_file/${req.file?.originalname}`;

  if (req.file?.originalname) {
    if (fileSize <= 200000) {
      const url = await cloudinary.v2.uploader.upload(imageFile, {
        folder: `SIDOS/${cloudinaryFolderPath}`,
        ...cloudinaryConfig,
      });

      cloudinary.v2.api
        .resources({
          type: "upload",
          prefix: `SIDOS/${cloudinaryFolderPath}`,
        })
        ?.then(() => {
          const resCustom = {};

          additionalResProps?.forEach((resProps) => {
            resCustom[resProps] = url?.[resProps];
          });

          res.status(200).send({
            status: 200,
            message: "sukses",
            data: additionalResProps?.length ? resCustom : url.secure_url,
          });
        });
    } else {
      errResponse({ res, e: "File gambar setidaknya kurang dari 200kb" });
    }
  } else {
    res.end();
  }
};

module.exports = { uploadPhotoHandler, uploadPraProposalHandler };
