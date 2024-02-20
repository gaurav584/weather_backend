import { Request, Response, NextFunction } from "express";
import { User } from "../models/user";
import { NewUserRequestBody } from "../types/types";
import ErrorHandler from "../utils/utility-class";
import { TryCatch } from "../middlewares/error";
import { sendEmail, sendToken, userDetails } from "../utils/features";
import crypto from "crypto";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

export const newUser = TryCatch(
  async (
    req: Request<{}, {}, NewUserRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, photo, gender, role, _id, dob } = req.body;

    let user = await User.findById(_id);

    if (user) {
      return res.status(200).json({
        success: true,
        message: `welcome,${user.name}`,
      });
    }

    if (!_id || !name || !email || !photo || !gender || !dob) {
      return next(new ErrorHandler("Please add all feild", 400));
    }
    user = await User.create({
      name,
      email,
      photo,
      gender,
      _id,
      dob: new Date(dob),
    });

    return res.status(201).json({
      success: true,
      message: `Welcome,${user.name},`,
    });
  }
);

// Additional Feature Login from Backend using
type LoginBody = {
  email: string;
  password: string;
};

export const Login = TryCatch(
  async (
    req: Request<{}, {}, LoginBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { email, password }: LoginBody = req.body;

    if (!email || !password) {
      return next(new ErrorHandler("Please enter email and password", 401));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }

    const userDetails: userDetails = {
      _id: user._id,
      email: user.email,
      getJWTToken: user.getJWTToekn, // Corrected typo here
    };

    sendToken(userDetails, 200, res);
  }
);

// Logout-from backend Jwt.

export const logout = TryCatch(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// forgat-password
export const forgetPassword = TryCatch(async (req, res, next) => {
  // receive email and find user
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler("User not found", 400));
  }

  // generate-token for reseting the password(limited-time until next login)
  const resetToken = user.getResetPasswordToken();

  // save token in database
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${resetToken}`;

  const message = `your password reset token is: -\n\n ${resetPasswordUrl} \n\n you have not required this email then please login it`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} succesfully`,
    });
  } catch (error: any) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

// Reset-Password
export const resetPassword = TryCatch(async (req, res, next) => {
  //creating hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

    const user = await User.findOne(
      {
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()},
      });

    if(!user){
      return next(new ErrorHandler("Reset Password Token is invalid or has been expired",400));
    }

    if(req.body.password !== req.body.confirmPassword){
      return next(new ErrorHandler("Reset Password token is invalid and has been expired",400));
    }

    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success:true,
      message:"Password changes succesfully",
      user
    })
});

// update User role(admin)


// get-all users
export const getAllUsers = TryCatch(async (req, res, next) => {
  const users = await User.find({});

  return res.status(200).json({
    success: true,
    users,
  });
});


// get-user by id 
export const getUser = TryCatch(async (req, res, next) => {
  const id = req.params.id;

  const user = await User.findById(id);

  if (!user) return next(new ErrorHandler("Invalid Id", 400));

  return res.status(201).json({
    success: true,
    user,
  });
});

// update-user
type updatedBody = {
  name?:string,
  email?:string,
  password?:string,
  photo?:string
}

export const updatedUser = TryCatch(async(req:Request,res:Response,next:NextFunction) => {
  try{
    const userId = req.params.id;
    const updateObject:updatedBody = req.body;

    if(!Object.keys(updateObject).length){
      return next(new ErrorHandler("At least one Feild must be provided for update",400));
     }

    if(!mongoose.Types.ObjectId.isValid(userId)){
      return next(new ErrorHandler("Invalid usre Id",400));
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateObject,
      {new:true,runValidators:true,useFindAndModify:false}
    );

    if(!user){
      return next(new ErrorHandler("User not found",404));
    }

    if(updateObject.password){
      user.password = await bcrypt.hash(updateObject.password,10);
      await user.save();
    }

    res.status(200).json({
      success:true,
      message:"User details updated succesfully",
      user
    });

   }catch(error:any){
    return next(new ErrorHandler(error.message,500));
   }
});



export const deleteUser = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);

  if (!user) {
    return next(new ErrorHandler("Invalid Id", 400));
  }

  await user.deleteOne();

  return res.status(200).json({
    success: true,
    message: "User Deleted Succesfully",
  });
});
