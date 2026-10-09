import multer, { StorageEngine, FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";

const baseDir = process.cwd();

class UserImageUploads {
  private static ensureDirectoryExists(directory: string): void {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }

  private static createStorage(directory: string): StorageEngine {
    // Robust public path detection
    const basePublicPath = fs.existsSync(path.join(process.cwd(), "public"))
      ? path.join(process.cwd(), "public")
      : fs.existsSync(path.join(process.cwd(), "Back-End", "public"))
        ? path.join(process.cwd(), "Back-End", "public")
        : path.join(__dirname, "..", "..", "public");

    const uploadPath = path.join(basePublicPath, directory);
    this.ensureDirectoryExists(uploadPath);
    console.log(`${directory} will be uploaded to: ${uploadPath}`);

    return multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        cb(
          null,
          `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
        );
      },
    });
  }

  private static userStorage(): StorageEngine {
    return this.createStorage("UserProfileImages");
  }

  private static fileFilter(
    req: Express.Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ): void {
    console.log(`Received file: ${file.originalname}, type: ${file.mimetype}`);
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      console.error("File type not allowed");
      cb(new Error("Only images are allowed!") as any, false);
    }
  }

  public static multerUploadUserProfile = multer({
    storage: this.userStorage(),
    fileFilter: this.fileFilter,
  });
}

export default UserImageUploads;
