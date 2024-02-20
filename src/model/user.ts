import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

interface Iuser extends Document {
  _id: string;
  name: string;
  password:string,
  email: string;
  photo: string;
  role: "admin" | "user";
  gender: "male" | "female";
  dob: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (enterPassword: string) => Promise<boolean>;
  getJWTToekn: () => string;
  resetPasswordToken?: string;
  resetPasswordExpire?: string;
  getResetPasswordToken:()=> string
}

const schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: [true, "Please enter ID"],
    },
    name: {
      type: String,
      required: [true, "Please enter Name"],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [8, "password should be greater than 8"],
      select: false,
    },
    email: {
      type: String,
      unique: [true, "Email already Exist"],
      required: [true, "Please enter email"],
      validate: validator.default.isEmail,
    },
    photo: {
      type: String,
      required: [true, "Please add Photo"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Please enter Gender"],
    },
    dob: {
      type: Date,
      required: [true, "Please enter Date of Birth"],
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

schema.virtual("age").get(function () {
  const today = new Date();
  const dob = this.dob;
  let age = today.getFullYear() - this.dob.getFullYear();

  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  )
    age--;

  return age;
});

// generate-jwt-Token

schema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, "hxjshdshdsshdu", {
    expiresIn: 5,
  });
};

// hash-password

schema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// compare-password while Login

schema.methods.comparePassword = async function (
  enterPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enterPassword, this.password);
};

// generating resetPassword Token(until next Login)
schema.methods.getResetPasswordToken = function ():string {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  return resetToken;
};

export const User = mongoose.model<Iuser>("User", schema);
