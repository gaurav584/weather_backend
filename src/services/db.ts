import mongoose from "mongoose";

export const connectDb = (uri:string) => {
    mongoose.connect(uri,{
        dbName:`Weather_app`
    }).then((c)=>{
        console.log(`connected to ${c.connection.host}`);
    }).catch((e)=>{
        console.log(e);
    })
}