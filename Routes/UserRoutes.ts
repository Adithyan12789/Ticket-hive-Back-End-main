import express from 'express';
import "reflect-metadata";
import { UserController } from '../Controllers/UserController';
import { AuthMiddleware } from '../Middlewares/AuthMiddleware';
import MulterConfig from '../Config/Multer/UserMulter';
import { MovieController } from '../Controllers/MovieController';
import { TheaterController } from '../Controllers/TheaterController';
import { ScreenController } from '../Controllers/ScreenController';
import { BookingController } from '../Controllers/BookingController';
import { WalletController } from '../Controllers/WalletController';
import { container } from '../Config/container';
import { NotificationController } from '../Controllers/NotificationController';
import { ReviewController } from '../Controllers/ReviewController';

const router = express.Router();

const userControllerr = container.get<UserController>("UserController");
const theaterControllerr = container.get<TheaterController>("TheaterController");
const bookingControllerr = container.get<BookingController>("BookingController");
const notificationControllerr = container.get<NotificationController>("NotificationController");
const movieController = container.get<MovieController>("MovieController");
const reviewControllerr = container.get<ReviewController>("ReviewController");
const walletControllerr = container.get<WalletController>("WalletController");
const screenControllerr = container.get<ScreenController>("ScreenController");

router.post('/auth', userControllerr.authUser);
router.post('/googleLogin', userControllerr.googleLogin);
router.post('/sign-up', userControllerr.registerUser);
router.post('/verifyotp', userControllerr.verifyOTP);
router.post('/resend-otp', userControllerr.resendOtp);
router.post('/forgot-password', userControllerr.forgotPassword);
router.put('/reset-password/:token', userControllerr.resetPassword);

router.post('/refresh-token', userControllerr.refreshToken);

router.post('/save-location', AuthMiddleware, userControllerr.saveLocationController);

router.route('/profile')
    .get(AuthMiddleware, userControllerr.getUserProfile)
    .put(AuthMiddleware, MulterConfig.multerUploadUserProfile.single('profileImage'), userControllerr.updateUserProfile);

router.get('/get-movies', (req, res) => movieController.getAllMoviesController(req, res));
router.get('/movie-detail/:id', (req, res) => movieController.getMovieByIdHandler(req, res));

router.get('/reviews/:movieId', reviewControllerr.getReviewsController);
router.get('/allReviews', reviewControllerr.getAllReviewsController);
router.post('/reviews', AuthMiddleware, reviewControllerr.addReviewsController);
router.put('/reviews/:reviewId/vote', AuthMiddleware, reviewControllerr.voteReviewController);


router.get('/movie-theaters/:movieTitle', theaterControllerr.getTheatersByMovieTitle);

router.get('/screen/:screenId', screenControllerr.getScreensById);

router.post('/update-availability', AuthMiddleware, screenControllerr.updateSeatAvailability);

router.get('/offers/:theaterId', userControllerr.getOffersByTheaterId);

router.post('/book-ticket', AuthMiddleware, bookingControllerr.createBooking);
router.get('/get-tickets/:userId', AuthMiddleware, bookingControllerr.getAllTickets);
router.get("/tickets/:ticketId", AuthMiddleware, bookingControllerr.getTicketDetails);
router.post('/cancel-ticket/:bookingId', AuthMiddleware, bookingControllerr.cancelTicket);

router.get('/notifications/unread', AuthMiddleware, notificationControllerr.getUnreadNotifications);
router.put('/notifications/:id/read', AuthMiddleware, notificationControllerr.markNotificationAsRead);
router.delete('/clearNotifications', AuthMiddleware, notificationControllerr.clearNotifications);

router.post('/create-wallet-transaction', AuthMiddleware, walletControllerr.addMoneyToWallet);
router.get('/transaction-history/:userId', AuthMiddleware, walletControllerr.getTransactionHistory);

router.post('/logout', userControllerr.logoutUser);

export default router;
