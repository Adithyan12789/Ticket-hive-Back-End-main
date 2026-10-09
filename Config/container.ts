import { Container } from "inversify";
import { IAdminRepository } from "../Interface/IAdmin/IRepository";
import { AdminRepository } from "../Repositories/AdminRepo";
import { IAdminService } from "../Interface/IAdmin/IService";
import { AdminController } from "../Controllers/AdminController";
import { AdminService } from "../Services/AdminService";
import { TheaterController } from "../Controllers/TheaterController";
import { TheaterService } from "../Services/TheaterService";
import { TheaterRepository } from "../Repositories/TheaterRepo";
import { ITheaterService } from "../Interface/ITheater/IService";
import { ITheaterRepository } from "../Interface/ITheater/IRepository";
import { UserController } from "../Controllers/UserController";
import { IUserService } from "../Interface/IUser/IService";
import { IUserRepository } from "../Interface/IUser/IRepository";
import { UserService } from "../Services/UserService";
import { UserRepository } from "../Repositories/UserRepo";
import { IBookingService } from "../Interface/IBooking/IService";
import { BookingController } from "../Controllers/BookingController";
import { BookingService } from "../Services/BookingService";
import { IBookingRepository } from "../Interface/IBooking/IRepository";
import { BookingRepository } from "../Repositories/BookingRepo";
import { INotificationRepository } from "../Interface/INotification/IRepository";
import { NotificationService } from "../Services/NotificationService";
import { INotificationService } from "../Interface/INotification/IService";
import { ChatController } from "../Controllers/ChatController";
import { IChatService } from "../Interface/IChat/IService";
import { IChatRepository } from "../Interface/IChat/IRepository";
import { MovieController } from "../Controllers/MovieController";
import { IMovieService } from "../Interface/IMovie/IService";
import { MovieService } from "../Services/MovieService";
import { IMovieRepository } from "../Interface/IMovie/IRepository";
import MovieRepository from "../Repositories/MovieRepo";

import { IReviewService } from "../Interface/IReview/IService";
import { IReviewRepository } from "../Interface/IReview/IRepository";
import { ReviewController } from "../Controllers/ReviewController";
import { OfferController } from "../Controllers/OffersController";
import { OfferService } from "../Services/OffersService";
import { OfferRepository } from "../Repositories/OffersRepo";
import { IOfferService } from "../Interface/IOffer/IService";
import { IOfferRepository } from "../Interface/IOffer/IRepository";
import { WalletController } from "../Controllers/WalletController";
import { WalletService } from "../Services/WalletService";
import { IWalletRepository } from "../Interface/IWallet/IRepository";
import { IWalletService } from "../Interface/IWallet/IService";
import { WalletRepository } from "../Repositories/WalletRepo";
import { ScreenController } from "../Controllers/ScreenController";
import { IScreenRepository } from "../Interface/IScreen/IRepository";
import { IScreenService } from "../Interface/IScreen/IService";
import ScreenRepository from "../Repositories/ScreenRepo";
import { ScreenService } from "../Services/ScreenService";
import { NotificationController } from "../Controllers/NotificationController";
import { ChatRepository } from "../Repositories/ChatRepository";
import { NotificationRepository } from "../Repositories/NotificationRepo";
import { ReviewRepository } from "../Repositories/ReviewRepo";
import { ChatService } from "../Services/ChatService";
import { ReviewService } from "../Services/ReviewService";

const container = new Container();

// Admin Binding

container.bind<AdminController>("AdminController").to(AdminController).inSingletonScope();
container.bind<IAdminService>("IAdminService").to(AdminService).inSingletonScope();;
container.bind<IAdminRepository>("IAdminRepository").to(AdminRepository).inSingletonScope();



// Theater Binding

container.bind<TheaterController>("TheaterController").to(TheaterController);
container.bind<ITheaterService>("ITheaterService").to(TheaterService);
container.bind<ITheaterRepository>("ITheaterRepository").to(TheaterRepository);



// User Bindings

container.bind<UserController>("UserController").to(UserController);
container.bind<IUserService>("IUserService").to(UserService);
container.bind<IUserRepository>("IUserRepository").to(UserRepository);



// Booking Bindings

container.bind<BookingController>("BookingController").to(BookingController).inSingletonScope();
container.bind<IBookingService>("IBookingService").to(BookingService).inSingletonScope();
container.bind<IBookingRepository>("IBookingRepository").to(BookingRepository).inSingletonScope();




// Booking Bindings

container.bind<NotificationController>("NotificationController").to(NotificationController);
container.bind<INotificationService>("INotificationService").to(NotificationService);
container.bind<INotificationRepository>("INotificationRepository").to(NotificationRepository);




// ChatRoom Bindings

container.bind<ChatController>("ChatController").to(ChatController);
container.bind<IChatService>("IChatService").to(ChatService);
container.bind<IChatRepository>("IChatRepository").to(ChatRepository);




// Movie Bindings

container.bind<MovieController>("MovieController").to(MovieController).inSingletonScope();
container.bind<IMovieService>("IMovieService").to(MovieService).inSingletonScope();
container.bind<IMovieRepository>("IMovieRepository").to(MovieRepository).inSingletonScope();




// Review Bindings

container.bind<ReviewController>("ReviewController").to(ReviewController);
container.bind<IReviewService>("IReviewService").to(ReviewService);
container.bind<IReviewRepository>("IReviewRepository").to(ReviewRepository);




// Offer Bindings

container.bind<OfferController>("OfferController").to(OfferController);
container.bind<IOfferService>("IOfferService").to(OfferService);
container.bind<IOfferRepository>("IOfferRepository").to(OfferRepository);




// Wallet Bindings

container.bind<WalletController>("WalletController").to(WalletController);
container.bind<IWalletService>("IWalletService").to(WalletService);
container.bind<IWalletRepository>("IWalletRepository").to(WalletRepository);




// Screen Bindings

container.bind<ScreenController>("ScreenController").to(ScreenController);
container.bind<IScreenService>("IScreenService").to(ScreenService);
container.bind<IScreenRepository>("IScreenRepository").to(ScreenRepository);

// Cast Bindings
import { CastController } from "../Controllers/CastController";
container.bind<CastController>("CastController").to(CastController);

export { container };