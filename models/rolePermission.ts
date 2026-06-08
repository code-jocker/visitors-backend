import { Model,DataTypes,Optional } from "sequelize";
import sequelize from "../config/database";

interface IRolePermissionAttributes {
    id: string;
    permissionId: string;
    roleId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface IRolePermissionCreationAttributes extends Optional<IRolePermissionAttributes, 'id'|'createdAt'|'updatedAt'> {}

class RolePermission extends Model<IRolePermissionAttributes, IRolePermissionCreationAttributes> implements IRolePermissionAttributes {
    declare id: string;
    declare permissionId: string;
    declare roleId: string;
    declare readonly createdAt?: Date;
    declare readonly updatedAt?: Date;

}

RolePermission.init({
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull:true,
    },
    permissionId:{
        type: DataTypes.UUID,
        allowNull:false,
        validate:{
            notEmpty:true,
        },
        references:{
            model:'permissions',
            key:'id',
        },
        onDelete:'CASCADE',
        onUpdate:'CASCADE',
    },
    roleId:{
        type: DataTypes.UUID,
        allowNull:false,
        validate:{
            notEmpty:true,
        },
        references:{
            model:'roles',
            key:'id',
        },
        onDelete:'CASCADE',
        onUpdate:'CASCADE',
    },
    },{
        tableName:'role_permissions',
        sequelize,
        timestamps:true,
        paranoid:false,
        modelName:'RolePermission',
        indexes:[
            {
                unique:true,
                fields:['permissionId','roleId']
            }
        ]
    });

export default RolePermission;