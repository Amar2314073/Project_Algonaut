
const validator = require("validator");

const validateUser = (data)=>{

    const mandatoryField = ['firstName','emailId','password'];
    
    // checking required field is present or not
    const IsAllowed = mandatoryField.every((k)=>Object.keys(data).includes(k));
    if(!IsAllowed)
        throw new Error("Some Field is Missing");

    // Email verification
    if(!validator.isEmail(data.emailId))
        throw new Error('Invalid Email!');

    // Password verification
    if(!validator.isStrongPassword(data.password))
        throw new Error('Week Password!');
}

module.exports = validateUser;