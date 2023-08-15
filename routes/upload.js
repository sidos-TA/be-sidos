const errResponse = require("../helpers/errResponse");
const router = require("./router");
const cloudinary = require("cloudinary");
const uploadSettingsSidos = require("../helpers/uploadSettingsSidos");
const {
  uploadPhotoHandler,
  uploadPraProposalHandler,
} = require("../controller/upload/uploadHandler");
const { dosen, mhs } = require("../models");
const verifyJWT = require("../helpers/verifyJWT");
const forbiddenResponse = require("../helpers/forbiddenResponse");
const fs = require("fs");

const upload = uploadSettingsSidos();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getImageAttachment = async (id) => {
  return await cloudinary.url(id, {
    flags: "attachment:imgname",
  });
};
router.get("/getResources", async (req, res) => {
  const url = await getImageAttachment("SIDOS/1116-2227-1-SM_1_h9svft");

  cloudinary.v2.api
    .resources({
      type: "upload",
      prefix: "SIDOS",
    })
    ?.then((result) => {
      res.status(200).send({ status: 200, result, url });
    });
});
router.post(
  "/uploadImageMhsPhoto",
  verifyJWT,
  upload.single("image"),
  async (req, res) => {
    const { prodi, no_bp } = req.body;
    try {
      await uploadPhotoHandler({
        req,
        res,
        cloudinaryFolderPath: `MHS_Photo/${prodi}`,
        model: mhs,
        whereRemoveUnused: {
          prodi,
        },
        whereUpdated: {
          no_bp,
        },
      });
    } catch (e) {
      errResponse({ res, e });
    }
  }
);
router.post(
  "/uploadImageDsnPhoto",
  verifyJWT,
  forbiddenResponse,
  upload.single("image"),
  async (req, res) => {
    const { jabatan, nip } = req.body;
    try {
      await uploadPhotoHandler({
        req,
        res,
        cloudinaryFolderPath: `DSN_Photo/${jabatan}`,
        model: dosen,
        whereRemoveUnused: {
          jabatan,
        },
        whereUpdated: {
          nip,
        },
      });
    } catch (e) {
      errResponse({ res, e });
    }
  }
);

router.post(
  "/uploadFilePraProposal",
  upload.single("pra_proposal"),
  verifyJWT,
  async (req, res) => {
    const { prodi, tahun, semester, judul, no_bp } = req.body;
    try {
      await uploadPraProposalHandler({
        req,
        res,
        cloudinaryFolderPath: `PRA_PROPOSAL/${prodi}/${tahun?.replace(
          "/",
          "_"
        )}_${semester}`,
        cloudinaryConfig: {
          transformation: {
            flags: `attachment:${no_bp}_${judul || "judul masih kosong"}`,

            fetch_format: "pdf",
          },
          format: "pdf",
        },
        additionalResProps: ["secure_url", "original_filename"],
      });
    } catch (e) {
      errResponse({ res, e });
    }

    fs.access(`download_file/${req?.file?.originalname}`, (err) => {
      if (!err) {
        fs.unlink(`download_file/${req?.file?.originalname}`, (err) => {
          if (err) {
            errResponse({ res, e: err });
          }
        });
      } else {
        errResponse({ res, e: "Terjadi kesalahan, mohon direfresh saja" });
      }
    });
  }
);

module.exports = { uploadRoute: router };
