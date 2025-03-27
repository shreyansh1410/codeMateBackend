import mongoose, { Schema, Document } from "mongoose";

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
}

const UserSchema: Schema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please add a first name"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters long"],
      maxlength: [30, "First name cannot exceed 30 characters"],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [30, "Last name cannot exceed 30 characters"],
      required: false,
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
      immutable: true,
    },
    age: {
      type: Number,
      min: [18, "Age must be at least 18 years"],
      max: [150, "Please enter a valid age"],
      required: false,
    },
    gender: {
      type: String,
      lowercase: true,
      validate(value: string) {
        if (
          !["male", "female", "others", "prefer not to say"].includes(value)
        ) {
          throw new Error(
            "Gender must be one of: male, female, others, prefer not to say"
          );
        }
      },
      required: false,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "Password must be at least 6 characters long"],
      maxlength: [300, "Password cannot exceed 300 characters"],
      select: false,
    },
    skills: {
      type: [String],
      validate(value: string[]) {
        if (value.length > 10) throw new Error("Maximum 10 skills allowed");
        if (value.some((skill) => skill.length > 30)) {
          throw new Error("Each skill cannot exceed 30 characters");
        }
      },
      required: false,
    },
    bio: {
      type: String,
      default: "Default Bio",
      maxlength: [200, "Bio cannot exceed 200 characters"],
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    photoURL: {
      type: String,
      default:
        "https://www.inzone.ae/wp-content/uploads/2025/02/dummy-profile-pic.jpg",
      validate(value: string) {
        if (!value.startsWith("http://") && !value.startsWith("https://")) {
          throw new Error("Photo URL must be a valid HTTP/HTTPS URL");
        }
      },
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
