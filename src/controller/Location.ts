import { Request, Response, NextFunction } from "express";
import { TryCatch } from "../middleware/error";
import { CreateRequestBody, UpdateRequestBody } from "../types/types";
import ErrorHandler from "../middleware/exceptions";
import { Location } from "../model/Location";

// create
export const createLocation = TryCatch(
  async (
    req: Request<{}, {}, CreateRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name } = req.body;

    if (!name) {
      next(new ErrorHandler("locationName is required feild", 400));
    }

    const location = await Location.create({ name });

    res.status(201).json({
      success: true,
      message: `${location} is crated succesfuly`,
    });
  }
);

// get-locations
export const getLocation = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {

    const location = await Location.find();

    if (!location) {
      return next(new ErrorHandler("Please enter a valid location", 400));
    }

    res.status(201).json({
      success: true,
      location,
    });
  }
);

// update-locations
export const updateLocation = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const { name } = req.body;

  const location = await Location.findById(id);

  if (!location) {
    return next(new ErrorHandler("Location not found", 400));
  }

  if (name) {
    location.name = name;
  }

  await location.save();

  const locations = location.name;

  res.status(201).json({
    success: true,
    message: `${locations} is updated succesfully`,
  });
});

// delete-location
export const deleteLocation = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
  
      if (!id) {
        next(new ErrorHandler("locationName is required feild", 400));
      }
  
      const location = await Location.findByIdAndDelete(id);

      res.status(201).json({
        success: true,
        message:`${location} is deleted succesfully`
      });
    }
  );
