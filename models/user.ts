import {Model, DataTypes,Optional, Transaction} from "sequelize";
import sequelize from "../config/database";
import Role from "./role";

interface IUserAttributes {
    id: string;
    fullName: string;
    email?: string;
    phoneNumber?: string|number;
    password?: string;
    status: string;
    category?: string;
    badge?:string;
    department?:string;
    company?:string;
    UserRoles?: any[];

    //Other and Biometric attributes
    profilePicture?: string;
    dateOfBirth?: Date;
    scannedId?:string
    nationalId?: string;
    fingerPrint?: string;
    face?: string;
    voice?: string;
    signature?: string;
    passport?: string;
    motion?: string;
    igipande?: string;
    ocr?: string;
    gesture?: string;
    pupil?: string;
    otherBiometric?: string;

    // address details
    nationality?: string;
    country?: string;
    province?: string;
    district?: string;
    sector?: string;
    cell?: string;
    village?: string;

    //personal in charge details
    personalInChargeNationalId?: string;
    personalInChargeName?: string;
    personalInChargePhone?: string|number;
    personalInChargeEmail?: string;
    personalInChargeRelation?: string;
    personalInChargeOtherDetails?: string;
    smoking?:boolean

  
    createdAt?: Date;
    updatedAt?: Date;
}

class User extends Model<IUserAttributes, Optional<IUserAttributes, 'id'|'status'|'UserRoles'|'createdAt'|'updatedAt'>> implements IUserAttributes {
    async addRole(role: Role, options?: { transaction?: Transaction }): Promise<void> {
        const UserRole = sequelize.models.UserRole as any;
        await UserRole.create({
            userId: this.id,
            roleId: role.id
        }, options);
    }
    declare id: string;
    declare fullName: string;
    declare phoneNumber?: string|number;
    declare email?: string;
    declare password?: string;
    declare category?: string;
    declare badge?: string;
    declare company?: string ;
    declare status: string;
    declare department?: string | undefined;
    declare UserRoles?: any[];
    declare roles?:Role[];
    declare profilePicture?: string;
    declare dateOfBirth?: Date;
    declare nationalId?: string;
    declare scannedId?: string;
    declare fingerPrint?: string;
    declare face?: string;
    declare voice?: string;
    declare signature?: string;
    declare passport?: string;
    declare motion?: string;
    declare igipande?: string;
    declare ocr?: string;
    declare gesture?: string;
    declare pupil?: string;
    declare otherBiometric?: string;

    // address details
    declare nationality?: string;
    declare country?: string;
    declare province?: string;
    declare district?: string;
    declare sector?: string;
    declare cell?: string;
    declare village?: string;

    //personal in charge details
    declare personalInChargeNationalId?: string;
    declare personalInChargeName?: string;
    declare personalInChargePhone?: string|number;
    declare personalInChargeEmail?: string;
    declare personalInChargeRelation?: string;
    declare personalInChargeOtherDetails?: string | undefined;
    declare smoking?: boolean;
  
    declare readonly createdAt?: Date;
    declare readonly updatedAt?: Date;


// Sequelize association methods
declare getRoles:(options?:any)=>Promise<Role[]>;
}


User.init({
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull:true,
    },
    fullName:{
        type: DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty:true,
        },
    },
    email:{
        type: DataTypes.STRING,
        allowNull:true,
        validate:{
            isEmailOrNull(value: string | null) {
                if (value !== null && value !== undefined && value !== '') {
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        throw new Error('Must be a valid email address');
                    }
                }
            }
        },
    },
    phoneNumber:{
        type: DataTypes.STRING,
        allowNull:true,
        validate:{
            notEmpty:true,
        },
    },
    password:{
        type: DataTypes.STRING,
        allowNull:true,
        validate:{
            notEmpty:true,
            len:[6,100],
        },
    },
    category:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    badge:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    company:{
        type:DataTypes.STRING,
        allowNull:true
    },
    status:{
        type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending', 'deleted', 'archived', 'rejected','blacklisted'),
        allowNull:false,
        defaultValue:'pending',
    },
    department:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    profilePicture:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    dateOfBirth:{
        type: DataTypes.DATE,
        allowNull:true,
    },
    nationalId:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    scannedId:{
        type:DataTypes.TEXT,
        allowNull:true,
    },
    fingerPrint:{
        type: DataTypes.TEXT,
        allowNull:true,
    },
    face:{
        type: DataTypes.TEXT('long'),
        allowNull:true,
    },
    voice:{
        type: DataTypes.TEXT,
        allowNull:true,
    },
    signature:{
        type: DataTypes.TEXT,
        allowNull:true,
    },
    passport:{
        type: DataTypes.TEXT,
        allowNull:true,
    },
    motion:{
        type: DataTypes.TEXT,
        allowNull:true,
    },
    igipande:{
        type: DataTypes.TEXT,
        allowNull:true,
    },
    ocr:{
        type: DataTypes.TEXT,
        allowNull:true,
    },
    gesture:{
        type: DataTypes.TEXT,
        allowNull:true,
    },
    pupil:{
        type: DataTypes.TEXT,
        allowNull:true,
    },
    otherBiometric:{
        type: DataTypes.TEXT,
        allowNull:true,
    },
     // address details
     nationality:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    country:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    province:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    district:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    sector:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    cell:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    village:{
        type: DataTypes.STRING,
        allowNull:true,
    },

    //personal in charge details
    personalInChargeNationalId:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    personalInChargeName:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    personalInChargePhone:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    personalInChargeEmail:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    personalInChargeRelation:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    personalInChargeOtherDetails:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    smoking:{
        type:DataTypes.BOOLEAN,
        allowNull:true,
        defaultValue:false,
    },
},{
        tableName:'users',
        sequelize,
        timestamps:true,
        paranoid:false,
        modelName:'User',
        indexes:[
            {
                unique:true,
                fields:['email'],
            }
        ]
    });

export default User;
