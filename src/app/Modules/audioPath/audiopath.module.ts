import { model, Schema } from "mongoose";
import { TPathName } from "./audioPath.interface";


const pathNameSchema = new Schema<TPathName>({
    pathName : {
        type : String
    },
    status : {
        type : String
    },
    categoryStatus : {
        type : String
    }
})


export const pathName = model<TPathName>('pathName', pathNameSchema);