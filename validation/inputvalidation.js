import Role from "../models/RoleSchema.js"
import mongoose from 'mongoose';


export const validateName = (name) => {
    if(typeof name !== 'string'){
        return {
            error: "must be string"
        }
    }
    if(name.length > 16){
        return {
            error: "must have less than 16 letters"
        }
    }
    return {}
}


export const ValidateRoll = async (rollId) => {
    if (!rollId) {
        return { error: "Please choose a Role" };
    }

    if (!mongoose.Types.ObjectId.isValid(rollId)) {
        return { error: "Invalid Role ID" };
    }

    // Check if the role exists in the database
    const roleExists = await Role.exists({ _id: rollId });
    if (!roleExists) {
        return { error: "Role does not exist" };
    }

    return {};
};


export const validateZipCode = (zipCode) => {
    if (typeof zipCode !== 'string') {
        return {
            error: "Zip code must be a string"
        };
    }
    if (zipCode.length < 6) {
        return {
            error: "Zip code must have at least 6 digits"
        };
    }
    if (!/^\d+$/.test(zipCode)) {
        return {
            error: "Zip code must contain only numbers"
        };
    }
    return {};
};


export const validatePosision = (position) => {
    if(typeof position !== 'string'){
        return {
            error: "must be string"
        }
    }
    if(position.length > 16){
        return {
            error: "must have less than 16 letters"
        }
    }
    return {}
}

export const validateEmail = (email) => {
    const test = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if(!!email && email.toLowerCase().match(test)){
        return {};
    }
    return {
        error: "is not valid"
    };
}


export const validateMobile = (mobile) => {
    if(typeof mobile !== 'string'){
        return {
            error: "must be a string"
        }
    }
    if(mobile.length !== 10){
        return {
            error: "must have 10 digits"
        }
    }
    if(parseInt(mobile) === NaN){
        return {
            error: "is not valid"
        }
    }
    return {}
}


export const validatePassword = (password) => {
    if(typeof password !== 'string'){
        return {
            error: "must be a string"
        }
    }
    if(password.length < 6){
        return {
            error: "must have atleast 6 characters"
        }
    }
    if (/\s/.test(password)) { // Check for spaces
        return {
            error: "must not contain spaces"
        };
    }
    return {};
}
export const loginId = (loginId) => {
    if (typeof loginId !== 'string') {
        return {
            error: "must be a string"
        };
    }
    if (loginId.length < 6) {
        return {
            error: "must have at least 6 characters"
        };
    }
    if (/\s/.test(loginId)) { // Check for spaces
        return {
            error: "must not contain spaces"
        };
    }
    return {};
}


export const validateAddress = (value) => {
    if(typeof value !== 'string'){
        return {
            error: "must be a string"
        }
    }
    if(value.length > 200){
        return {
            error: "must have less than 200 characters"
        }
    }
    return {}
}


export const validatePrice = (price) => {
    if(typeof price !== 'number'){
        return {
            error: "must be a number"
        }
    }
    if(price < 0){
        return {
            error: "must be a positive number"
        }
    }
    if(price > 999999999){
        return {
            error: "must be less than 1000000000"
        }
    }
    return {}
}



export const validateProductName = (name) => {
    if(typeof name !== 'string'){
        return {
            error: "must be a string"
        }
    }
    if(name.length === 0){
        return {
            error: "is required"
        }
    }
    if(name.length > 20){
        return {
            error: "must have less than 20 characters"
        }
    }
    return {}
}



export const validateProductCategory = (category) => {
    
    if(typeof category !== 'string'){
        return {
            error: "must be a string"
        }
    }

   
    return {}
}