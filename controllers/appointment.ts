import { ServiceResponse } from '../utils/serviceResponse';
import { asyncCatch } from '../middlewares/errorHandler';
import { Op } from 'sequelize';
import { Body, Controller, Delete, Get, Path, Post, Put, Query, Route, Security, Tags } from 'tsoa';
import { AppointmentResponse } from '../types/responses';
import Appointment from '../models/appointment';
import User from '../models/user';
import db from '../models';

const userAttributes = ['fullName', 'email', 'department', 'phoneNumber'];
const userInclude = [{ model: User, as: 'user', attributes: userAttributes }];

export interface AppointmentCreateAttributes {
    userId: string;
    purpose: string;
    host: string;
    status: 'pending'|'confirmed'|'canceled'|'onhold'|'completed';
    department: string;
    company:string;
    appointmentDate: string;
    appointmentTime: string;
    timeDuration: string;
    appointmentLocation: string;
    note:string
}

export interface UpdateAppointmentAttributes {
    userId?: string;
    purpose?: string;
    status?: 'pending'|'confirmed'|'canceled'|'onhold'|'completed'
    host?: string;
    department?: string;
    company?:string;
    cancelReason?:string;
    reasonToReschedule?:string;
    appointmentDate?: string;
    appointmentTime?: string;
    timeDuration?: string;
    appointmentLocation?: string;
    note?:string
}

@Route('api/appointments')
@Tags('Appointments')
export class appointmentController extends Controller {
    @Security('jwt', ['appointment:read'])
    @Get('/')
    @asyncCatch
    public async getAllAppointments(): Promise<ServiceResponse<AppointmentResponse[]>> {
        const appointments = await Appointment.findAll({ include: userInclude, order: [['createdAt', 'DESC']] });
        return ServiceResponse.success('Appointments retrieved successfully', appointments as unknown as AppointmentResponse[], 200);
    }

    // Get appointments by user ID
    @Security('jwt', ['appointment:read'])
    @Get('/user/:userId')
    @asyncCatch
    public async getAppointmentsByUserId(@Path() userId: string): Promise<ServiceResponse<AppointmentResponse[]>> {
        const appointments = await Appointment.findAll({
            where: { userId },
            include: userInclude,
            order: [['createdAt', 'DESC']]
        });
        return ServiceResponse.success('Appointments retrieved successfully', appointments as unknown as AppointmentResponse[], 200);
    }

    //Get appointments by date
    @Security('jwt', ['appointment:read'])
    @Get('/date/:date')
    @asyncCatch
    public async getAppointmentsByDate(@Path() date: string): Promise<ServiceResponse<AppointmentResponse[]>> {
        const appointments = await Appointment.findAll({
            where: { appointmentDate: date },
            include: userInclude,
            order: [['createdAt', 'DESC']]
        });
        return ServiceResponse.success('Appointments retrieved successfully', appointments as unknown as AppointmentResponse[], 200);
    }

    //get appointments by department
    @Security('jwt', ['appointment:read'])
    @Get('/department/:department')
    @asyncCatch
    public async getAppointmentsByDepartment(@Path() department: string): Promise<ServiceResponse<AppointmentResponse[]>> {
        const appointments = await Appointment.findAll({
            where: { department: { [Op.iLike]: `%${department}%` } },
            include: userInclude,
            order: [['createdAt', 'DESC']]
        });
        return ServiceResponse.success('Appointments retrieved successfully', appointments as unknown as AppointmentResponse[], 200);
    }

    //Get appointments by host
    @Security('jwt', ['appointment:read'])
    @Get('/host/:host')
    @asyncCatch
    public async getAppointmentsByHost(@Path() host: string): Promise<ServiceResponse<AppointmentResponse[]>> {
        const appointments = await Appointment.findAll({
            where: { host: { [Op.iLike]: `%${host}%` } },
            include: userInclude,
            order: [['createdAt', 'DESC']]
        });
        return ServiceResponse.success('Appointments retrieved successfully', appointments as unknown as AppointmentResponse[], 200);
    }

    //get appointments by time
    @Security('jwt', ['appointment:read'])
    @Get('/time/:time')
    @asyncCatch
    public async getAppointmentsByTime(@Path() time: string): Promise<ServiceResponse<AppointmentResponse[]>> {
        const appointments = await Appointment.findAll({
            where: { appointmentTime: time },
            include: userInclude,
            order: [['createdAt', 'DESC']]
        });
        return ServiceResponse.success('Appointments retrieved successfully', appointments as unknown as AppointmentResponse[], 200);
    }

    //Get appointment by Location
    @Security('jwt', ['appointment:read'])
    @Get('/location/:location')
    @asyncCatch
    public async getAppointmentsByLocation(@Path() location: string): Promise<ServiceResponse<AppointmentResponse[]>> {
        const appointments = await Appointment.findAll({
            where: { appointmentLocation: { [Op.iLike]: `%${location}%` } },
            include: userInclude,
            order: [['createdAt', 'DESC']]
        });
        return ServiceResponse.success('Appointments retrieved successfully', appointments as unknown as AppointmentResponse[], 200);
    }

    // Get appointment for visitor (for check-in)
    @Security('jwt', ['appointment:read'])
    @Get('/for-visitor')
    @asyncCatch
    public async getAppointmentForVisitor(
        @Query() visitorId?: string,
        @Query() idNumber?: string,
        @Query() fullName?: string,
        @Query() phone?: string,
        @Query() department?: string
    ): Promise<ServiceResponse<any>> {
        let appointment: any;
        const where: any = {};

        if (visitorId) {
            where.userId = visitorId;
        } else if (idNumber) {
            where.id = idNumber;
        } else if (fullName) {
            where.host = { [Op.like]: `%${fullName}%` };
        } else if (phone) {
            const user = await db.User.findOne({ where: { phoneNumber: phone } });
            if (user) {
                where.userId = user.id;
            }
        }

        if (department) {
            where.department = { [Op.like]: `%${department}%` };
        }

        appointment = await Appointment.findOne({
            where,
            include: userInclude,
            order: [['createdAt', 'DESC']],
        });

        if (!appointment) {
            return ServiceResponse.failure('Appointment not found', null, 404);
        }

        const appt = appointment.toJSON() as any;
        return ServiceResponse.success('Appointment retrieved successfully', {
            visitorName: appt.user?.fullName,
            hostName: appt.host,
            hostStatus: 'in',
            hostAvailability: 'available',
            appointmentTime: appt.appointmentTime,
            purpose: appt.purpose,
            department: appt.department,
        });
    }

    //Get appointment by its Id
    @Security('jwt', ['appointment:read'])
    @Get('/:id')
    @asyncCatch
    public async getAppointmentById(@Path() id: string): Promise<ServiceResponse<AppointmentResponse | null>> {
        const appointment = await Appointment.findByPk(id, { include: userInclude });
        if (!appointment) {
            return ServiceResponse.failure('Appointment not found', null, 404);
        }
        return ServiceResponse.success('Appointment retrieved successfully', appointment as unknown as AppointmentResponse, 200);
    }

 // create appointment
    @Security('jwt', ['appointment:create'])
    @Post('/')
    @asyncCatch
    public async createAppointment(@Body() data: AppointmentCreateAttributes): Promise<ServiceResponse<AppointmentResponse | null>> {
        const appointment = await Appointment.create({
            ...data,
            status: data.status ?? 'pending'
        });
        return ServiceResponse.success('Appointment created successfully', appointment as unknown as AppointmentResponse, 201);
    }

    //update appointment 
    @Security('jwt',['appointment:update'])
    @Put('/{id}')
    @asyncCatch
    public async updateAppointment(
        @Path() id: string,
        @Body() data: UpdateAppointmentAttributes
    ): Promise<ServiceResponse<AppointmentResponse | null>> {
        const appointment = await Appointment.findByPk(id);
        if (!appointment) {
            return ServiceResponse.failure('Appointment not found', null, 404);
        }
        await appointment.update(data);
        return ServiceResponse.success('Appointment updated successfully', appointment as unknown as AppointmentResponse, 200);
    }

    //confim appointment
    @Security('jwt', ['appointment:update'])
    @Put('/confirm/{id}')
    @asyncCatch
    public async confirmAppointment(
        @Path() id: string
    ): Promise<ServiceResponse<AppointmentResponse | null>> {
        const appointment = await Appointment.findByPk(id);
        if (!appointment) {
            return ServiceResponse.failure('Appointment not found', null, 404);
        }
        await appointment.update({ status: 'confirmed' });
        return ServiceResponse.success('Appointment confirmed successfully', appointment as unknown as AppointmentResponse, 200);
    }

    //cancel appointment
    @Security('jwt', ['appointment:update'])
    @Put('/cancel/{id}')
    @asyncCatch
    public async cancelAppointment(
        @Path() id: string, @Body() body: { cancelReason: string }
    ): Promise<ServiceResponse<AppointmentResponse | null>> {
        const appointment = await Appointment.findByPk(id);
        if (!appointment) {
            return ServiceResponse.failure('Appointment not found', null, 404);
        }
        await appointment.update({ status: 'canceled',cancelReason:body.cancelReason});
        return ServiceResponse.success('Appointment canceled successfully', appointment as unknown as AppointmentResponse, 200);
    }

    //onhold appointment
    @Security('jwt', ['appointment:update'])
    @Put('/onhold/{id}')
    @asyncCatch
    public async onholdAppointment(
        @Path() id: string
    ): Promise<ServiceResponse<AppointmentResponse | null>> {
        const appointment = await Appointment.findByPk(id);
        if (!appointment) {
            return ServiceResponse.failure('Appointment not found', null, 404);
        }
        await appointment.update({ status: 'onhold' });
        return ServiceResponse.success('Appointment put on hold successfully', appointment as unknown as AppointmentResponse, 200);
    }

    // Reschedule appointment
    @Security('jwt',['appointment:update'])
    @Put('/reschedule/{id}')
    @asyncCatch
    public async rescheduleAppointment(@Path() id:string,@Body() data: { appointmentDate: string; appointmentTime: string; timeDuration: string;appointmentLocation:string; reasonToReschedule:string }
    ):Promise<ServiceResponse<AppointmentResponse|null>>{
        const appointment = await Appointment.findByPk(id);
        if (!appointment) {
            return ServiceResponse.failure('Appointment not found', null, 404);
        }
        await appointment.update({ appointmentDate:data.appointmentDate, appointmentTime:data.appointmentTime,timeDuration:data.timeDuration,appointmentLocation:data.appointmentLocation,reasonToReschedule:data.reasonToReschedule  });
        return ServiceResponse.success('Appointment rescheduled successfully', appointment as unknown as AppointmentResponse, 200);
    }
    //complete appointment
    @Security('jwt', ['appointment:update'])
    @Put('/complete/{id}')
    @asyncCatch
    public async completeAppointment(
        @Path() id: string
    ): Promise<ServiceResponse<AppointmentResponse | null>> {
        const appointment = await Appointment.findByPk(id);
        if (!appointment) {
            return ServiceResponse.failure('Appointment not found', null, 404);
        }
        await appointment.update({ status: 'completed' });
        return ServiceResponse.success('Appointment completed successfully', appointment as unknown as AppointmentResponse, 200);
    }

    //delete appointment
    @Security('jwt', ['appointment:delete'])
    @Delete('/{id}')
    @asyncCatch
    public async deleteAppointment(
        @Path() id: string
    ): Promise<ServiceResponse<null>> {
        const appointment = await Appointment.findByPk(id);
        if (!appointment) {
            return ServiceResponse.failure('Appointment not found', null, 404);
        }
        await appointment.destroy();
        return ServiceResponse.success('Appointment deleted successfully', null, 200);
    }
}
