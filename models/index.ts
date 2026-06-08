import sequelize from "../config/database";
import Permission from "./permission";
import Role from "./role";
import UserRole from "./userRole";
import User from "./user";
import BlacklistedToken from "./blacklistedToken";
import Appointment from "./appointment";
import AttendEvent from "./event";
import Equipements from "./equipment";
import Handover from "./handover";
import Attendance from "./attendance";
import Card from "./card";
import Visitor from "./visitor";

// Centralized associations  of all models for easy import in other parts of the application
User.belongsToMany(Role,{
    through:UserRole,
    as:'roles',
    foreignKey:'userId',
    otherKey:'roleId',
});
Role.belongsToMany(User,{
    through:UserRole,
    as:'users',
    foreignKey:'roleId',
    otherKey:'userId',
});

Role.belongsToMany(Permission,{
    through:'role_permissions',
    as:'permissions',
    foreignKey:'roleId',
    otherKey:'permissionId',
});

Permission.belongsToMany(Role,{
    through:'role_permissions',
    as:'roles',
    foreignKey:'permissionId',
    otherKey:'roleId',
});

Equipements.belongsToMany(User,{
    through:'userEquipements',
    foreignKey:'equipmentId',
    as:'assignedUser',
    otherKey:'userId'
})
User.belongsToMany(Equipements,{
    through:'userEquipements',
    foreignKey:'userId',
    as:'equippedUser',
    otherKey:'equipmentId'
})

AttendEvent.belongsToMany(User,{
    through:'event_attendees',
    as:'attendees',
    foreignKey:'eventId',
    otherKey:'userId'
} )
User.belongsToMany(AttendEvent,{
    through:'event_attendees',
    as:'events',
    foreignKey:'userId',
    otherKey:'eventId'
})

User.belongsToMany(Handover,{
    through:'handovers_users',
    as:'handovers',
    foreignKey:'userId',
    otherKey:'handoverId'
})

Handover.belongsToMany(User,{
    through:'handovers_users',
    as:'users',
    foreignKey:'handoverId',
    otherKey:'userId'
})

Card.belongsTo(User,{as:'assignedUser', foreignKey:'assignedTo'})
User.hasOne(Card,{as:'card', foreignKey:'assignedTo'})

User.hasMany(Equipements, { foreignKey: 'assignedTo', as: 'equipments' });
Equipements.belongsTo(User, { foreignKey: 'assignedTo', as: 'equipmentOwner' });

User.hasMany(Appointment, { foreignKey: 'userId', as: 'appointments' });
Appointment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Attendance, { foreignKey: 'userId', as: 'attendances' });
Attendance.belongsTo(User, { foreignKey: 'userId', as: 'user' });

const db = {
    sequelize,
    User,
    Role,
    Permission,
    UserRole,
    BlacklistedToken,
    Appointment,
    AttendEvent,
    Equipements,
    Handover,
    Attendance,
    Card,
    Visitor
};

export default db;