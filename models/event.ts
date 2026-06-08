import { Model,DataTypes,Optional } from "sequelize";
import sequelize from "../config/database";

interface IeventAttributes {
    id: string;
    title: string;
    description?: string|null;
    hoster?:string;
    eventDate?: string;
    eventTime?: string;
    expectedAttendees?: string;
    timeDuration?: string;
    eventLocation?: string;
    createdAt?: Date;
    updatedAt?: Date;
    status?:string|undefined;
}

interface IeventCreationAttributes extends Optional<IeventAttributes,'id'|'createdAt'|'updatedAt'>{}

class AttendEvent extends Model<IeventAttributes,IeventCreationAttributes> implements IeventAttributes{
    public id!:string;
    public title!:string;
    public description!:string;
    public hoster?: string | undefined;
    public eventDate!:string;
    public eventTime!:string;
    public expectedAttendees!:string;
    public timeDuration!:string;
    public eventLocation!:string;
    public status?: string | undefined;
    public readonly createdAt!:Date;
    public readonly updatedAt!:Date;
}

AttendEvent.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },
    title:{
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
    hoster:{
        type:DataTypes.UUID,
        allowNull:true,
        references:
            {
                model:"users",
                key:"id"
            }
    },
    eventDate:{
        type:DataTypes.DATEONLY,
        allowNull:true,
        validate:{
            isDate:true
        }
    },
    eventTime:{
        type:DataTypes.TIME,
        allowNull:true,
        validate:{
            isTime:true
        }
    },
    expectedAttendees:{
        type:DataTypes.STRING,
        allowNull:true
    },
    timeDuration:{
        type:DataTypes.STRING,
        allowNull:true
    },
    eventLocation:{
        type:DataTypes.STRING,
        allowNull:true
    },
    status:{
        type:DataTypes.ENUM('pending','completed','cancelled','onhold','confirmed'),
        allowNull:true,
        defaultValue:'pending'
    }
},{
    tableName:'events',
    sequelize,
    timestamps:true,
    paranoid:false,
    modelName:'AttendEvent',
    indexes:[
        {
            unique:true,
            fields:['title']
        }
    ]
})

export default AttendEvent;