import { Model,DataTypes,Optional } from "sequelize";
import sequelize from "../config/database";

interface EquipmentAttributes {
    id: string;
    name: string;
    description?: string|null;
    serialNumber?: string | null;
    quantity?: number;
    assignedTo?:string| null;
    status?:string;
    createdAt?: Date;
    updatedAt?: Date;
}



class Equipments extends Model<EquipmentAttributes,Optional<EquipmentAttributes,'id'|'createdAt'|'updatedAt'>> implements EquipmentAttributes{
    public id!:string;
    public name!:string;
    public description!:string;
    public serialNumber!:string | null;
    public quantity!:number;
    public assignedTo!: string | null;
    public status!:string;
    public readonly createdAt!:Date;
    public readonly updatedAt!:Date;
      declare static associations:{
        users:any;
    };
}

Equipments.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty:true,
            len:[3,255]
        }
    },
    description:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    serialNumber:{
        type:DataTypes.STRING,
        allowNull:true,
        unique:true
    },
    quantity:{
        type:DataTypes.INTEGER,
        allowNull:true,
        defaultValue:0,
        validate:{
            isNumeric:true,
            min:0
        }
    },
    assignedTo:{
        type:DataTypes.UUID,
        allowNull:true,
        references:{
            model:'users',
            key:'id'
        }
    },
    status:{
        type:DataTypes.ENUM('available','inuse','maintenance','damaged','lost'),
        allowNull:true,
        defaultValue:'available'
    }
},{
    tableName:'equipments',
    sequelize,
    timestamps:true,
    paranoid:false,
    modelName:'Equipments',
});

export default Equipments;