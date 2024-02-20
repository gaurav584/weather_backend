import mongoose,{Document} from "mongoose";

interface ILocation extends Document{
    name:String
}

const schema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter location name"],
    }
})

export const Location = mongoose.model<ILocation>('Location',schema);