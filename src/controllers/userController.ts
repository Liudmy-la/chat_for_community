import * as fs from "fs";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import cloudinary from "cloudinary";
import { Request, Response, NextFunction } from "express";
import connect from "../db/dbConnect";
import upload from "../helper/multerConfig";
import { newUserSchema } from "../db/schema/users";
import { chatSchema } from "../db/schema/chats";
import { privateChatSchema } from "../db/schema/privateChat";
import authenticateUser from "../middlewares/authMiddleware";

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const handleErrors = (error: any, res: Response) => {
  console.error("Error:", error);
  res.status(500).send("Internal Server Error");
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    await authenticateUser(req, res, async () => {
      const db = await connect();

      try {
        const [users] = await Promise.all([db.select().from(newUserSchema).execute()]);

        const formattedUsers = users.map((user) => {
          const { user_id, email, nickname, first_name, last_name, avatar } = user;
          return { user_id, email, nickname, first_name, last_name, avatar };
        });

        res.status(200).json({ users: formattedUsers });
      } catch (error) {
        handleErrors(error, res);
      }
    });
  } catch (error) {
    handleErrors(error, res);
  }
};

export const getAllGroups = async (req: Request, res: Response) => {
  try {
    await authenticateUser(req, res, async () => {
      const db = await connect();

      try {
        const [chats] = await Promise.all([db.select().from(chatSchema).execute()]);

        res.status(200).json({ chats });
      } catch (error) {
        handleErrors(error, res);
      }
    });
  } catch (error) {
    handleErrors(error, res);
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    authenticateUser(req, res, async () => {
      const userEmail = req.userEmail;

      if (userEmail === undefined) {
        return res.status(401).json({ error: "Invalid or missing user email" });
      }

      const db = await connect();
      const users = await db
        .select()
        .from(newUserSchema)
        .where(eq(newUserSchema.email, userEmail))
        .execute();

      if (users.length === 0) {
        return res.status(400).json({ error: "User not found" });
      } else {
        const { user_id, email, nickname, first_name, last_name, avatar } = users[0];
        return res.status(200).json({ user_id, email, nickname, first_name, last_name, avatar });
      }
    });
  } catch (error) {
    handleErrors(error, res);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    authenticateUser(req, res, async () => {
      const userEmail = req.userEmail;

      if (userEmail === undefined) {
        return res.status(401).json({ error: "Invalid or missing user email" });
      }

      const db = await connect();

      const users = await db
        .select()
        .from(newUserSchema)
        .where(eq(newUserSchema.email, userEmail))
        .execute();

      if (users.length === 0) {
        return res.status(400).json({ error: "User not found" });
      }

      const storedPassword = users[0].password;

      const passwordMatch = await bcrypt.compare(password, storedPassword);

      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid password" });
      }

      await db.delete(newUserSchema).where(eq(newUserSchema.email, userEmail)).execute();

      return res.status(200).json({ message: "User deleted successfully" });
    });
  } catch (error) {
    handleErrors(error, res);
  }
};

export const setAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    authenticateUser(req, res, async () => {
      const userEmail = req.userEmail;

      if (userEmail === undefined) {
        return res.status(401).json({ error: "Invalid or missing user email" });
      }

      const db = await connect();

      const users = await db
        .select()
        .from(newUserSchema)
        .where(eq(newUserSchema.email, userEmail))
        .execute();

      if (users.length === 0) {
        return res.status(400).json({ error: "User not found" });
      }

      const uploadMiddleware = upload.single("avatar");
      uploadMiddleware(req, res, async function (err) {
        if (err) {
          console.error("Multer Error:", err);
          return res.status(400).json({ error: err.message });
        }

        const file: any = req.file;
        if (!file) {
          return res.status(400).send("No file uploaded.");
        }

        const allowedExtensions = [".jpg", ".jpeg", ".png"];
        const fileExtension = "." + (file.originalname.split(".").pop() || "");

        if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
          return res
            .status(400)
            .send("Invalid file type. Only JPEG, JPG and PNG images are allowed.");
        }

        if (file.size > 5 * 1024 * 1024) {
          return res.status(400).send("File size exceeds the limit.");
        }

        try {
          const result = await cloudinary.v2.uploader.upload(file.path);
          fs.unlinkSync(file.path);

          const imageUrl: string = result.secure_url;

          const updatedUser = await db
            .update(newUserSchema)
            .set({ avatar: imageUrl })
            .where(eq(newUserSchema.email, userEmail));

          return updatedUser;
        } catch (error) {
          console.error("Cloudinary Error:", error);
          return res.status(500).send("Error uploading image to Cloudinary.");
        }
      });

      const upratedUser = await db
        .select()
        .from(newUserSchema)
        .where(eq(newUserSchema.email, userEmail))
        .execute();

      return res.status(200).send("Avatar changed successfully");
    });
  } catch (error) {
    handleErrors(error, res);
  }
};

export const getUserAllCroupChats = async (req: Request, res: Response) => {
  try {
    authenticateUser(req, res, async () => {
      const userEmail = req.userEmail;

      if (userEmail === undefined) {
        return res.status(401).json({ error: "Invalid or missing user email" });
      }

      const db = await connect();
      const users = await db
        .select()
        .from(newUserSchema)
        .where(eq(newUserSchema.email, userEmail))
        .execute();

      if (users.length === 0) {
        return res.status(400).json({ error: "User not found" });
      } else {
        const allChats = await db.select().from(chatSchema).execute();

        if (allChats.length === 0) {
          return res.status(204).json({ error: "You have no chats" });
        } else {
          const userChats: any = [];
          return res.status(200).json({ chats: userChats });
        }
      }
    });
  } catch (error) {
    handleErrors(error, res);
  }
};

export const getUserAllPrivateChats = async (req: Request, res: Response) => {
  try {
    authenticateUser(req, res, async () => {
      const userEmail = req.userEmail;

      if (userEmail === undefined) {
        return res.status(401).json({ error: "Invalid or missing user email" });
      }

      const db = await connect();
      const users = await db
        .select()
        .from(newUserSchema)
        .where(eq(newUserSchema.email, userEmail))
        .execute();

      if (users.length === 0) {
        return res.status(400).json({ error: "User not found" });
    	} 

	return res.status(200).json("Code is not correct" );
	// else {
    //     const userChatsOne = await db
    //       .select()
    //       .from(privateChatSchema)
    //       .where(eq(privateChatSchema.userIdOne, users[0].id))
    //       .execute();

    //     const userChatsSecond = await db
    //       .select()
    //       .from(privateChatSchema)
    //       .where(eq(privateChatSchema.userIdSecond, users[0].id))
    //       .execute();

    //     const userPrivateChats = [...userChatsOne, ...userChatsSecond];

    //     if (userPrivateChats.length === 0) {
    //       return res.status(204).json({ error: "You have no private chats" });
    //     } else {
    //       return res.status(200).json({ userPrivateChats });
    //     }
    //   }
    });
  } catch (error) {
    handleErrors(error, res);
  }
};
