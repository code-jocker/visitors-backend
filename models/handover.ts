import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";

interface HandoverAttributes {
    id: string;
    outgoingUser: string;
    incomingUser: string;
    equipmentId?: string | null;
    handOverDate: Date;
    handOverTime: string;
    handOverDescription?: string | null;
    handOverItems: string;
    handOverShift: string;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
}

class Handover extends Model<HandoverAttributes, Optional<HandoverAttributes, 'id' | 'createdAt' | 'updatedAt'>> implements HandoverAttributes {
    public id!: string;
    public outgoingUser!: string;
    public incomingUser!: string;
    public equipmentId!: string | null;
    public handOverDate!: Date;
    public handOverTime!: string;
    public handOverDescription!: string | null;
    public handOverItems!: string;
    public handOverShift!: string;
    public status!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Handover.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    outgoingUser: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    incomingUser: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    equipmentId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'equipments',
            key: 'id'
        }
    },
    handOverDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    handOverTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    handOverDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    handOverItems: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    handOverShift: {
        type: DataTypes.ENUM('morning', 'afternoon', 'night'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
    }
}, {
    tableName: 'handovers',
    sequelize,
    timestamps: true,
    paranoid: false,
    modelName: 'Handover'
});

export default Handover;
