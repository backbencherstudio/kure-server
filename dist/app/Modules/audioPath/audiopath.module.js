"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathName = void 0;
const mongoose_1 = require("mongoose");
const pathNameSchema = new mongoose_1.Schema({
    path: {
        type: String
    },
    audio: {
        type: String
    },
    category: {
        type: String
    },
    name: {
        type: String
    },
    categoryStatus: {
        type: String
    }
});
exports.pathName = (0, mongoose_1.model)('pathName', pathNameSchema);
