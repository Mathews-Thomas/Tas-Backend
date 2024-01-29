import Branch from "../models/BranchSchema.js";
import Role from "../models/RoleSchema.js"
import mongoose from 'mongoose';


export const validateName = (name) => {
    if(typeof name !== 'string'){
        return {
            error: "must be a string"
        }
    }
    if(name.trim().length === 0){
        return {
            error: "must not be empty"
        }
    }
    if(name.length > 20){
        return {
            error: "must have less than 20 letters"
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


export const verifyObjID = (ObjectId)=>{
    if(!ObjectId) return {error:"ObjectID id missing"}
    if(!mongoose.Types.ObjectId.isValid(ObjectId)) return {error:"Invalid ObjectID"}
    return {};
}
 

export const ValidateBranchID = async (BranchID) => {
    if (!BranchID) {
        return { error: "Branch ID is missing" };
    }

    if (!mongoose.Types.ObjectId.isValid(BranchID)) {
        return { error: "Invalid Branch ID" };
    }

    // Check if the role exists in the database
    const branchExists = await Branch.exists({ _id: BranchID });
    if (!branchExists) {
        return { error: "Branch does not exist" };
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
    if(value.length > 500){
        return {
            error: "must have less than 500 characters"
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

export const validateGender = (gender) => {
    if (typeof gender !== 'string') {
        return {
            error: "Gender must be a string."
        };
    }

    const validGenders = ["male", "female", "non-binary", "other"];
    
    if (!validGenders.includes(gender.toLowerCase())) {
        return {
            error: "Invalid gender. Please provide a valid gender."
        };
    }

    return {};
};


export const validateAge = (age) => {
    if(typeof age !== 'number'){
        return {
            error: "must be a number"
        }
    }
    if(age < 0){
        return {
            error: "must be a positive number"
        }
    }
    if(age > 110){
        return {
            error: "must be less than 110"
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