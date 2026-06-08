import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";

interface IBlacklistedTokenAttributes {
    id: string;
    token: string;
    expiresAt: Date;
    createdAt?: Date;
}

class BlacklistedToken extends Model<IBlacklistedTokenAttributes, Optional<IBlacklistedTokenAttributes, 'id' | 'createdAt'>> implements IBlacklistedTokenAttributes {
    declare id: string;
    declare token: string;
    declare expiresAt: Date;
    declare readonly createdAt?: Date;
}

BlacklistedToken.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    token: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'blacklisted_tokens',
    sequelize,
    timestamps: true,
    updatedAt: false,
    modelName: 'BlacklistedToken',
    indexes: [
        {
            fields: ['token'],
        },
        {
            fields: ['expiresAt'],
        }
    ]
});

export default BlacklistedToken;
