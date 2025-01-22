import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  // getProductByWsCode,
  updateProductImage,
  updateProductImages,
  searchProducts,
  getImagesTagsByProductId
} from "../controllers/product.controller.js";
import multer from "multer";
import { upload } from "../middlewares/multer.middleware.js";
import { restrict, verifyJWT } from "../middlewares/auth.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {validateProduct} from "../middlewares/validate.middleware.js";

const router = Router();

router.post(
  "/",
  verifyJWT,
  restrict(["admin", "superadmin"]),
  (req, res, next) => {
    upload.fields([{ name: "images" }])(req, res, function (err) {
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
  validateProduct,
  createProduct
);
router.get("/", getAllProducts);
router.get("/search", searchProducts);

// router.get("/:WsCode", getProductByWsCode);
router.get("/:product_id/images", getImagesTagsByProductId);

router.post(
  "/update-image",
  verifyJWT,
  restrict(["admin", "superadmin"]),
  upload.single("image"),
  updateProductImage
);

router.post(
  "/update-images",
  verifyJWT,
  restrict(["admin", "superadmin"]),
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

router.put("/:WsCode", verifyJWT, restrict(["admin","superadmin"]), updateProduct);

router.delete("/:WsCode", verifyJWT, restrict(["admin", "superadmin"]), deleteProduct);

export default router;
