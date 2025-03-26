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
      minlength: [2, "First name must be at least 2 characters long"],
      maxlength: [30, "First name cannot exceed 30 characters"],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [30, "Last name cannot exceed 30 characters"],
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
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "Password must be at least 6 characters long"],
      maxlength: [30, "Password cannot exceed 30 characters"],
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
      default: "https://www.inzone.ae/wp-content/uploads/2025/02/dummy-profile-pic.jpg",
      validate(value: string) {
        if (!value.startsWith("http://") && !value.startsWith("https://")) {
          throw new Error("Photo URL must be a valid HTTP/HTTPS URL");
        }
      },
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

UserSchema.pre("save", function (next) {
  if (this.isModified("emailId") && !this.isNew) {
    next(new Error("Email cannot be changed after registration"));
  }
  next();
});

export default mongoose.model<IUser>("User", UserSchema);
