import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
  firstName: string;
  lastName?: string;
  emailId: string;
  age?: number;
  gender?: string;
  password: string;
  skills?: string[];
  bio?: string;
  createdAt: Date;
  photoURL?: string;
  matchPassword(enteredPassword: string): Promise<boolean>;
  generateAuthToken(): string;
}

const UserSchema: Schema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please add a first name"],
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    emailId: {
      type: String,
      required: [true, "Please add an email"],
      lowercase: true,
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    age: {
      type: Number,
      min: [18, "Age must be at least 18 years"],
      max: [150, "Please enter a valid age"],
    },
    gender: {
      type: String,
      lowercase: true,
      validate(value: string) {
        if (
          !["Male", "Female", "Others", "Prefer not to say"].includes(value)
        ) {
          throw new Error("Gender not valid");
        }
      },
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
      select: false,
    },
    skills: {
      type: [String],
    },
    bio: {
      type: String,
      default: "Default Bio",
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    photoURL: {
      type: String,
      default: "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
    },
  },
  { timestamps: true }
);

UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.generateAuthToken = function (): string {
  const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_here";
  return jwt.sign({ id: this._id }, JWT_SECRET, {
    expiresIn: "30d",
  });
};

export default mongoose.model<IUser>("User", UserSchema);
