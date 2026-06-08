import { ServiceResponse } from '../utils/serviceResponse';
import { Op } from 'sequelize';
import { Body, Controller, Delete, Get, Path, Put, Route, Security, Tags } from 'tsoa';
import Attendance from '../models/attendance';
import User from '../models/user';

export interface AttendanceResponse {
    id: string;
    userId: string;
    checkIn: Date;
    checkOut?: Date;
    hoster?: string;
    badge?: string;
    date: string;
    status: string;
    note?: string;
    user?: any;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface AttendanceListResponse {
    success: boolean;
    message: string;
    result: AttendanceResponse[] | null;
    statusCode: number;
}

export interface AttendanceSingleResponse {
    success: boolean;
    message: string;
    result: AttendanceResponse | null;
    statusCode: number;
}

export interface CheckOutRequest {
    note?: string;
}

export interface UpdateAttendanceRequest {
    status?: 'present' | 'late' | 'left_early' | 'absent';
    note?: string;
    checkOut?: Date;
    checkIn?:Date
}

@Route('api/attendance')
@Tags('Attendance')
export class AttendanceController extends Controller {

    // Get all attendance records with user details
    @Security('jwt', ['attendance:read'])
    @Get('/')
    public async getAllAttendance(): Promise<AttendanceListResponse> {
        const records = await Attendance.findAll({
            include: [{ model: User, as: 'user'}],
            order: [['createdAt', 'DESC']]
        });
        return ServiceResponse.success('Attendance records retrieved successfully', records.map(r => r.toJSON()));
    }

    // Get single attendance record by id
    @Security('jwt', ['attendance:read'])
    @Get('/{id}')
    public async getAttendanceById(@Path() id: string): Promise<AttendanceSingleResponse> {
        const record = await Attendance.findByPk(id, {
            include: [{ model: User, as: 'user', attributes: ['fullName', 'email', 'department', 'scannedId', 'category'] }]
        });
        if (!record) return ServiceResponse.failure('Attendance record not found', null, 404);
        return ServiceResponse.success('Attendance record retrieved successfully', record.toJSON());
    }

    // Get attendance records by userId
    @Security('jwt', ['attendance:read'])
    @Get('/by-user/{userId}')
    public async getAttendanceByUserId(@Path() userId: string): Promise<AttendanceListResponse> {
        const records = await Attendance.findAll({
            where: { userId },
            include: [{ model: User, as: 'user', attributes: ['fullName', 'email', 'department', 'nationalId', 'category'] }],
            order: [['date', 'DESC']]
        });
        return ServiceResponse.success('Attendance records retrieved successfully', records.map(r => r.toJSON()));
    }

    // Get attendance records by date
    @Security('jwt', ['attendance:read'])
    @Get('/by-date/{date}')
    public async getAttendanceByDate(@Path() date: string): Promise<AttendanceListResponse> {
        const records = await Attendance.findAll({
            where: { date },
            include: [{ model: User, as: 'user', attributes: ['fullName', 'email', 'department', 'nationalId', 'category'] }],
            order: [['checkIn', 'ASC']]
        });
        return ServiceResponse.success('Attendance records retrieved successfully', records.map(r => r.toJSON()));
    }

    // Get attendance records by date range (for reports)
    @Security('jwt', ['attendance:read'])
    @Get('/report/range/{startDate}/{endDate}')
    public async getAttendanceReport(
        @Path() startDate: string,
        @Path() endDate: string
    ): Promise<AttendanceListResponse> {
        const records = await Attendance.findAll({
            where: {
                date: { [Op.between]: [startDate, endDate] }
            },
            include: [{ model: User, as: 'user', attributes: ['fullName', 'email', 'department', 'nationalId', 'category'] }],
            order: [['date', 'ASC'], ['checkIn', 'ASC']]
        });
        return ServiceResponse.success('Attendance report retrieved successfully', records.map(r => r.toJSON()));
    }

    // Get attendance report by userId and date range
    @Security('jwt', ['attendance:read'])
    @Get('/report/user/{userId}/{startDate}/{endDate}')
    public async getUserAttendanceReport(
        @Path() userId: string,
        @Path() startDate: string,
        @Path() endDate: string
    ): Promise<AttendanceListResponse> {
        const records = await Attendance.findAll({
            where: {
                userId,
                date: { [Op.between]: [startDate, endDate] }
            },
            include: [{ model: User, as: 'user', attributes: ['fullName', 'email', 'department', 'nationalId', 'category'] }],
            order: [['date', 'ASC']]
        });
        return ServiceResponse.success('User attendance report retrieved successfully', records.map(r => r.toJSON()));
    }

    // Checkout - record when user leaves
    @Security('jwt', ['attendance:update'])
    @Put('/{id}/checkout')
    public async checkOut(
        @Path() id: string,
        @Body() data: CheckOutRequest
    ): Promise<AttendanceSingleResponse> {
        const record = await Attendance.findByPk(id);
        if (!record) return ServiceResponse.failure('Attendance record not found', null, 404);
        if (record.checkOut) return ServiceResponse.failure('User already checked out', null, 400);
        await record.update({ checkOut: new Date(), ...data });
        return ServiceResponse.success('Checkout recorded successfully', record.toJSON());
    }

    // Update attendance record
    @Security('jwt', ['attendance:update'])
    @Put('/{id}')
    public async updateAttendance(
        @Path() id: string,
        @Body() data: UpdateAttendanceRequest
    ): Promise<AttendanceSingleResponse> {
        const record = await Attendance.findByPk(id);
        if (!record) return ServiceResponse.failure('Attendance record not found', null, 404);
        await record.update(data);
        return ServiceResponse.success('Attendance record updated successfully', record.toJSON());
    }

    // Delete attendance record
    @Security('jwt', ['attendance:delete'])
    @Delete('/{id}')
    public async deleteAttendance(@Path() id: string): Promise<AttendanceSingleResponse> {
        const record = await Attendance.findByPk(id);
        if (!record) return ServiceResponse.failure('Attendance record not found', null, 404);
        await record.destroy();
        return ServiceResponse.success('Attendance record deleted successfully', null);
    }
}
