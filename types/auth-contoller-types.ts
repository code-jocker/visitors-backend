export interface LoginRequest{
    email?:string;
    password:string;
    phone?:string;
    type?:'phone'|'email';
}

export interface SignupRequest{
    fullName:string;
    email?:string;
    roleType?:string;
    password:string;
    phone:string;
}

export interface ForgotPasswordRequest{
    email?:string;
}

export interface ResetPasswordRequest{
    token:string;
    newPassword:string
}

export interface GoogleUser{
    id:string;
    email:string;
    name:string;
    picture:string;
    email_verified:boolean
}

