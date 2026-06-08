import { format } from "morgan";

export interface ValidationResult{
    isValid:boolean;
    message?:string;
}

// valdate phone number format and length
export function validatePhoneNumber(phone:any):ValidationResult{
   
    const phoneStr=String(phone).trim();

    if(!phoneStr){
        return{isValid:false,message:'Phone number cannot be empty.'}
    }

    // Check if phone contains only numbers
    if(!/^\d+$/.test(phoneStr)){
        return {isValid:false,message:'Phone number must contain only digits.'};
    }

    // Check if phone number length is within reasonable range

    if(phoneStr.length<10){
        return {isValid:false,message:'Phone number is too short.'};
    }

    if(phoneStr.length>15){
        return {isValid:false,message:'Phone number is too long.'};

    }
    return {isValid:true};
}


// Validate email format

export function validateEmail(email:any): ValidationResult{
 
    const emailStr=String(email).trim().toLowerCase();

    if(!emailStr){
        return {isValid:false,message:'Email cannot be empty.'};
    }

    // Basic email format regex
    const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailRegex.test(emailStr)){
        return {isValid:false,message:'Please provide a valid email address.'};
    }

    // Check for reasonable email length
    if(emailStr.length>254){
        return {isValid:false,message:'Email address is too long.'};
    }

    return {isValid:true};
}

// Validate password strength

export function validatePassword(password:any):ValidationResult{
    if(!password){
        return {isValid:false,message:'Password is required.'};
    }
    const passwordStr=String(password);
    if(!passwordStr){
        return {isValid:false,message:'Password cannot be empty.'};
    }

    // Check minimum length
    if(passwordStr.length<3){
        return {isValid:false,message:'Password must be at least 3 characters long.'};
    }

    // Check for at least one uppercase letter
    if(!/[A-Z]/.test(passwordStr)){
        return {isValid:false,message:'Password must contain at least one uppercase letter.'};
    }

    // Check for at least one lowercase letter
    if(!/[a-z]/.test(passwordStr)){
        return {isValid:false,message:'Password must contain at least one lowercase letter.'};
    }

    // Check for at least one digit
    if(!/\d/.test(passwordStr)){
        return {isValid:false,message:'Password must contain at least one digit.'};
    }

    return {isValid:true};
}

// Validate full name

export function validateFullName(fullName:any):ValidationResult{
    if(!fullName){
        return {isValid:false,message:'Full name is required.'};
    }

    const fullNameStr=String(fullName).trim();

    if(!fullNameStr){
        return {isValid:false,message:'Full name cannot be empty.'};
    }

    // Check for minimum and maximum length
    if(fullNameStr.length<2){
        return {isValid:false,message:'Full name must be at least 2 characters long.'};
    }

    if(fullNameStr.length>100){
        return {isValid:false,message:'Full name is too long.'};
    }

    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    if(!/^[A-Za-z\s\-']+$/.test(fullNameStr)){
        return {isValid:false,message:'Full name contains invalid characters. Only letters, spaces, hyphens, and apostrophes are allowed.'};
    }

    return {isValid:true};
}

/**
 * Sanitize string input by trimming and handling null/undefined
 */

export function sanitizeString(value:any):string | null{
    if(!value){
        return null
    }
    const sanitized=String(value).trim();
    return sanitized||null
}

/**
 * Validate URL format (for profile pictures, etc.)
 */

export function validateUrl(url:any,fieldName:string='URL'):ValidationResult{
    if(!url){
        return {isValid:true}; // Optional field, so it's valid if not provided
    }

    const urlStr=String(url).trim();

    if(!urlStr){
        return {isValid:false,message:'URL cannot be empty.'};
    }

    try{
        new URL(urlStr);
        return {isValid:true};
    }catch(error){
        return {isValid:false,message:'Please provide a valid URL.'};
    }
}

/**
 * Comprehensive signup data validation
 */
export function validateSignupData(signupData:any):ValidationResult{
    const {fullName,email,phone,password,roleType}=signupData;

    // Validate full name
    let result=validateFullName(fullName);
    if(!result.isValid){
        return result;
    }

    // Validate email
    result=validateEmail(email);
    if(!result.isValid){
        return result;
    }

    // Validate phone number
    result=validatePhoneNumber(phone);
    if(!result.isValid){
        return result;
    }

    // Validate password
    result=validatePassword(password);
    if(!result.isValid){
        return result;
    }

    // Validate role type (basic check)
    // Normalize common variants coming from frontend (casing, hyphen/space aliases)
    const normalizedRoleType = typeof roleType === 'string'
        ? roleType.trim().toLowerCase().replace(/[-\s]/g, '_')
        : roleType;

    const allowedRoleTypes = [
        'admin',
        'super_admin',
        'help_desk',
        'check_point',
        'data_manager',
        'team_leader',
        'staff',
        'system_office',
        'human_resource',
        'protocals',
    ];

    if (!normalizedRoleType || !allowedRoleTypes.includes(normalizedRoleType)) {
        return { isValid: false, message: 'Please provide a valid role type.' };
    }

    return { isValid: true };



}