import multer, { StorageEngine, FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";

const baseDir = process.cwd();

class TheaterImageUploads {
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

  private static theaterOwnerStorage(): StorageEngine {
    return this.createStorage("TheaterProfileImages");
  }

  private static theatersStorage(): StorageEngine {
    return this.createStorage("TheatersImages");
  }

  private static uploadCertificateStorage(): StorageEngine {
    return this.createStorage("UploadsCerificates");
  }

  private static chatStorage(): StorageEngine {
    return this.createStorage("MessageFiles");
  }

  // Allow only images
  private static imageFileFilter(
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

  // Allow images and specific document types
  private static documentAndImageFileFilter(
    req: Express.Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ): void {
    const allowedMimetypes = [
      "image/",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ];

    if (allowedMimetypes.some((type) => file.mimetype.startsWith(type) || file.mimetype === type)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only images, PDFs, and certain document files are allowed!"
        ) as any,
        false
      );
    }
  }

  public static multerUploadTheaterProfile = multer({
    storage: this.theaterOwnerStorage(),
    fileFilter: this.imageFileFilter,
  });

  public static multerUploadTheaterImages = multer({
    storage: this.theatersStorage(),
    fileFilter: this.imageFileFilter,
  });

  public static multerUploadCertificates = multer({
    storage: this.uploadCertificateStorage(),
    fileFilter: this.documentAndImageFileFilter,
  });

  public static multerUploadChatFiles = multer({
    storage: this.chatStorage(),
    fileFilter: this.documentAndImageFileFilter,
  });
}

export default TheaterImageUploads;
