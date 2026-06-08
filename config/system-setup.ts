import dotenv from 'dotenv';
import sequelize, { initializeDatabase } from './database';
import { hash } from 'bcrypt';
import db from '../models';
dotenv.config();


const permissions = [

    // users permissions
    { name: 'user:create', description: 'Create a new user' },
    { name: 'user:read', description: 'Read user information' },
    { name: 'user:update', description: 'Update user information' },
    { name: 'user:delete', description: 'Delete a user' },
    { name: 'user:list', description: 'List all users' },

    // customer permissions
    { name: 'customer:create', description: 'Create a new customer' },
    { name: 'customer:read', description: 'Read customer information' },
    { name: 'customer:update', description: 'Update customer information' },
    { name: 'customer:delete', description: 'Delete a customer' },
    { name: 'customer:list', description: 'List all customers' },

    //equipement permissions
    { name: 'equipement:create', description: 'Create a new equipement' },
    { name: 'equipement:read', description: 'Read equipement information' },
    { name: 'equipement:update', description: 'Update equipement information' },
    { name: 'equipement:delete', description: 'Delete a equipement' },
    { name: 'equipement:list', description: 'List all equipements' },

    //security GiGate guard permissions
    { name: 'security_gate:create', description: 'Create a new security gate' },
    { name: 'security_gate:read', description: 'Read security gate information' },
    { name: 'security_gate:update', description: 'Update security gate information' },
    { name: 'security_gate:delete', description: 'Delete a security gate' },
    {name: 'security_gate:suspend', description: 'Suspend security gate' },
    { name: 'security_gate:list', description: 'List all security gates' },

    // subscriptions pemissions
    { name: 'subscription:create', description: 'Create a new subscription' },
    { name: 'subscription:read', description: 'Read subscription information' },
    { name: 'subscription:update', description: 'Update subscription information' },
    { name: 'subscription:delete', description: 'Delete a subscription' },
    { name: 'subscription:list', description: 'List all subscriptions' },

    // billing permissions
    { name: 'billing:create', description: 'Create a new billing' },
    { name: 'billing:read', description: 'Read billing information' },
    { name: 'billing:update', description: 'Update billing information' },
    { name: 'billing:delete', description: 'Delete a billing' },
    { name: 'billing:list', description: 'List all billings' },


    // business analytics
    { name: 'analytics:read', description: 'Read business analytics' },

    // Form management
    { name: 'form:create', description: 'Create a new form' },
    { name: 'form:read', description: 'Read form information' },
    { name: 'form:update', description: 'Update form information' },
    { name: 'form:delete', description: 'Delete a form' },
    { name: 'form:list', description: 'List all forms' },
    { name: 'form:submit', description: 'Submit a form' },


    // Role management
    { name: 'role:create', description: 'Create a new role' },
    { name: 'role:read', description: 'Read role information' },
    { name: 'role:update', description: 'Update role information' },
    { name: 'role:delete', description: 'Delete a role' },
    { name: 'role:list', description: 'List all roles' },

    // visitors management
    { name: 'visitor:create', description: 'Create a new visitor' },
    { name: 'visitor:read', description: 'Read visitor information' },
    { name: 'visitor:update', description: 'Update visitor information' },
    { name: 'visitor:delete', description: 'Delete a visitor' },
    { name: 'visitor:list', description: 'List all visitors' },

    //reports management
    { name: 'report:create', description: 'Create a new report' },
    { name: 'report:read', description: 'Read report information' },
    { name: 'report:update', description: 'Update report information' },
    { name: 'report:delete', description: 'Delete a report' },
    { name: 'report:list', description: 'List all reports' },

    //setting management
    { name: 'setting:update', description: 'Update system settings' },
    { name: 'setting:read', description: 'Read system settings' },
    { name: 'setting:create', description: 'Create a new setting' },
    { name: 'setting:delete', description: 'Delete a setting' },

    //system-healthy 
    { name: 'system_healthy:read', description: 'Check system health status' },

    //security control
    { name: 'security:control', description: 'Control system security' },

    // system logs
    { name: 'system_logs:read', description: 'Read system logs' },
    { name: 'system_logs:create', description: 'Create system logs' },
    { name: 'system_logs:delete', description: 'Delete system logs' },
    { name: 'system_logs:update', description: 'Update system logs' },
    { name: 'system_logs:list', description: 'List system logs' },

    // events permissions
    { name: 'event:create', description: 'Create a new event' },
    { name: 'event:read', description: 'Read event information' },
    { name: 'event:update', description: 'Update event information' },
    { name: 'event:delete', description: 'Delete a event' },
    { name: 'event:list', description: 'List all events' },

    // attendance permissions
    { name: 'attendance:mark', description: 'Mark attendance' },
    { name: 'attendance:read', description: 'Read attendance information' },
    { name: 'attendance:update', description: 'Update attendance information' },
    { name: 'attendance:delete', description: 'Delete attendance information' },
    { name: 'attendance:list', description: 'List attendance information' },

    // Announcement Permissions
    { name: 'announcement:create', description: 'Create announcements' },
    { name: 'announcement:read', description: 'View announcements' },
    { name: 'announcement:update', description: 'Update announcements' },
    { name: 'announcement:delete', description: 'Delete announcements' },

    //handover permissions
    { name: 'handover:create', description: 'Create a new handover' },
    { name: 'handover:read', description: 'Read handover information' },
    { name: 'handover:update', description: 'Update handover information' },
    { name: 'handover:delete', description: 'Delete a handover' },
    { name: 'handover:list', description: 'List all handovers' },

    //appointment permissions
    { name: 'appointment:create', description: 'Create a new appointment' },
    { name: 'appointment:read', description: 'Read appointment information' },
    { name: 'appointment:update', description: 'Update appointment information' },
    { name: 'appointment:delete', description: 'Delete a appointment' },
    { name: 'appointment:list', description: 'List all appointments' },
    { name: 'appointment:confirm', description: 'Confirm an appointment' },
    { name: 'appointment:cancel', description: 'Cancel an appointment' },

    //scanning permissions
    { name: 'scanning:read', description: 'Read scanning information' },
    { name: 'scanning:create', description: 'Create a new scanning record' },
    { name: 'scanning:update', description: 'Update scanning information' },
    { name: 'scanning:delete', description: 'Delete a scanning record' },
    { name: 'scanning:list', description: 'List all scanning records' },

    //card management permissions
    { name: 'card:create', description: 'Create a new card' },
    { name: 'card:read', description: 'Read card information' },
    { name: 'card:update', description: 'Update card information' },
    { name: 'card:delete', description: 'Delete a card' },
    { name: 'card:list', description: 'List all cards' },

    //smoke  permissions
    { name: 'smoke:read', description: 'Read smoke detection information' },
    { name: 'smoke:create', description: 'Create a new smoke detection record' },
    { name: 'smoke:update', description: 'Update smoke detection information' },
    { name: 'smoke:delete', description: 'Delete a smoke detection record' },
    { name: 'smoke:list', description: 'List all smoke detection records' },
]

// Permission based on the role
const roleTemplates = {
    // system owner

    owner: {
        name: 'system_owner',
        description: 'Full access to the system',
        permissions: permissions.map(p => p.name)
    },
    super_admin: {
        name: 'super_admin',
        description: 'Full access to the system except owner permissions',
        permissions: permissions.map(p => p.name)
    },
    admin: {
        name: 'admin',
        description: 'Administrator with limited permissions',
        permissions: permissions.map(p => p.name)
    },
    helpDesk: {
        name: 'help_desk',
        description: 'Help desk agent with limited permissions',
        permissions: [
            'visitor:read', 'visitor:list', 'visitor:create', 'equipement:list', 'equipement:read', 'form:read', 'form:submit', 'report:read',
            'report:list', 'event:read', 'event:list', 'attendance:read', 'attendance:list', 'announcement:read', 'announcement:list'
            , 'appointment:read', 'appointment:list', 'handover:read', 'handover:list', 'handover:create', 'handover:update', 'equipment:read', 'equipment:list'
        ]
    },
    chechPoint: {
        name: 'check_point',
        description: 'Check point agent with limited permissions',
        permissions: [
            'attendance:mark', 'attendance:read', 'attendance:list', 'visitor:read', 'visitor:list', 'visitor:create', 'event:read', 'event:list', 'announcement:read',
            'announcement:list', 'appointment:read', 'appointment:list', 'handover:read', 'handover:list', 'handover:create', 'handover:update', 'equipement:read', 'equipement:list'
        ]
    },
    dataManager: {
        name: 'data_manager',
        description: 'Data manager with limited permissions',
        permissions: [
            'user:read', 'user:list', 'user:create', 'user:update', 'equipement:read', 'equipement:list', 'form:read', 'form:list', 'form:create', 'form:update',
            'role:read', 'role:list', 'visitor:read', 'visitor:list', 'report:read', 'report:list', 'event:read', 'event:list', 'attendance:read',
            'attendance:list', 'announcement:read', 'announcement:list', 'appointment:read', 'appointment:list', 'handover:read', 'handover:list',
            'setting:read', 'setting:list', 'system_logs:read', 'system_logs:list', 'system_healthy:read', 'security:control'
        ]
    },
    teamLeader: {
        name: 'team_leader',
        description: 'Team leader with limited permissions',
        permissions: [
            'user:read', 'user:create', 'user:update', 'user:list', 'visitor:read', 'visitor:list', 'report:read', 'report:list', 'event:read', 'event:list', 'attendance:read',
            'attendance:list', 'announcement:read', 'announcement:list', 'appointment:read', 'appointment:list', 'handover:read', 'handover:list',
            'equipement:read', 'equipement:list', 'form:read', 'form:create', 'form:list', 'form:submit', 'setting:read', 'setting:list', 'system_logs:read',
            'system_logs:list', 'system_healthy:read', 'security:control','security_gate:read', 'security_gate:list', 'security_gate:suspend', 'security_gate:update', 'security_gate:create', 'security_gate:delete'
        ]
    },
    staff: {
        name: 'staff',
        description: 'Staff member with limited permissions',
        permissions: [
            'visitor:read', 'visitor:list', 'report:read', 'report:list', 'event:read', 'event:list', 'attendance:read',
            'attendance:list', 'announcement:read', 'announcement:list', 'appointment:read', 'appointment:list', 'handover:read', 'handover:list',
            'equipement:read', 'equipement:list', 'form:read', 'form:submit', 'setting:read', 'system_logs:read', 'system_logs:list',
            'system_healthy:read', 'security:control'
        ]
    },
    system_office: {
        name: 'system_office',
        description: 'System office with limited permissions',
        permissions: [
            'user:read', 'user:list', 'visitor:read', 'visitor:list', 'report:read', 'report:list', 'event:read', 'event:list', 'attendance:read',
            'attendance:list', 'announcement:read', 'announcement:list', 'appointment:read', 'appointment:list', 'handover:read', 'handover:list',
            'equipement:read', 'equipement:list', 'form:read', 'form:list', 'setting:read', 'setting:list', 'system_logs:read', 'system_logs:list',
            'system_healthy:read', 'security:control'
        ]
    },
    human_resource: {
        name: 'human_resource',
        description: 'Human resource with limited permissions',
        permissions: [
            'user:read', 'user:list', 'user:create', 'user:update', 'visitor:read', 'visitor:list', 'report:read', 'report:list', 'event:read', 'event:list',
            'attendance:read', 'attendance:list', 'announcement:read', 'announcement:list', 'appointment:read', 'appointment:list', 'handover:read', 'handover:list',
            'equipement:read', 'equipement:list', 'form:read', 'form:list', 'form:create', 'form:update', 'setting:read', 'setting:list', 'system_logs:read',
            'system_logs:list', 'system_healthy:read', 'security:control'
        ]
    },
    protocals: {
        name: 'protocals',
        description: 'Protocals officer with limited permissions',
        permissions: [
            'visitor:read', 'visitor:list', 'report:read', 'report:list', 'event:read', 'event:list', 'attendance:read',
            'attendance:list', 'announcement:read', 'announcement:list', 'appointment:read', 'appointment:list', 'handover:read', 'handover:list',
            'equipement:read', 'equipement:list', 'form:read', 'form:list', 'setting:read', 'setting:list', 'system_logs:read', 'system_logs:list',
            'system_healthy:read', 'security:control'
        ]
    }

}
// Add more role templates as needed
const roles = Object.entries(roleTemplates).map(([key, role]) => ({
    name: role.name,
    description: role.description,
    permissions: role.permissions
}));


const setupSystem = async () => {
    try {
        //Test database connection first
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');

        // Disable foreign key checks temporarily to allow dropping tables in any order
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');


        console.log('🔄 Dropping existing tables...');

        try {
            //Drop tables in reverse order of dependences
            await sequelize.getQueryInterface().dropAllTables();
            console.log('✅ Dropped all tables');
        } catch (error) {
            console.log('ℹ️ All tables did not exist or could not be dropped');
        }
        try {
            // Drop tables in reverse order of dependencies
            await sequelize.getQueryInterface().dropTable('user_roles');
            console.log('✅ Dropped user_roles table');
        } catch (error) {
            console.log('ℹ️ user_roles table did not exist or could not be dropped');
        }

        try {
            await sequelize.getQueryInterface().dropTable('role_permissions');
            console.log('✅ Dropped role_permissions table');
        } catch (error) {
            console.log('ℹ️ role_permissions table did not exist or could not be dropped');
        }

        try {
            await sequelize.getQueryInterface().dropTable('users');
            console.log('✅ Dropped users table');
        } catch (error) {
            console.log('ℹ️ users table did not exist or could not be dropped');
        }

        try {
            await sequelize.getQueryInterface().dropTable('roles');
            console.log('✅ Dropped roles table');
        } catch (error) {
            console.log('ℹ️ roles table did not exist or could not be dropped');
        }

        try {
            await sequelize.getQueryInterface().dropTable('permissions');
            console.log('✅ Dropped permissions table');
        } catch (error) {
            console.log('ℹ️ permissions table did not exist or could not be dropped');
        }

        // Re-enable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('🔄 Creating database schema...');
        // Use force: true to ensure tables are recreated from scratch
        await sequelize.sync({ force: true });
        await initializeDatabase();
        console.log('✅ Database models synchronized.');

        // Create permissions - now we can safely query since tables exist
        console.log('🔄 Creating permissions...');
        const createdPermissions = [];

        for (const permission of permissions) {
            try {
                // Since we used force: true, tables are empty, so we can directly create
                const newPermission = await db.Permission.create({
                    name: String(permission.name).trim(),
                    description: permission.description
                });
                console.log(`✅ Created permission: ${newPermission.name}`);
                createdPermissions.push(newPermission);
            } catch (error) {
                console.error(`❌ Error creating permission ${permission.name}:`, error);
                throw error; // Stop setup if any permission fails to create
            }
        }
        console.log(`${createdPermissions.length} permissions created.`);

        // Create roles and associate permissions
        console.log('🔄 Creating roles and associating permissions...');
        const createdRoles = [];

        for (const roleData of roles) {
            try {
                // Create new role(tables are empty due to force: true, so no need to check for existing role)
                const newRole = await db.Role.create({
                    name: String(roleData.name).trim(),
                    description: roleData.description,
                    category: (roleData as any).category ?? null
                });
                console.log(`✅ Created role: ${newRole.name}`);
                // Get permission instances for this role
                const rolePermissions = await db.Permission.findAll({
                    where: { name: roleData.permissions }
                });

                if (rolePermissions.length > 0) {
                    //We use setPermissions to create associations in the join table at once
                    await (newRole as any).setPermissions(rolePermissions);
                    console.log(`🔗 Associated ${rolePermissions.length} permissions with role ${newRole.name}`);
                }
                else {
                    console.warn(`⚠️  No permissions found for role: ${newRole.name}`);

                }
                createdRoles.push(newRole);
            } catch (error) {
                console.error(`❌ Error creating role ${roleData.name}:`, error);
                throw error; // Stop setup if any role fails to create
            }
        }
        console.log(`${createdRoles.length} roles created with permissions.`);

        // Create default system owner user
        console.log('🔄 Creating default system owner user...');
        const ownerEmail = 'santech@gmail.com';
        const ownerPassword = 'Santech@2026';
        const phoneNumber = '1234567890';

        const ownerUser = await db.User.create({
            fullName: 'System Owner',
            email: ownerEmail,
            phoneNumber: phoneNumber,
            password: await hash(ownerPassword, 10),
            status: 'active'
        });
        console.log(`✅ Created default system owner user with email: ${ownerEmail}`);

        // Assign owner role to the user
        const ownerRole = await db.Role.findOne({ where: { name: 'system_owner' } });
        if (ownerRole) {
            await (ownerUser as any).setRoles([ownerRole]);
            console.log('✅ Assigned system_owner role to default user');
        } else {
            console.warn('⚠️ system_owner role not found; skipping role assignment for owner user');
        }

        // Create default admin user
        console.log('🔄 Creating default admin user...');
        const adminEmail = 'admin@example.com';
        const adminPassword = 'Admin@2026';
        const adminPhoneNumber = '0987654321';

        const adminUser = await db.User.create({
            fullName: 'Admin User',
            email: adminEmail,
            phoneNumber: adminPhoneNumber,
            password: await hash(adminPassword, 10),
            status: 'active'
        });
        console.log(`✅ Created default admin user with email: ${adminEmail}`);

        // Assign admin role to the user
        const adminRole = await db.Role.findOne({ where: { name: 'admin' } });
        if (adminRole) {
            await (adminUser as any).setRoles([adminRole]);
            console.log('✅ Assigned admin role to default admin user');
        } else {
            console.warn('⚠️ admin role not found; skipping role assignment for admin user');
        }

        // Create seed users for other roles
        console.log('🔄 Creating seed users for remaining roles...');
        const seedUsers = [
            { fullName: 'Super Admin User', email: 'superadmin@example.com', phoneNumber: '1111111111', role: 'super_admin' },
            { fullName: 'Help Desk Agent', email: 'helpdesk@example.com', phoneNumber: '2222222222', role: 'help_desk' },
            { fullName: 'Check Point Officer', email: 'checkpoint@example.com', phoneNumber: '3333333333', role: 'check_point' },
            { fullName: 'Data Manager', email: 'datamanager@example.com', phoneNumber: '4444444444', role: 'data_manager' },
            { fullName: 'Team Leader', email: 'teamleader@example.com', phoneNumber: '5555555555', role: 'team_leader' },
            { fullName: 'Staff Member', email: 'staff@example.com', phoneNumber: '6666666666', role: 'staff' },
            { fullName: 'System Office', email: 'sysoffice@example.com', phoneNumber: '7777777777', role: 'system_office' },
            { fullName: 'HR Manager', email: 'hr@example.com', phoneNumber: '8888888888', role: 'human_resource' },
            { fullName: 'Protocols Officer', email: 'protocols@example.com', phoneNumber: '9999999999', role: 'protocals' }
        ];

        const defaultPassword = 'Password@123';

        for (const seedUser of seedUsers) {
            try {
                const user = await db.User.create({
                    fullName: seedUser.fullName,
                    email: seedUser.email,
                    phoneNumber: seedUser.phoneNumber,
                    password: await hash(defaultPassword, 10),
                    status: 'active'
                });
                console.log(`✅ Created ${seedUser.role} user: ${seedUser.email}`);

                // Assign role to the user
                const role = await db.Role.findOne({ where: { name: seedUser.role } });
                if (role) {
                    await (user as any).setRoles([role]);
                    console.log(`✅ Assigned ${seedUser.role} role to ${seedUser.email}`);
                } else {
                    console.warn(`⚠️ ${seedUser.role} role not found for ${seedUser.email}`);
                }
            } catch (error) {
                console.error(`❌ Error creating seed user ${seedUser.email}:`, error);
                // Continue with other users instead of stopping
            }
        }

        console.log('✅ System setup completed successfully!');
        return {
            roles: createdRoles.length,
            permissions: createdPermissions.length
        };
    } catch (error) {
        console.error('❌ Error during system setup:', error);
        throw error;
    }
};

// Run the setup if this file is executed directly
if (require.main === module) {
    setupSystem()
        .then((result) => {
            console.log('✅ Setup completed:', result);
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Setup failed:', error);
            process.exit(1);
        });
}

export default setupSystem;