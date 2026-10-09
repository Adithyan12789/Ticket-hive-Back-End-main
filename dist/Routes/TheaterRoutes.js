"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const TheaterAuthMiddleware_1 = require("../Middlewares/TheaterAuthMiddleware");
const TheaterMulter_1 = __importDefault(require("../Config/Multer/TheaterMulter"));
const container_1 = require("../Config/container");
const router = express_1.default.Router();
const adminControllerr = container_1.container.get("AdminController");
const theaterControllerr = container_1.container.get("TheaterController");
const chatControllerr = container_1.container.get("ChatController");
const movieControllerr = container_1.container.get("MovieController");
const offerControllerr = container_1.container.get("OfferController");
const screenControllerr = container_1.container.get("ScreenController");
const bookingControllerr = container_1.container.get("BookingController");
router.post('/theater-login', theaterControllerr.authTheaterOwner);
router.post('/theater-GoogleLogin', theaterControllerr.googleLoginTheaterOwner);
router.post('/theater-signup', theaterControllerr.registerTheaterOwner);
router.post('/theater-verifyotp', theaterControllerr.verifyTheaterOwnerOTP);
router.post('/theater-resend-otp', theaterControllerr.resendTheaterOwnerOtp);
router.post('/theater-forgot-password', theaterControllerr.forgotTheaterOwnerPassword);
router.put('/theater-reset-password/:token', theaterControllerr.resetTheaterOwnerPassword);
router.get('/stats/:ownerId', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, theaterControllerr.getStatsController);
router.route('/theater-profile')
    .get(TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, theaterControllerr.getTheaterProfile)
    .put(TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, TheaterMulter_1.default.multerUploadTheaterProfile.single('profileImage'), theaterControllerr.updateTheaterProfile);
router.post('/upload-certificate/:theaterId', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, TheaterMulter_1.default.multerUploadCertificates.single('certificate'), theaterControllerr.uploadVerificationDetailsHandler);
router.post("/add-theaters", TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, TheaterMulter_1.default.multerUploadTheaterImages.array("images", 3), theaterControllerr.addTheaterController);
router.get('/get-theaters', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, theaterControllerr.getTheaters);
router.route('/theaters/:id')
    .get(TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, theaterControllerr.getTheaterByIdHandler)
    .put(TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, TheaterMulter_1.default.multerUploadTheaterImages.array("images", 3), theaterControllerr.updateTheaterHandler)
    .delete(TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, theaterControllerr.deleteTheaterHandler);
router.get('/bookings/:id', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, bookingControllerr.getTheaterBookings);
router.patch('/statusChange/:bookingId', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, bookingControllerr.updateBookingStatus);
router.post('/add-screen/:theaterId', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, screenControllerr.addScreen);
router.put('/update-screen/:screenId', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, screenControllerr.updateScreen);
router.delete('/delete-screen/:screenId', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, screenControllerr.deleteScreen);
router.get('/theaters/:id/screens', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, screenControllerr.getScreensByTheaterId);
router.get('/screen/:screenId', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, screenControllerr.getScreensById);
router.get('/get-movies', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, movieControllerr.getAllMoviesController);
router.post('/add-offer', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, offerControllerr.addOfferController);
router.put('/update-offer/:offerId', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, offerControllerr.updateOfferController);
router.delete('/delete-offer/:offerId', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, offerControllerr.deleteOfferController);
router.get('/get-offers', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, offerControllerr.getOffersController);
router.get('/getAlltickets', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, adminControllerr.getAllTickets);
router.get('/get-admins', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, adminControllerr.getAdmins);
router.route('/chatrooms').get(TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, chatControllerr.getChatRooms).post(TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, chatControllerr.createChatRoom);
router.route('/chatrooms/:chatRoomId/messages').get(TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, chatControllerr.getMessages).post(TheaterMulter_1.default.multerUploadChatFiles.single('file'), TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, chatControllerr.sendMessage);
router.get('/unread-messages', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, chatControllerr.getUnreadMessages);
router.route('/mark-messages-read').post(TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, chatControllerr.markMessagesAsRead);
router.post('/theater-logout', theaterControllerr.logoutTheaterOwner);
exports.default = router;
//# sourceMappingURL=TheaterRoutes.js.map