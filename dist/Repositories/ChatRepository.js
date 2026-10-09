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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRepository = void 0;
const inversify_1 = require("inversify");
const ChatRoomModel_1 = require("../Models/ChatRoomModel");
const MessageModel_1 = require("../Models/MessageModel");
const BaseRepository_1 = require("./Base/BaseRepository");
const mongoose_1 = __importDefault(require("mongoose"));
let ChatRepository = class ChatRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(ChatRoomModel_1.ChatRoom);
        this.bookModel = ChatRoomModel_1.ChatRoom;
    }
    async createChatRoom(data) {
        return await ChatRoomModel_1.ChatRoom.create(data);
    }
    async findChatRooms(theaterOwnerId) {
        return await ChatRoomModel_1.ChatRoom.find(theaterOwnerId).populate("adminId", "name");
    }
    async findAdminChatRooms(adminId) {
        return await ChatRoomModel_1.ChatRoom.find(adminId).populate('theaterOwnerId', 'name');
    }
    async findMessages(chatRoomId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(chatRoomId)) {
            console.error("Invalid ObjectId received in repository:", chatRoomId);
            throw new Error("Invalid chatRoomId format");
        }
        return await MessageModel_1.Message.find({ chatRoomId: new mongoose_1.default.Types.ObjectId(chatRoomId) }).sort("createdAt");
    }
    async createMessage(messageData) {
        return await MessageModel_1.Message.create(messageData);
    }
    async updateChatRoomLastMessage(chatRoomId, lastMessage, lastMessageTime) {
        return await ChatRoomModel_1.ChatRoom.findByIdAndUpdate(chatRoomId, {
            lastMessage,
            lastMessageTime,
        });
    }
    async updateUnreadMessages(chatRoomId, senderType) {
        return await MessageModel_1.Message.updateMany({ chatRoomId, senderType: { $ne: senderType }, read: false }, { $set: { read: true } });
    }
    async updateChatRoom(id, update) {
        return await ChatRoomModel_1.ChatRoom.findByIdAndUpdate(id, update, { new: true });
    }
    async countMessages(filter) {
        return await MessageModel_1.Message.countDocuments(filter);
    }
    async updateManyMessages(filter, update) {
        return await MessageModel_1.Message.updateMany(filter, update);
    }
};
exports.ChatRepository = ChatRepository;
exports.ChatRepository = ChatRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], ChatRepository);
//# sourceMappingURL=ChatRepository.js.map