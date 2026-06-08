import { Model,DataTypes,Optional } from "sequelize";
import sequelize from "../config/database";

interface AppointmentAttributes{
    id:string;
    userId:string;
    purpose:string;
    host:string;
    status:'pending'|'confirmed'|'canceled'|'onhold'|'completed';
    department:string;
    cancelReason?:string | null;
    reasonToReschedule?:string | null;
    appointmentDate:string;
    appointmentTime:string;
    timeDuration:string;
    appointmentLocation:string;
    note?:string | null;
}

class Appointment extends Model<AppointmentAttributes, Optional<AppointmentAttributes, 'id'>>{
    declare id:string;
    declare userId:string;
    declare purpose?:string;
    declare cancelReason?:string;
    declare reasonToReschedule?:string | null;
    declare host?:string;
    declare department?:string;
    declare appointmentDate?:string;
    declare appointmentTime?:string;
    declare timeDuration?:string;
    declare appointmentLocation?:string;
    declare note?:string | null;
    declare status?:'pending'|'confirmed'|'canceled'|'onhold'|'completed';
    declare static associations:{
        users:any;
    };
}
    Appointment.init({
        id:{
            type:DataTypes.UUID,
            defaultValue:DataTypes.UUIDV4,
            primaryKey:true,
        },
        userId:{
            type:DataTypes.UUID,
            allowNull:false,
            references:{
                model:'users',
                key:'id'
            }
        },
        purpose:{
            type:DataTypes.STRING,
            allowNull:true,
        },
        host:{
            type:DataTypes.STRING,
            allowNull:true,
        },
        department:{
            type:DataTypes.STRING,
            allowNull:true,
        },
        appointmentDate:{
            type:DataTypes.STRING,
            allowNull:true,
        },
        appointmentTime:{
            type:DataTypes.STRING,
            allowNull:true,
        },
        timeDuration:{
            type:DataTypes.STRING,
            allowNull:true,
        },
        appointmentLocation:{
            type:DataTypes.STRING,
            allowNull:true,
        },
        cancelReason:{
            type:DataTypes.TEXT,
            allowNull:true,
        },
        reasonToReschedule:{
            type:DataTypes.TEXT,
            allowNull:true,
        },
        status:{
            type:DataTypes.ENUM('pending','confirmed','canceled','onhold','completed'),
            allowNull:false,
            defaultValue:'pending',
        },
        note:{
            type:DataTypes.TEXT,
            allowNull:true,
        }
    },{
        tableName:'appointments',
        sequelize,
        timestamps:true,
        paranoid:false,
        modelName:'Appointment',
    }
);

export default Appointment;