import { Model,DataTypes,Optional } from "sequelize";
import sequelize from "../config/database";

interface CardAttributes{
    id:string;
    cardNumber:string;
    location?:string;
    branch?:string;
    description?:string;
    status:'assigned'|'available'|'maintenance';
    doneBy?:string;
    assignedTo?:string;
    assignedAt?:Date;
    lastUsed?:Date;
    createdAt?:Date;
    updatedAt?:Date;
}

class Card extends Model<CardAttributes,Optional<CardAttributes,'id'|'status'|'location'|'branch'|'assignedTo'|'createdAt'|'updatedAt'>>implements CardAttributes{
    declare id:string;
    declare cardNumber:string;
    declare location?:string;
    declare branch?:string;
    declare description?:string;
    declare status:'assigned'|'available'|'maintenance';
    declare doneBy?:string;
    declare assignedTo?:string;
    declare assignedAt?:Date;
    declare lastUsed?:Date;
    declare readonly createdAt?:Date;
    declare readonly updatedAt?:Date;
}
Card.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },
    cardNumber:{
        type:DataTypes.UUID,
        allowNull:false,
        unique:true
    },
    location:{
        type:DataTypes.STRING,
        allowNull:true
    },
    branch:{
        type:DataTypes.STRING,
        allowNull:true
    },
    status:{
        type:DataTypes.ENUM('assigned','available','maintenance'),
        defaultValue:'available'
    },
    doneBy:{
        type:DataTypes.UUID,
        allowNull:true
    },
    description:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    assignedTo:{
        type:DataTypes.UUID,
        allowNull:true
    },
    assignedAt:{
        type:DataTypes.DATE,
        allowNull:true
    },
    lastUsed:{
        type:DataTypes.DATE,
        allowNull:true
    }
},{
    tableName:'cards',
    sequelize,
    modelName:'Card',
    paranoid:true,
    timestamps:true
})
export default Card;