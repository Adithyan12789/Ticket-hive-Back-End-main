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
class MovieImageUploads {
    static ensureDirectoryExists(directory) {
        if (!fs_1.default.existsSync(directory)) {
            fs_1.default.mkdirSync(directory, { recursive: true });
        }
    }
    static fileFilter(req, file, cb) {
        console.log(`Received file: ${file.originalname}, type: ${file.mimetype}`);
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        }
        else {
            console.error("File type not allowed");
            cb(new Error("Only images are allowed!"));
        }
    }
}
_a = MovieImageUploads;
MovieImageUploads.customStorage = {
    _handleFile: (req, file, cb) => {
        let directory;
        console.log("file.fieldname: ", file);
        switch (file.fieldname) {
            case 'poster':
                directory = "MoviePosters";
                break;
            case 'movieImages':
                directory = "movieImages";
                break;
            case 'castImages':
                directory = "CastsImages";
                break;
            case 'banners':
                directory = "MovieBanners";
                break;
            default:
                return cb(new Error("Invalid field name"));
        }
        const basePublicPath = fs_1.default.existsSync(path_1.default.join(process.cwd(), "public"))
            ? path_1.default.join(process.cwd(), "public")
            : fs_1.default.existsSync(path_1.default.join(process.cwd(), "Back-End", "public"))
                ? path_1.default.join(process.cwd(), "Back-End", "public")
                : path_1.default.join(__dirname, "..", "..", "public");
        const uploadPath = path_1.default.join(basePublicPath, directory);
        _a.ensureDirectoryExists(uploadPath);
        const filename = `${file.fieldname}_${Date.now()}${path_1.default.extname(file.originalname)}`;
        const fullPath = path_1.default.join(uploadPath, filename);
        console.log(`Uploading file: ${fullPath}`);
        const stream = fs_1.default.createWriteStream(fullPath);
        file.stream.pipe(stream);
        stream.on('finish', () => {
            console.log(`File uploaded successfully: ${fullPath}`);
            cb(null, { filename });
        });
        stream.on('error', (error) => {
            console.error(`Error uploading file: ${error.message}`);
            cb(error);
        });
    },
    _removeFile: (req, file, cb) => {
        const directory = file.fieldname === 'poster' ? "MoviePosters" :
            file.fieldname === 'movieImages' ? "movieImages" :
                file.fieldname === 'banners' ? "MovieBanners" :
                    "CastsImages";
        const basePublicPath = fs_1.default.existsSync(path_1.default.join(process.cwd(), "public"))
            ? path_1.default.join(process.cwd(), "public")
            : fs_1.default.existsSync(path_1.default.join(process.cwd(), "Back-End", "public"))
                ? path_1.default.join(process.cwd(), "Back-End", "public")
                : path_1.default.join(__dirname, "..", "..", "public");
        const filePath = path_1.default.join(basePublicPath, directory, file.filename);
        fs_1.default.unlink(filePath, (err) => cb(err));
    }
};
MovieImageUploads.multerUploadMultipleFields = (0, multer_1.default)({
    storage: _a.customStorage,
    fileFilter: _a.fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5,
    }
}).fields([
    { name: 'poster', maxCount: 1 },
    { name: 'banners', maxCount: 5 },
    { name: 'movieImages', maxCount: 10 },
    { name: 'castImages', maxCount: 5 }
]);
exports.default = MovieImageUploads;
//# sourceMappingURL=MovieMulter.js.map