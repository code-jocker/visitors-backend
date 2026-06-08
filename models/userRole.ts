import { Model,DataTypes,Optional } from "sequelize";
import sequelize from "../config/database";


export interface IUserRoleAttributes {
    id: string;
    userId: string;
    roleId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUserRoleCreationAttributes extends Optional<IUserRoleAttributes, 'id'|'createdAt'|'updatedAt'> {}

class UserRole extends Model<IUserRoleAttributes, IUserRoleCreationAttributes> implements IUserRoleAttributes {
    declare id: string;
    declare userId: string;
    declare roleId: string;
    declare readonly createdAt?: Date;
    declare readonly updatedAt?: Date;

}

UserRole.init({
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull:true,
    },
    userId:{
        type: DataTypes.UUID,
        allowNull:false,
        validate:{
            notEmpty:true,
        },
        references:{
            model:'users',
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
        tableName:'user_roles',
        sequelize,
        timestamps:true,
        paranoid:false,
        modelName:'UserRole',
        indexes:[
            {
                unique:true,
                fields:['userId','roleId']
            }
        ]
    });

export default UserRole;