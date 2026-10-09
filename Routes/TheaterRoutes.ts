import express from 'express';
import { TheaterController } from '../Controllers/TheaterController';
import { ScreenController } from '../Controllers/ScreenController';
import { TheaterAuthMiddleware } from '../Middlewares/TheaterAuthMiddleware';
import MulterConfig from '../Config/Multer/TheaterMulter';
import { MovieController } from '../Controllers/MovieController';
import { ChatController } from '../Controllers/ChatController';
import { AdminController } from '../Controllers/AdminController';
import { container } from '../Config/container';
import { OfferController } from '../Controllers/OffersController';
import { BookingController } from '../Controllers/BookingController';

const router = express.Router();

const adminControllerr = container.get<AdminController>("AdminController");
const theaterControllerr = container.get<TheaterController>("TheaterController");
const chatControllerr = container.get<ChatController>("ChatController");
const movieControllerr = container.get<MovieController>("MovieController");
const offerControllerr = container.get<OfferController>("OfferController");
const screenControllerr = container.get<ScreenController>("ScreenController");
const bookingControllerr = container.get<BookingController>("BookingController");

router.post('/theater-login', theaterControllerr.authTheaterOwner);
router.post('/theater-GoogleLogin', theaterControllerr.googleLoginTheaterOwner);
router.post('/theater-signup', theaterControllerr.registerTheaterOwner);
router.post('/theater-verifyotp', theaterControllerr.verifyTheaterOwnerOTP);
router.post('/theater-resend-otp', theaterControllerr.resendTheaterOwnerOtp);
router.post('/theater-forgot-password', theaterControllerr.forgotTheaterOwnerPassword);
router.put('/theater-reset-password/:token', theaterControllerr.resetTheaterOwnerPassword);

router.get('/stats/:ownerId', TheaterAuthMiddleware.protect, theaterControllerr.getStatsController);

router.route('/theater-profile')
.get( TheaterAuthMiddleware.protect, theaterControllerr.getTheaterProfile )
.put( TheaterAuthMiddleware.protect, MulterConfig.multerUploadTheaterProfile.single('profileImage'), theaterControllerr.updateTheaterProfile);

router.post('/upload-certificate/:theaterId', TheaterAuthMiddleware.protect, MulterConfig.multerUploadCertificates.single('certificate'), theaterControllerr.uploadVerificationDetailsHandler); 

router.post("/add-theaters",TheaterAuthMiddleware.protect, MulterConfig.multerUploadTheaterImages.array("images", 3),theaterControllerr.addTheaterController);
router.get('/get-theaters',TheaterAuthMiddleware.protect, theaterControllerr.getTheaters);

router.route('/theaters/:id')
    .get(TheaterAuthMiddleware.protect, theaterControllerr.getTheaterByIdHandler)
    .put(TheaterAuthMiddleware.protect, MulterConfig.multerUploadTheaterImages.array("images", 3), theaterControllerr.updateTheaterHandler)
    .delete(TheaterAuthMiddleware.protect, theaterControllerr.deleteTheaterHandler);

router.get('/bookings/:id', TheaterAuthMiddleware.protect, bookingControllerr.getTheaterBookings);
router.patch('/statusChange/:bookingId', TheaterAuthMiddleware.protect, bookingControllerr.updateBookingStatus);

router.post('/add-screen/:theaterId', TheaterAuthMiddleware.protect, screenControllerr.addScreen); 
router.put('/update-screen/:screenId', TheaterAuthMiddleware.protect, screenControllerr.updateScreen);
router.delete('/delete-screen/:screenId', TheaterAuthMiddleware.protect, screenControllerr.deleteScreen);
router.get('/theaters/:id/screens', TheaterAuthMiddleware.protect, screenControllerr.getScreensByTheaterId);

router.get('/screen/:screenId', TheaterAuthMiddleware.protect, screenControllerr.getScreensById);

router.get('/get-movies',TheaterAuthMiddleware.protect, movieControllerr.getAllMoviesController);

router.post('/add-offer',TheaterAuthMiddleware.protect, offerControllerr.addOfferController);
router.put('/update-offer/:offerId', TheaterAuthMiddleware.protect, offerControllerr.updateOfferController);
router.delete('/delete-offer/:offerId', TheaterAuthMiddleware.protect, offerControllerr.deleteOfferController);
router.get('/get-offers',TheaterAuthMiddleware.protect, offerControllerr.getOffersController);
router.get('/getAlltickets', TheaterAuthMiddleware.protect, adminControllerr.getAllTickets);

router.get('/get-admins',TheaterAuthMiddleware.protect, adminControllerr.getAdmins);

router.route('/chatrooms').get(TheaterAuthMiddleware.protect, chatControllerr.getChatRooms).post(TheaterAuthMiddleware.protect, chatControllerr.createChatRoom); 
router.route('/chatrooms/:chatRoomId/messages').get(TheaterAuthMiddleware.protect, chatControllerr.getMessages).post(MulterConfig.multerUploadChatFiles.single('file'),TheaterAuthMiddleware.protect, chatControllerr.sendMessage); 
router.get('/unread-messages', TheaterAuthMiddleware.protect, chatControllerr.getUnreadMessages); 
router.route('/mark-messages-read').post(TheaterAuthMiddleware.protect, chatControllerr.markMessagesAsRead); 

router.post('/theater-logout', theaterControllerr.logoutTheaterOwner);

export default router;