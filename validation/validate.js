import { 
    validateName, 
    validateEmail, 
    validateMobile, 
    validatePassword, 
    validateAddress, 
    validatePrice, 
    validateProductName, 
    validateProductCategory,
    validatePosition,
    loginId,
    validateZipCode,
    ValidateRoll,
    verifyObjID,
    validateAge,
    validateGender,
    ValidateBranchID,
    validateGST,
    validate_date_time,
    validateVisitorType
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
    position:validatePosition,
    loginId:loginId,
    zip:validateZipCode,
    role:ValidateRoll,
    objectID:verifyObjID,
    BranchID:ValidateBranchID,
    GST:validateGST,
    date:validate_date_time,
    visit:validateVisitorType
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
