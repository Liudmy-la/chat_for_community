import * as fs from "fs";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import cloudinary from "cloudinary";
import { Request, Response, NextFunction } from "express";
import upload from "../helper/multerConfig";

import {connect} from "../db/dbConnect";
import { newUserSchema } from "../db/schema/users";
// import { chatSchema } from "../db/schema/chats";
import authenticateUser from "../middlewares/authMiddleware";
import handleErrors from "../utils/handleErrors";

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

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
        const { user_id, email, nickname, first_name, last_name, user_avatar } = users[0];
        return res.status(200).json({ user_id, email, nickname, first_name, last_name, user_avatar });
      }
    });
  } catch (error) {
    handleErrors(error, res, 'getUserProfile');
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
    handleErrors(error, res, 'deleteUser');
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
            .set({ user_avatar: imageUrl })
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
    handleErrors(error, res, 'setAvatar');
  }
};
