import { ServiceResponse } from "../utils/serviceResponse";
import { asyncCatch } from "../middlewares/errorHandler";
import { Body, Controller, Delete, Get, Patch, Path, Post, Put, Response, Route, Security, Tags } from "tsoa";
import Equipments from "../models/equipment";
import { EquipmentResponse } from "../types/responses";

export class equipmentCreateAttributes {
    declare name: string;
    declare description?: string | null;
    declare serialNumber?: string;
    declare quantity?: number;
    declare status?: string;
    declare assignedTo?: string | null;
}

export class equipmentUpdateAttributes {
    declare name?: string;
    declare description?: string | null;
    declare serialNumber?: string | null;
    declare quantity?: number;
    declare status?: string;
    declare assignedTo?: string | null;
}

@Route('api/equipments')
@Tags('Equipments')
export class equipmentController extends Controller {

    @Security('jwt', ['equipment:read'])
    @Get('/')
    @asyncCatch
    public async getAllEquipments(): Promise<ServiceResponse<EquipmentResponse[] | null>> {
        const equipments = await Equipments.findAll({ order: [['name', 'ASC']] });
        return ServiceResponse.success('Equipments retrieved successfully', equipments.map((e: Equipments) => e.toJSON() as EquipmentResponse));
    }

    @Security('jwt', ['equipment:read'])
    @Get('/{equipmentId}')
    @asyncCatch
    @Response<ServiceResponse<EquipmentResponse | null>>(404, 'equipment not found')
    public async getEquipmentById(@Path() equipmentId: string): Promise<ServiceResponse<EquipmentResponse | null>> {
        const found = await Equipments.findByPk(equipmentId);
        if (!found) {
            return ServiceResponse.failure('equipment not found', null, 404);
        }
        return ServiceResponse.success('equipment retrieved successfully', found.toJSON() as EquipmentResponse);
    }

    @Security('jwt', ['equipment:create'])
    @Post('/')
    @asyncCatch
    @Response<ServiceResponse<EquipmentResponse>>(409, 'equipment already exists')
    public async createEquipment(@Body() data: equipmentCreateAttributes): Promise<ServiceResponse<EquipmentResponse | null>> {
        const existing = await Equipments.findOne({ where: { name: data.name } });
        if (existing) {
            return ServiceResponse.failure('equipment already exists', null, 409);
        }
        const created = await Equipments.create({ ...data, serialNumber: data.serialNumber ?? null });
        return ServiceResponse.success('equipment created successfully', created.toJSON() as EquipmentResponse, 201);
    }

    @Security('jwt', ['equipment:update'])
    @Put('/{equipmentId}')
    @asyncCatch
    @Response<ServiceResponse<EquipmentResponse | null>>(404, 'equipment not found')
    public async updateEquipment(
        @Path() equipmentId: string,
        @Body() data: equipmentUpdateAttributes
    ): Promise<ServiceResponse<EquipmentResponse | null>> {
        const found = await Equipments.findByPk(equipmentId);
        if (!found) {
            return ServiceResponse.failure('equipment not found', null, 404);
        }
        await found.update(data);
        return ServiceResponse.success('equipment updated successfully', found.toJSON() as EquipmentResponse);
    }

    @Security('jwt', ['equipment:update'])
    @Put('/{equipmentId}/assign')
    @asyncCatch
    @Response<ServiceResponse<null>>(404, 'equipment not found')
    public async assignEquipment(
        @Path() equipmentId: string,
        @Body() data: { userId: string }
    ): Promise<ServiceResponse<EquipmentResponse | null>> {
        const found = await Equipments.findByPk(equipmentId);
        if (!found) {
            return ServiceResponse.failure('equipment not found', null, 404);
        }
        await found.update({ assignedTo: data.userId, status: 'inuse' });
        return ServiceResponse.success('equipment assigned successfully', found.toJSON() as EquipmentResponse);
    }

    @Security('jwt', ['equipment:update'])
    @Put('/{equipmentId}/return/{userId}')
    @asyncCatch
    @Response<ServiceResponse<EquipmentResponse | null>>(404, 'equipment not found')
    public async returnEquipment(
        @Path() equipmentId: string,
        @Path() userId: string
    ): Promise<ServiceResponse<EquipmentResponse | null>> {
        const found = await Equipments.findByPk(equipmentId);
        if (!found) {
            return ServiceResponse.failure('equipment not found', null, 404);
        }
        if (found.assignedTo !== userId) {
            return ServiceResponse.failure('equipment is not assigned to this user', null, 400);
        }
        await found.update({ assignedTo: null, status: 'available' });
        return ServiceResponse.success('equipment returned successfully', found.toJSON() as EquipmentResponse);
    }

    @Security('jwt', ['equipment:delete'])
    @Delete('/{equipmentId}')
    @asyncCatch
    @Response<ServiceResponse<EquipmentResponse | null>>(404, 'equipment not found')
    public async deleteEquipment(@Path() equipmentId: string): Promise<ServiceResponse<null>> {
        const found = await Equipments.findByPk(equipmentId);
        if (!found) {
            return ServiceResponse.failure('equipment not found', null, 404);
        }
        await found.destroy();
        return ServiceResponse.success('equipment deleted successfully', null);
    }
}
