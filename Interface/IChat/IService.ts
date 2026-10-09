// IChatService.ts

import type { Types } from "mongoose"
import { IMessage } from "../../Models/MessageModel"
import { IChatRoom } from "../../Models/ChatRoomModel"

export interface IChatService {
  getChatRooms(theaterOwnerId: string): Promise<IChatRoom[]>
  createChatRoom(adminId: string, theaterOwnerId: any): Promise<IChatRoom>
  getMessages(chatRoomId: string): Promise<IMessage[]>
  sendMessage(chatRoomId: string, messageData: IMessage): Promise<IMessage>
  getUnreadMessages(theaterOwnerId: string): Promise<IMessage[]>
  getAdminUnreadMessages(theaterOwnerId: string): Promise<IMessage[]>
  markMessagesAsRead(chatRoomId: string, senderType: string): Promise<any>
  getAdminChatRooms(adminId: string): Promise<IChatRoom[]>
  getAdminMessages(chatRoomId: string): Promise<IMessage[]>
  sendAdminMessage(chatRoomId: string, messageData: any): Promise<IMessage>
}