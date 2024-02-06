import { 
    validateName, 
    validateEmail, 
    validateMobile, 
    validatePassword, 
    validateAddress, 
    validatePrice, 
    validateProductName, 
    validateProductCategory,
    validatePosision,
    loginId,
    validateZipCode,
    ValidateRoll,
    verifyObjID,
    validateAge,
    validateGender,
    ValidateBranchID,
    validateGST
} from "./inputvalidation.js"

const validators = {
    name: validateName,
    age:validateAge,
    gender:validateGender,
    email: validateEmail,
    phone: validateMobile,
    password: validatePassword,
    address: validateAddress,
    price: validatePrice,
    productName: validateProductName,
    productCategory: validateProductCategory,
    posision:validatePosision,
    loginId:loginId,
    zip:validateZipCode,
    role:ValidateRoll,
    objectID:verifyObjID,
    BranchID:ValidateBranchID,
    GST:validateGST
}

export async function validateInputs(inputs) {
    const errors = {};

    for (const [value, type, field] of inputs) {
        if (validators[type]) {
            const result = await validators[type](value); // Await the result
            if (result.error) {
                errors[field] = result.error;
            }
        }
    }

    return errors;
}
