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
    validateZipCode
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
    zip:validateZipCode
}

export function validateInputs(inputs) {
    const errors = {};

    inputs.forEach(([value, type,field]) => {
        if (validators[type]) {
            const result = validators[type](value);
            if (result.error) {
                errors[field] = result.error;
            }
        }
    });

    return errors;
}