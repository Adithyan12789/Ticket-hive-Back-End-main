"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const baseDir = process.cwd();
class UserImageUploads {
    static ensureDirectoryExists(directory) {
        if (!fs_1.default.existsSync(directory)) {
            fs_1.default.mkdirSync(directory, { recursive: true });
        }
    }
    static createStorage(directory) {
        const basePublicPath = fs_1.default.existsSync(path_1.default.join(process.cwd(), "public"))
            ? path_1.default.join(process.cwd(), "public")
            : fs_1.default.existsSync(path_1.default.join(process.cwd(), "Back-End", "public"))
                ? path_1.default.join(process.cwd(), "Back-End", "public")
                : path_1.default.join(__dirname, "..", "..", "public");
        const uploadPath = path_1.default.join(basePublicPath, directory);
        this.ensureDirectoryExists(uploadPath);
        console.log(`${directory} will be uploaded to: ${uploadPath}`);
        return multer_1.default.diskStorage({
            destination: (req, file, cb) => {
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                cb(null, `${file.fieldname}_${Date.now()}${path_1.default.extname(file.originalname)}`);
            },
        });
    }
    static userStorage() {
        return this.createStorage("UserProfileImages");
    }
    static fileFilter(req, file, cb) {
        console.log(`Received file: ${file.originalname}, type: ${file.mimetype}`);
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        }
        else {
            console.error("File type not allowed");
            cb(new Error("Only images are allowed!"), false);
        }
    }
}
_a = UserImageUploads;
UserImageUploads.multerUploadUserProfile = (0, multer_1.default)({
    storage: _a.userStorage(),
    fileFilter: _a.fileFilter,
});
exports.default = UserImageUploads;
//# sourceMappingURL=UserMulter.js.map