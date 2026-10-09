"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const inversify_1 = require("inversify");
const mongoose_1 = __importStar(require("mongoose"));
const Socket_1 = require("../Config/Socket");
let ChatService = class ChatService {
    constructor(chatRepository) {
        this.chatRepository = chatRepository;
    }
    async getChatRooms(theaterOwnerId) {
        const chatRooms = await this.chatRepository.findChatRooms({ theaterOwnerId });
        const chatRoomsWithUnreadCount = await Promise.all(chatRooms.map(async (room) => {
            const unreadMessagesCount = await this.chatRepository.countMessages({
                chatRoomId: room._id,
                senderType: "Admin",
                read: false,
            });
            Socket_1.io.in(room._id.toString()).emit("unreadMessage", {
                roomId: room._id.toString(),
                count: unreadMessagesCount,
            });
            return {
                ...room.toObject(),
                unreadMessagesCount,
            };
        }));
        return chatRoomsWithUnreadCount;
    }
    async createChatRoom(adminId, theaterOwnerId) {
        let chatRoom = await this.chatRepository.findChatRooms({ adminId, theaterOwnerId });
        if (chatRoom.length === 0) {
            chatRoom = [await this.chatRepository.createChatRoom({ adminId, theaterOwnerId })];
        }
        return chatRoom[0];
    }
    async getMessages(chatRoomId) {
        console.log("Received TheaterOwner chatRoomId:", chatRoomId);
        if (!mongoose_1.default.Types.ObjectId.isValid(chatRoomId)) {
            throw new Error("Invalid chatRoomId format. Expected a 24-character hex string.");
        }
        const messages = await this.chatRepository.findMessages(chatRoomId);
        return messages.sort((a, b) => a.timestamp - b.timestamp);
    }
    async sendMessage(chatRoomId, messageData) {
        const newMessage = await this.chatRepository.createMessage(messageData);
        await this.chatRepository.updateChatRoom(new mongoose_1.Types.ObjectId(chatRoomId).toString(), {
            lastMessage: messageData.content,
            lastMessageTime: Date.now(),
        });
        return newMessage;
    }
    async getUnreadMessages(theaterOwnerId) {
        const chatRooms = await this.chatRepository.findChatRooms({ theaterOwnerId });
        const chatRoomIds = chatRooms.map((room) => room._id);
        return this.chatRepository.findMessages({
            chatRoomId: { $in: chatRoomIds },
            senderType: "TheaterOwner",
            read: false,
        });
    }
    async getAdminUnreadMessages(theaterOwnerId) {
        const chatRooms = await this.chatRepository.findChatRooms({ theaterOwnerId });
        const chatRoomIds = chatRooms.map((room) => room._id);
        return this.chatRepository.findMessages({
            chatRoomId: { $in: chatRoomIds },
            senderType: "Admin",
            read: false,
        });
    }
    async markMessagesAsRead(chatRoomId, senderType) {
        await this.chatRepository.updateManyMessages({ chatRoomId, senderType: { $ne: senderType }, read: false }, { $set: { read: true } });
    }
    async getAdminChatRooms(adminId) {
        const chatRooms = await this.chatRepository.findAdminChatRooms({ adminId });
        const chatRoomsWithUnreadCount = await Promise.all(chatRooms.map(async (room) => {
            const unreadMessagesCount = await this.chatRepository.countMessages({
                chatRoomId: room._id,
                senderType: "TheaterOwner",
                read: false,
            });
            Socket_1.io.in(room._id.toString()).emit("unreadMessage", {
                roomId: room._id.toString(),
                count: unreadMessagesCount,
            });
            return {
                ...room.toObject(),
                unreadMessagesCount,
            };
        }));
        return chatRoomsWithUnreadCount;
    }
    async getAdminMessages(chatRoomId) {
        console.log("Received chatRoomId:", chatRoomId);
        if (!mongoose_1.default.Types.ObjectId.isValid(chatRoomId)) {
            throw new Error("Invalid chatRoomId format. Expected a 24-character hex string.");
        }
        const messages = await this.chatRepository.findMessages(chatRoomId);
        return messages.sort((a, b) => a.timestamp - b.timestamp);
    }
    async sendAdminMessage(chatRoomId, messageData) {
        const newMessage = await this.chatRepository.createMessage(messageData);
        await this.chatRepository.updateChatRoom(new mongoose_1.Types.ObjectId(chatRoomId).toString(), {
            lastMessage: messageData.content,
            lastMessageTime: Date.now(),
        });
        return newMessage;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("IChatRepository")),
    __metadata("design:paramtypes", [Object])
], ChatService);
//# sourceMappingURL=ChatService.js.map