// import { eq } from "drizzle-orm";
// import { Request, Response } from "express";
// import {connect} from "../db/dbConnect";
// import { privateChatSchema, TNewPrivateChat } from "../db/schema/privateChat";
// import { newUserSchema } from "../db/schema/users";
// import authenticateUser from "../middlewares/authMiddleware";

// export const createPrivateChat = async (req: Request, res: Response) => {
//   try {
//     authenticateUser(req, res, async () => {
//       const { id } = req.body;
//       const userEmail = req.userEmail;

//       if (userEmail === undefined) {
//         return res.status(401).json({ error: "Invalid or missing user email" });
//       }

//       const db = await connect();

//       const userFriend = await db
//         .select()
//         .from(newUserSchema)
//         .where(eq(newUserSchema.user_id, id))
//         .execute();

//       if (userFriend.length === 0) {
//         return res.status(400).json({ error: "User not found" });
//       }

//       const user = (
//         await db.select().from(newUserSchema).where(eq(newUserSchema.email, userEmail)).execute()
//       )[0];

//     //   const newChat: TNewPrivateChat = {
//     //     userIdOne: user.id,
//     //     userIdSecond: id,		
// 	// 	// isPrivate: true,
//     //   };

//     //   await db.insert(privateChatSchema).values(newChat).execute();

// 	//	const { id: newChatId } = await db
// 	//	.insert(chatSchema)
// 	//	.values(newChat)
// 	//	.returning(chatSchema.id)
// 	//	.execute()
// 	//	.then(result => result[0]);

//       return res.status(201).json("Private Chat successfully created");
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).send("Internal Server Error");
//   }
// };
