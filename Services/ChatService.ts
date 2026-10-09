import { inject, injectable } from "inversify"
import mongoose, { Types } from "mongoose"
import { IChatService } from "../Interface/IChat/IService"
import { IChatRepository } from "../Interface/IChat/IRepository"
import { io } from "../Config/Socket"
import { IChatRoom } from "../Models/ChatRoomModel"
import { IMessage } from "../Models/MessageModel"

@injectable()
export class ChatService implements IChatService {
  constructor(
    @inject("IChatRepository") private chatRepository: IChatRepository
  ) {}

  async getChatRooms(theaterOwnerId: string): Promise<IChatRoom[]> {
    const chatRooms = await this.chatRepository.findChatRooms({ theaterOwnerId })
    const chatRoomsWithUnreadCount = await Promise.all(
      chatRooms.map(async (room: any) => {
        const unreadMessagesCount = await this.chatRepository.countMessages({
          chatRoomId: room._id,
          senderType: "Admin",
          read: false,
        })

        io.in(room._id.toString()).emit("unreadMessage", {
          roomId: room._id.toString(),
          count: unreadMessagesCount,
        })

        return {
          ...room.toObject(),
          unreadMessagesCount,
        }
      }),
    )
    return chatRoomsWithUnreadCount
  }

  async createChatRoom(adminId: string, theaterOwnerId: string): Promise<IChatRoom> {
    let chatRoom = await this.chatRepository.findChatRooms({ adminId, theaterOwnerId })
    if (chatRoom.length === 0) {
      chatRoom = [await this.chatRepository.createChatRoom({ adminId, theaterOwnerId })]
    }
    return chatRoom[0]
  }

  async getMessages(chatRoomId: any): Promise<any[]> {
    console.log("Received TheaterOwner chatRoomId:", chatRoomId);
  
    if (!mongoose.Types.ObjectId.isValid(chatRoomId)) {
      throw new Error("Invalid chatRoomId format. Expected a 24-character hex string.");
    }
  
    const messages = await this.chatRepository.findMessages(chatRoomId);
    return messages.sort((a: { timestamp: any }, b: { timestamp: any }) => a.timestamp - b.timestamp);
  }

  async sendMessage(chatRoomId: string, messageData: IMessage): Promise<any> {
    const newMessage = await this.chatRepository.createMessage(messageData)
    await this.chatRepository.updateChatRoom(new Types.ObjectId(chatRoomId).toString(), {
      lastMessage: messageData.content,
      lastMessageTime: Date.now(),
    })
    return newMessage
  }

  async getUnreadMessages(theaterOwnerId: string): Promise<any[]> {
    const chatRooms = await this.chatRepository.findChatRooms({ theaterOwnerId })
    const chatRoomIds = chatRooms.map((room: any) => room._id)
    return this.chatRepository.findMessages({
      chatRoomId: { $in: chatRoomIds },
      senderType: "TheaterOwner",
      read: false,
    })
  }

  async getAdminUnreadMessages(theaterOwnerId: string): Promise<any[]> {
    const chatRooms = await this.chatRepository.findChatRooms({ theaterOwnerId })
    const chatRoomIds = chatRooms.map((room: any) => room._id)
    return this.chatRepository.findMessages({
      chatRoomId: { $in: chatRoomIds },
      senderType: "Admin",
      read: false,
    })
  }

  async markMessagesAsRead(chatRoomId: string, senderType: string): Promise<void> {
    await this.chatRepository.updateManyMessages(
      { chatRoomId, senderType: { $ne: senderType }, read: false },
      { $set: { read: true } },
    )
  }

  async getAdminChatRooms(adminId: string): Promise<any[]> {
    const chatRooms = await this.chatRepository.findAdminChatRooms({ adminId })
    const chatRoomsWithUnreadCount = await Promise.all(
      chatRooms.map(async (room: any) => {
        const unreadMessagesCount = await this.chatRepository.countMessages({
          chatRoomId: room._id,
          senderType: "TheaterOwner",
          read: false,
        })

        io.in(room._id.toString()).emit("unreadMessage", {
          roomId: room._id.toString(),
          count: unreadMessagesCount,
        })

        return {
          ...room.toObject(),
          unreadMessagesCount,
        }
      }),
    )
    return chatRoomsWithUnreadCount
  }

  async getAdminMessages(chatRoomId: string): Promise<any[]> {
    console.log("Received chatRoomId:", chatRoomId);
  
    if (!mongoose.Types.ObjectId.isValid(chatRoomId)) {
      throw new Error("Invalid chatRoomId format. Expected a 24-character hex string.");
    }
  
    const messages = await this.chatRepository.findMessages(chatRoomId);
    return messages.sort((a: { timestamp: any }, b: { timestamp: any }) => a.timestamp - b.timestamp);
  }
  

  async sendAdminMessage(chatRoomId: string, messageData: IMessage): Promise<any> {
    const newMessage = await this.chatRepository.createMessage(messageData)
    await this.chatRepository.updateChatRoom(new Types.ObjectId(chatRoomId).toString(), {
      lastMessage: messageData.content,
      lastMessageTime: Date.now(),
    })
    return newMessage
  }
}

