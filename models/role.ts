import { Model,DataTypes,Optional } from "sequelize";
import sequelize from "../config/database";


interface IRoleAttributes {
    id: string;
    name: string;
    description?: string|null;
    category?: string|null;
    createdAt?: Date;
    updatedAt?: Date;
}

interface IRoleCreationAttributes extends Optional<IRoleAttributes, 'id'|'description'> {}

class Role extends Model<IRoleAttributes, IRoleCreationAttributes> implements IRoleAttributes {
    // define declaration of attrinbutes to prevent typescript errors

    declare id: string;
    declare name: string;
    declare description?: string|null;
    declare category?: string|null;
    declare readonly createdAt?: Date;
    declare readonly updatedAt?: Date;

    //define statics assoiciations if needed
    declare static associations:{
        permissions: any;
    };

}

Role.init({
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
    category:{
        type: DataTypes.STRING(50),
        allowNull:true,
        validate:{
            len:[0,50]
        }
    }
},{
    tableName:'roles',
    sequelize,
    timestamps:true,
    paranoid:false,
    modelName:'Role',
    indexes:[
        {
            unique:true,
            fields:['name']
        }
    ]
});

export default Role;