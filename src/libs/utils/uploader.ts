import fs from "fs";
import path from "path";
import multer from "multer";
import { v4 } from "uuid";

/** MULTER IMAGE UPLOADER */
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
};
const UPLOAD_DIRECTORIES = new Set(["products", "sellers", "users"]);

function getTargetImageStorage(address: string) {
    if (!UPLOAD_DIRECTORIES.has(address)) {
        throw new Error("Unsupported upload directory");
    }

    return multer.diskStorage({
        destination: function (req, file, cb) {
            const relativeDirectory = path.posix.join("uploads", address);
            const absoluteDirectory = path.resolve(process.cwd(), relativeDirectory);
            const uploadRoot = path.resolve(process.cwd(), "uploads");

            if (!absoluteDirectory.startsWith(`${uploadRoot}${path.sep}`)) {
                return cb(new Error("Invalid upload path"), relativeDirectory);
            }

            fs.mkdirSync(absoluteDirectory, { recursive: true });
            cb(null, relativeDirectory);
        },
        filename: function (req, file, cb) {
            const extension = IMAGE_EXTENSIONS[file.mimetype];
            const random_name = v4() + extension;
            cb(null, random_name);
        },
    });
}

const makeUploader = (address: string) => {
    const storage = getTargetImageStorage(address);
    return multer({
        storage,
        limits: {
            fileSize: MAX_IMAGE_SIZE_BYTES,
        },
        fileFilter: (_req, file, cb) => {
            if (!IMAGE_EXTENSIONS[file.mimetype]) {
                return cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
            }

            return cb(null, true);
        },
    });
};

export default makeUploader;


/*
const product_storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/products");
    },
    filename: function (req, file, cb) {
        console.log(file);
        const extension = path.parse(file.originalname).ext;
        const random_name = v4() + extension;
        cb(null, random_name);
    }
});

export const uploadProductImage = multer({storage: product_storage});
*/
