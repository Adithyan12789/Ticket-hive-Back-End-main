"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const inversify_1 = require("inversify");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Socket_1 = require("../Config/Socket");
const mongoose_1 = __importDefault(require("mongoose"));
let ChatController = class ChatController {
    constructor(chatService) {
        this.chatService = chatService;
        this.getChatRooms = (0, express_async_handler_1.default)(async (req, res) => {
            const theaterOwnerId = req.theaterOwner._id;
            const chatRooms = await this.chatService.getChatRooms(theaterOwnerId);
            res.json(chatRooms);
        });
        this.createChatRoom = (0, express_async_handler_1.default)(async (req, res) => {
            const { adminId } = req.body;
            const theaterOwnerId = req.theaterOwner._id;
            const chatRoom = await this.chatService.createChatRoom(adminId, theaterOwnerId);
            res.status(201).json(chatRoom);
        });
        this.getMessages = (0, express_async_handler_1.default)(async (req, res) => {
            const chatRoomId = req.params.chatRoomId;
            console.log("ChatRoomId received in Controller for THeaterOwner:", chatRoomId);
            if (!mongoose_1.default.Types.ObjectId.isValid(chatRoomId)) {
                res.status(400).json({ error: "Invalid chatRoomId format" });
                return;
            }
            const messages = await this.chatService.getMessages(chatRoomId);
            res.json(messages);
        });
        this.sendMessage = (0, express_async_handler_1.default)(async (req, res) => {
            const chatRoomId = req.params.chatRoomId;
            const { content, senderType } = req.body;
            const file = req.file;
            const messageData = {
                chatRoomId,
                createdAt: Date.now(),
                content,
                senderType,
                sender: senderType === "Admin" ? req.admin._id : req.theaterOwner._id,
            };
            if (file) {
                messageData.fileUrl = `/MessageFiles/${file.filename}`;
                messageData.fileName = file.originalname;
            }
            const newMessage = await this.chatService.sendMessage(chatRoomId, messageData);
            Socket_1.io.to(chatRoomId).emit("message", newMessage);
            res.status(201).json(newMessage);
        });
        this.getUnreadMessages = (0, express_async_handler_1.default)(async (req, res) => {
            const theaterOwnerId = req.theaterOwner._id;
            const unreadMessages = await this.chatService.getUnreadMessages(theaterOwnerId);
            res.json(unreadMessages);
        });
        this.getAdminUnreadMessages = (0, express_async_handler_1.default)(async (req, res) => {
            const theaterOwnerId = req.theaterOwner._id;
            const unreadMessages = await this.chatService.getAdminUnreadMessages(theaterOwnerId);
            res.json(unreadMessages);
        });
        this.markMessagesAsRead = (0, express_async_handler_1.default)(async (req, res) => {
            const { chatRoomId } = req.body;
            await this.chatService.markMessagesAsRead(chatRoomId, "TheaterOwner");
            res.status(200).json({ message: "Messages marked as read" });
        });
        this.getAdminChatRooms = (0, express_async_handler_1.default)(async (req, res) => {
            const adminId = req.params.adminId;
            const chatRooms = await this.chatService.getAdminChatRooms(adminId);
            console.log("ChatRooms: ", chatRooms);
            res.json(chatRooms);
        });
        this.getAdminMessages = (0, express_async_handler_1.default)(async (req, res) => {
            const chatRoomId = req.params.chatRoomId;
            console.log("ChatRoomId received in Controller for Admin:", chatRoomId);
            if (!mongoose_1.default.Types.ObjectId.isValid(chatRoomId)) {
                res.status(400).json({ error: "Invalid chatRoomId format" });
                return;
            }
            const messages = await this.chatService.getAdminMessages(chatRoomId);
            res.json(messages);
        });
        this.sendAdminMessage = (0, express_async_handler_1.default)(async (req, res) => {
            const chatRoomId = req.params.chatRoomId;
            const { content, senderType, theaterOwnerId } = req.body;
            const file = req.file;
            const messageData = {
                chatRoomId,
                createdAt: Date.now(),
                content,
                senderType,
                sender: senderType === "Admin" ? req.admin?._id : theaterOwnerId,
                read: false,
            };
            if (file) {
                messageData.fileUrl = `/MessageFiles/${file.filename}`;
                messageData.fileName = file.originalname;
            }
            const newMessage = await this.chatService.sendAdminMessage(chatRoomId, messageData);
            Socket_1.io.to(chatRoomId).emit("message", newMessage);
            res.status(201).json(newMessage);
        });
        this.markAdminMessagesAsRead = (0, express_async_handler_1.default)(async (req, res) => {
            const { chatRoomId } = req.body;
            await this.chatService.markMessagesAsRead(chatRoomId, "Admin");
            res.status(200).json({ message: "Messages marked as read" });
        });
    }
};
exports.ChatController = ChatController;
exports.ChatController = ChatController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("IChatService")),
    __metadata("design:paramtypes", [Object])
], ChatController);
//# sourceMappingURL=ChatController.js.map