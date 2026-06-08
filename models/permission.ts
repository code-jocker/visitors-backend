import { Model,DataTypes,Optional } from "sequelize";
import sequelize from "../config/database";

interface IPermissionAttributes {
  id: string;
  name: string;
  description?: string|null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IPermissionCreationAttributes extends Optional<IPermissionAttributes, 'id'|'description'> {}

class Permission extends Model<IPermissionAttributes, IPermissionCreationAttributes> implements IPermissionAttributes {
    // define declaration of attrinbutes to prevent typescript errors

    declare id: string;
    declare name: string;
    declare description?: string|null;
    declare readonly createdAt?: Date;
    declare readonly updatedAt?: Date;

    //define statics assoiciations if needed
    declare static associations:{
        roles: any;
    };

}

Permission.init({
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull:true,
    },
    name:{
        type: DataTypes.STRING(50),
        allowNull:false,
        validate:{
            notEmpty:true,
            len:[2,50],
        }
    },
    description:{
        type: DataTypes.STRING(255),
        allowNull:true,
        validate:{
            len:[0,255]
        }
    },
    },{
        tableName:'permissions',
        sequelize,
        timestamps:true,
        paranoid:false,
        modelName:'Permission',
        indexes:[
            {
                unique:true,
                fields:['name']
            }
        ]
    }
);
// Define hook that can be run to avoid error of spaces in the name field
Permission.beforeCreate(async(permission:Permission) => {
    permission.name = String(permission.name).toLowerCase().replace(/\s+/g, '_');
});

export default Permission;