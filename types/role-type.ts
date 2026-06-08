import { Optional } from "sequelize";
import { IPermissionAttributes } from "./permission-types";

export interface IRoleAttributes{
    id:string;
    name:string;
    description?: string|null;
    permissions?: IPermissionAttributes[];
    createdAt:Date;
    updatedAt:Date;
}

export interface IRoleCreationAttributes extends Optional<IRoleAttributes, 'id'|'description'|'permissions'|'createdAt'|'updatedAt'> {}