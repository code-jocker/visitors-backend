import { IUserAttributes } from "./user-type";

export interface IUserCreateRequest{
    fullName:string;
    email:string;
    password:string;
    phone:string;
    role?:IUserAttributes['roles'];
    status?:IUserAttributes['status'];
}

export interface IUserUpdateRequest extends Partial<IUserCreateRequest>{}

export interface IUserResponse extends Omit<IUserAttributes,'password'|'googleId'>{
    roles?: any[];
}
