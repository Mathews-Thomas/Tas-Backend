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
    ValidateRoll
} from "./inputvalidation.js"

const validators = {
    name: validateName,
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
