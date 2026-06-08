import { ServiceResponse } from "../utils/serviceResponse";
import { asyncCatch } from "../middlewares/errorHandler";
import { Body, Controller, Delete, Get, Patch, Path, Post, Put, Route, Security, Tags } from "tsoa";
import User from "../models/user";
import Attendance from "../models/attendance";
import { IUserAttributes } from "../types/user-type";
import { hash } from "bcryptjs";
import Equipments from "../models/equipment";
import Card from "../models/card";
import sequelize from "../config/database";

export interface UserCreateRequest {
    fullName: string;
    email?: string;
    password?: string;
    scannedId: string;
    phoneNumber?: string;
    status?: string;
    category?: string;
    badge?: string;
    role?: string;
    company?: string;
    department?: string;
    nationalId?: string;
    equipments?: EquipmentAssignment[];
    cardId?: string;
}

export interface EquipmentAssignment {
    name: string;
    serialNumber: string;
    type?: string;
}

export interface UserWithEquipmentResponse {
    success: boolean;
    message: string;
    result: {
        userId: string;
        equipmentIds: string[];
        assignedCardId: string | null;
    } | null;
    statusCode: number;
}

export interface AttendanceInfo {
    id: string;
    userId: string;
    checkIn: Date;
    date: string;
    status: string;
}

export interface UserWithAttendanceResponse {
    success: boolean;
    message: string;
    result: {
        user: IUserAttributes | null;
        attendance: AttendanceInfo | null;
        isNewUser: boolean;
        equipmentIds: string[];
        assignedCardId: string | null;
    } | null;
    statusCode: number;
}

export interface UserUpdateRequest {
    email?: string;
    fullName?: string;
    phoneNumber?: string;
    department?: string;
    role?: string;
    category?: string;
    company?: string;
    status?: string
}

export interface UserResponse {
    success: boolean;
    message: string;
    result: IUserAttributes | null;
    statusCode: number;
}

export interface UsersListResponse {
    success: boolean;
    message: string;
    result: IUserAttributes[] | null;
    statusCode: number;
}

@Route('api/users')
@Tags('Users')
export class UserController extends Controller {
    @Security('jwt', ['user:list'])
    @Get('/')
    @asyncCatch
    public async getAllUsers(): Promise<UsersListResponse> {
        const users = await User.findAll({ order: [['fullName', 'ASC']] });
        return ServiceResponse.success('users retrieved successfully', users.map(u => u.toJSON() as IUserAttributes));
    }

    @Security('jwt', ['user:read'])
    @Get('/{id}')
    @asyncCatch
    public async getUserById(
        @Path() id: string): Promise<UserResponse> {
        const user = await User.findByPk(id);
        if (!user) {
            return ServiceResponse.failure('user not found', null, 404);
        }
        return ServiceResponse.success('user retrieved successfully', user.toJSON() as IUserAttributes);
    }

    @Security('jwt', ['user:create'])
    @Post('/')
    @asyncCatch
    public async createUser(
        @Body() userData: UserCreateRequest
    ): Promise<UserWithAttendanceResponse> {
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        console.log('\n========== CREATE USER / ATTENDANCE ==========');
        console.log('[INPUT] Received data:', JSON.stringify(userData, null, 2));

        const whereClause: any = {};
        if (userData.nationalId) whereClause.nationalId = userData.nationalId;
        else if (userData.scannedId) whereClause.scannedId = userData.scannedId;

        console.log('[LOOKUP] Searching user by:', whereClause);

        const existingUser = whereClause.nationalId || whereClause.scannedId
            ? await User.findOne({ where: whereClause })
            : null;

        console.log('[LOOKUP] Existing user found:', existingUser ? `YES (id: ${existingUser.id}, name: ${existingUser.fullName})` : 'NO');

        const transaction = await sequelize.transaction();
        let user: User;
        let isNewUser = false;
        const equipmentIds: string[] = [];
        let assignedCardId: string | null = null;

        try {
            if (!existingUser) {
                console.log('[ACTION] Registering new user...');
                const hashedPassword = userData.password ? await hash(userData.password, 12) : undefined;
                const sanitized = { ...userData, email: userData.email || undefined, password: hashedPassword, badge: userData.cardId };
                user = await User.create(sanitized, { transaction });
                console.log('[ACTION] New user created:', JSON.stringify({ id: user.id, fullName: user.fullName, status: user.status }, null, 2));

                // Assign equipments
                if (userData.equipments && userData.equipments.length > 0) {
                    console.log('[ACTION] Assigning equipments:', userData.equipments);
                    for (const eq of userData.equipments) {
                        const equipmentRecord = await Equipments.findOne({
                            where: { name: eq.name, serialNumber: eq.serialNumber },
                            transaction
                        });
                        if (equipmentRecord) {
                            await equipmentRecord.update({ assignedTo: user.id, status: 'inuse' }, { transaction });
                            equipmentIds.push(equipmentRecord.id);
                            console.log(`[ACTION] Equipment assigned: ${eq.name} (${eq.serialNumber})`);
                        } else {
                            console.log(`[WARN] Equipment not found: ${eq.name} (${eq.serialNumber})`);
                        }
                    }
                }

                // Assign card
                if (userData.cardId) {
                    console.log('[ACTION] Assigning card:', userData.cardId);
                    const card = await Card.findByPk(userData.cardId, { transaction });
                    if (card) {
                        await card.update({ assignedTo: user.id, status: 'assigned', assignedAt: new Date() }, { transaction });
                        assignedCardId = card.id;
                        console.log('[ACTION] Card assigned successfully');
                    } else {
                        console.log('[WARN] Card not found:', userData.cardId);
                    }
                }
                isNewUser = true;
            } else {
                console.log('[ACTION] Existing user — skipping registration, recording attendance only');
                user = existingUser;
            }

            // Always create attendance record
            console.log('[ACTION] Creating attendance record for user:', user.id);
            const attendance = await Attendance.create({
                userId: user.id,
                checkIn: now,
                date: today,
                status: 'present',
                hoster: userData.email || undefined,
                badge: userData.badge || undefined
            }, { transaction });
            console.log('[ACTION] Attendance created:', JSON.stringify({ id: attendance.id, checkIn: attendance.checkIn, date: attendance.date, status: attendance.status }, null, 2));

            await transaction.commit();
            console.log('[ACTION] Transaction committed successfully');
            console.log('==============================================\n');

            return ServiceResponse.success(
                isNewUser ? 'User registered and attendance recorded' : 'Attendance recorded',
                {
                    user: user.toJSON() as IUserAttributes,
                    attendance: attendance.toJSON() as AttendanceInfo,
                    isNewUser,
                    equipmentIds,
                    assignedCardId
                },
                isNewUser ? 201 : 200
            );
        } catch (error) {
            await transaction.rollback();
            console.error('[ERROR] Transaction rolled back:', error);
            throw error;
        }
    }

    @Security('jwt', ['user:update'])
    @Put('/{id}')
    @asyncCatch
    public async updateUser(
        @Path() id: string,
        @Body() userData: UserUpdateRequest
    ): Promise<UserResponse> {
        const user = await User.findByPk(id);
        if (!user) {
            return ServiceResponse.failure('user not found', null, 404);
        }
        await user.update(userData);
        return ServiceResponse.success('user updated successfully', user.toJSON() as IUserAttributes);
    }
    //active user
    @Security('jwt', ['user:read'])
    @Get('/{id}/equipment')
    @asyncCatch
    public async getUserEquipment(@Path() id: string): Promise<any> {
        const user = await User.findByPk(id);
        if (!user) return ServiceResponse.failure('User not found', null, 404);
        const equipments = await Equipments.findAll({ where: { assignedTo: id } });
        return ServiceResponse.success('User equipment retrieved successfully', equipments.map(e => e.toJSON()));
    }

    @Security('jwt', ['user:update'])
    @Put('/{id}/activate')
    @asyncCatch
    public async activateUser(
        @Path() id: string
    ): Promise<UserResponse> {
        const user = await User.findByPk(id);
        if (!user) {
            return ServiceResponse.failure('User not found', null, 404);
        }
        await user.update({ status: 'active' });
        return ServiceResponse.success('User activated successfully', user.toJSON() as IUserAttributes);
    }

    // controller for suspend user
    @Security('jwt', ['user:update'])
    @Put('/{id}/suspend')
    @asyncCatch
    public async suspendUser(
        @Path() id: string
    ): Promise<UserResponse> {
        const user = await User.findByPk(id);
        if (!user) {
            return ServiceResponse.failure('user not found', null, 404);
        }
        await user.update({ status: 'suspended' });
        return ServiceResponse.success('user suspended successfully', user.toJSON() as IUserAttributes);
    }

    @Security('jwt', ['user:delete'])
    @Delete('/{id}/delete')
    @asyncCatch
    public async deleteUser(
        @Path() id: string
    ): Promise<UserResponse> {
        console.log('Delete endpoint hit with ID:', id);
        const user = await User.findByPk(id);
        if (!user) {
            return ServiceResponse.failure('user not found', null, 404);
        }
        await user.destroy();
        return ServiceResponse.success('user deleted successfully', null);
    }

}