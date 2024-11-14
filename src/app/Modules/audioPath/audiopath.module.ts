import { model, Schema } from "mongoose";
import { TPathName } from "./audioPath.interface";


const pathNameSchema = new Schema<TPathName>({
    audio : {
        type : String
    },
    category : {
        type : String
    },
    name : {
        type : String
    },
    categoryStatus : {
        type : String
    }
})


export const pathName = model<TPathName>('pathName', pathNameSchema);