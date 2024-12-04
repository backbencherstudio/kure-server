"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handelDuplicateError = (err) => {
    let duplicateKey = '';
    let duplicateValue = '';
    const match = err.message.match(/index: (\w+) dup key: { (.+): "(.+)" }/);
    if (match) {
        duplicateKey = match[2]; // Extracted key name
        duplicateValue = match[3]; // Extracted duplicate value
    }
    const errorSources = [
        {
            path: duplicateKey,
            message: ` "${duplicateValue}" is already exists`,
        },
    ];
    const statusCode = 400;
    return {
        statusCode,
        message: 'this department is already exists',
        errorSources,
    };
};
exports.default = handelDuplicateError;
