import { inject, injectable } from "inversify"
import expressAsyncHandler from "express-async-handler"
import type { Request, Response } from "express"
import { IChatService } from "../Interface/IChat/IService"
import { CustomRequest } from "../Middlewares/AdminAuthMiddleware"
import { io } from "../Config/Socket"
import mongoose from "mongoose"

@injectable()
export class ChatController {
  constructor(
    @inject("IChatService") private readonly chatService: IChatService,
  ) {}

  getChatRooms = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const theaterOwnerId = (req as any).theaterOwner._id
    const chatRooms = await this.chatService.getChatRooms(theaterOwnerId)
    
    res.json(chatRooms)
  })

  createChatRoom = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { adminId } = req.body
    const theaterOwnerId = (req as any).theaterOwner._id
    const chatRoom = await this.chatService.createChatRoom(adminId, theaterOwnerId)
    res.status(201).json(chatRoom)
  })

  getMessages = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const chatRoomId = req.params.chatRoomId;
  
    console.log("ChatRoomId received in Controller for THeaterOwner:", chatRoomId);
  
    if (!mongoose.Types.ObjectId.isValid(chatRoomId)) {
      res.status(400).json({ error: "Invalid chatRoomId format" });
      return;
    }
  
    const messages = await this.chatService.getMessages(chatRoomId);
    res.json(messages);
  })

  sendMessage = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const chatRoomId = req.params.chatRoomId
    const { content, senderType } = req.body
    const file = (req as any).file

    const messageData: any = {
      chatRoomId,
      createdAt: Date.now(),
      content,
      senderType,
      sender: senderType === "Admin" ? (req as any).admin._id : (req as any).theaterOwner._id,
    }

    if (file) {
      messageData.fileUrl = `/MessageFiles/${file.filename}`
      messageData.fileName = file.originalname
    }

    const newMessage = await this.chatService.sendMessage(chatRoomId, messageData)

    io.to(chatRoomId).emit("message", newMessage)

    res.status(201).json(newMessage)
  })

  getUnreadMessages = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const theaterOwnerId = (req as any).theaterOwner._id
    const unreadMessages = await this.chatService.getUnreadMessages(theaterOwnerId)
    res.json(unreadMessages)
  })

  getAdminUnreadMessages = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const theaterOwnerId = (req as any).theaterOwner._id
    const unreadMessages = await this.chatService.getAdminUnreadMessages(theaterOwnerId)
    res.json(unreadMessages)
  })

  markMessagesAsRead = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { chatRoomId } = req.body
    await this.chatService.markMessagesAsRead(chatRoomId, "TheaterOwner")
    res.status(200).json({ message: "Messages marked as read" })
  })

  getAdminChatRooms = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const adminId = req.params.adminId
    const chatRooms = await this.chatService.getAdminChatRooms(adminId)

    console.log("ChatRooms: ", chatRooms);
    
    res.json(chatRooms)
  })

  getAdminMessages = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const chatRoomId = req.params.chatRoomId;
  
    console.log("ChatRoomId received in Controller for Admin:", chatRoomId);
  
    if (!mongoose.Types.ObjectId.isValid(chatRoomId)) {
      res.status(400).json({ error: "Invalid chatRoomId format" });
      return;
    }
  
    const messages = await this.chatService.getAdminMessages(chatRoomId);
    res.json(messages);
  });  
  

  sendAdminMessage = expressAsyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const chatRoomId = req.params.chatRoomId
    const { content, senderType, theaterOwnerId } = req.body
    const file = req.file

    const messageData: any = {
      chatRoomId,
      createdAt: Date.now(),
      content,
      senderType,
      sender: senderType === "Admin" ? req.admin?._id : theaterOwnerId,
      read: false,
    }

    if (file) {
      messageData.fileUrl = `/MessageFiles/${file.filename}`
      messageData.fileName = file.originalname
    }

    const newMessage = await this.chatService.sendAdminMessage(chatRoomId, messageData)

    io.to(chatRoomId).emit("message", newMessage)

    res.status(201).json(newMessage)
  })

  markAdminMessagesAsRead = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { chatRoomId } = req.body
    await this.chatService.markMessagesAsRead(chatRoomId, "Admin")
    res.status(200).json({ message: "Messages marked as read" })
  })
}

