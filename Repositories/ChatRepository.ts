import { injectable } from "inversify";
import { IChatRepository } from "../Interface/IChat/IRepository";
import { ChatRoom, IChatRoom } from "../Models/ChatRoomModel";
import { IMessage, Message } from "../Models/MessageModel";
import { BaseRepository } from "./Base/BaseRepository";
import mongoose from "mongoose";

@injectable()
export class ChatRepository
  extends BaseRepository<IChatRoom>
  implements IChatRepository
{
  private readonly bookModel = ChatRoom;

  constructor() {
    super(ChatRoom);
  }

  async createChatRoom(
    data: Partial<{ adminId: any; theaterOwnerId: any }>
  ) {
    return await ChatRoom.create(data);
  }

  async findChatRooms(theaterOwnerId: any) {
    return await ChatRoom.find(theaterOwnerId).populate("adminId", "name");
  }  
  
  async findAdminChatRooms(adminId: any) {
    return await ChatRoom.find(adminId).populate('theaterOwnerId', 'name');
  }

  async findMessages(chatRoomId: any): Promise<any[]> {
    if (!mongoose.Types.ObjectId.isValid(chatRoomId)) {
      console.error("Invalid ObjectId received in repository:", chatRoomId);
      throw new Error("Invalid chatRoomId format");
    }
  
    return await Message.find({ chatRoomId: new mongoose.Types.ObjectId(chatRoomId) }).sort("createdAt");
  }  

  async createMessage(messageData: any) {
    return await Message.create(messageData);
  }

  async updateChatRoomLastMessage(
    chatRoomId: any,
    lastMessage: any,
    lastMessageTime: any
  ) {
    return await ChatRoom.findByIdAndUpdate(chatRoomId, {
      lastMessage,
      lastMessageTime,
    });
  }

  async updateUnreadMessages(chatRoomId: any, senderType: any) {
    return await Message.updateMany(
      { chatRoomId, senderType: { $ne: senderType }, read: false },
      { $set: { read: true } }
    );
  }

  // Missing methods from IChatRepository

  async updateChatRoom(id: string, update: Partial<IChatRoom>): Promise<IChatRoom | null> {
    return await ChatRoom.findByIdAndUpdate(id, update, { new: true });
  }

  async countMessages(filter: object): Promise<number | null> {
    return await Message.countDocuments(filter);
  }

  async updateManyMessages(filter: object, update: IMessage): Promise<any | null> {
    return await Message.updateMany(filter, update);
  }
}
