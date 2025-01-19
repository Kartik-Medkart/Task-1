import { Router } from "express";
import {
  createProductAPI,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getProductByWsCode,
  updateProductImage,
  updateProductImages,
  searchProducts,
} from "../controllers/product.controller.js";
import multer from "multer";
import { upload } from "../middlewares/multer.middleware.js";
import { restrict, verifyJWT } from "../middlewares/auth.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = Router();

router.post(
  "/",
  verifyJWT,
  restrict(["admin"]),
  (req, res, next) => {
    upload.fields([{ name: "images", maxCount: 4 }])(req, res, function (err) {
      if (
        err instanceof multer.MulterError &&
        err.code === "LIMIT_UNEXPECTED_FILE"
      ) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              null,
              "Too many files uploaded. Maximum 4 images are allowed."
            )
          );
      } else if (err) {
        return res.status(400).json(new ApiResponse(400, null, err.message));
      }
      next();
    });
  },
  createProductAPI
);
router.get("/", getAllProducts);
router.get("/search", searchProducts);

router.get("/:WsCode", getProductByWsCode);

router.post(
  "/update-image",
  verifyJWT,
  restrict(["admin"]),
  upload.single("image"),
  updateProductImage
);

router.post(
  "/update-images",
  verifyJWT,
  restrict(["admin"]),
  (req, res, next) => {
    upload.fields([{ name: "images", maxCount: 4 }])(req, res, function (err) {
      if (
        err instanceof multer.MulterError &&
        err.code === "LIMIT_UNEXPECTED_FILE"
      ) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              null,
              "Too many files uploaded. Maximum 4 images are allowed."
            )
          );
      } else if (err) {
        return res.status(400).json(new ApiResponse(400, null, err.message));
      }
      next();
    });
  },
  updateProductImages
);

router.put("/:WsCode", verifyJWT, restrict(["admin"]), updateProduct);

router.delete("/:WsCode", verifyJWT, restrict(["admin"]), deleteProduct);

export default router;
