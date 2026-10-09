// IChatRepository.ts

import { IChatRoom } from "../../Models/ChatRoomModel";
import { IMessage } from "../../Models/MessageModel";

export interface IChatRepository {
  findChatRooms(filter: object): Promise<IChatRoom[]>;
  findAdminChatRooms(adminId: object): Promise<IChatRoom[]>;
  createChatRoom(data: Partial<object>): Promise<IChatRoom>;
  findMessages(filter: any): Promise<any[]>;
  createMessage(data: Partial<object>): Promise<IMessage>;
  updateChatRoom(id: string, update: Partial<any>): Promise<IChatRoom | null>;
  countMessages(filter: object): Promise<number | null>;
  updateManyMessages(filter: object, update: any): Promise<any | null>;
}

