import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";

interface IAttendanceAttributes {
    id: string;
    userId: string;
    checkIn: Date;
    checkOut?: Date;
    hoster:string;
    badge:string;
    date: string;
    status: 'present' | 'late' | 'left_early' | 'absent';
    note?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

class Attendance extends Model<IAttendanceAttributes, Optional<IAttendanceAttributes, 'id' | 'checkOut' | 'hoster' | 'badge' | 'note' | 'createdAt' | 'updatedAt'>> implements IAttendanceAttributes {
    declare id: string;
    declare userId: string;
    declare checkIn: Date;
    declare checkOut?: Date;
    declare hoster:string;
    declare badge:string;
    declare date: string;
    declare status: 'present' | 'late' | 'left_early' | 'absent';
    declare note?: string;
    declare readonly createdAt?: Date;
    declare readonly updatedAt?: Date;
}

Attendance.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    checkIn: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    checkOut: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    hoster:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    badge:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('present', 'late', 'left_early', 'absent'),
        allowNull: false,
        defaultValue: 'present',
    },
    note: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    tableName: 'attendance',
    sequelize,
    timestamps: true,
    modelName: 'Attendance',
});

export default Attendance;
