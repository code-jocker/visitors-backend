import { ServiceResponse } from "../utils/serviceResponse";
import { asyncCatch } from "../middlewares/errorHandler";
import { Body, Controller, Response, Delete, Get, Path, Post, Route, Security, Tags, Put, Patch } from "tsoa";
import Handover from "../models/handover";
import { HandoverResponse } from "../types/responses";

export class HandoverCreateAttributes {
    declare outgoingUser: string;
    declare incomingUser: string;
    declare equipmentId?: string | null;
    declare handOverDate: Date;
    declare handOverTime: string;
    declare handOverDescription?: string | null;
    declare handOverItems: string;
    declare handOverShift: string;
    declare status: string;
}

export class HandoverUpdateAttributes {
    declare outgoingUser?: string;
    declare incomingUser?: string;
    declare equipmentId?: string | null;
    declare handOverDate?: Date;
    declare handOverTime?: string;
    declare handOverDescription?: string | null;
    declare handOverItems?: string;
    declare handOverShift?: string;
    declare status?: string;
}

@Route('api/handover')
@Tags('HandOver')
export class HandoverController extends Controller {

    @Security('jwt', ['handover:read'])
    @Get('/')
    @asyncCatch
    @Response<ServiceResponse<HandoverResponse>>(404, 'Handover not found')
    public async getAllHandovers(): Promise<ServiceResponse<HandoverResponse[] | null>> {
        const handovers = await Handover.findAll({ order: [['handOverDate', 'ASC']] });
        return ServiceResponse.success('Handovers retrieved successfully', handovers.map((h: Handover) => h.toJSON() as HandoverResponse));
    }

    @Security('jwt', ['handover:read'])
    @Get('/{handoverId}')
    @asyncCatch
    @Response<ServiceResponse<HandoverResponse>>(404, 'Handover not found')
    public async getHandoverById(@Path() handoverId: string): Promise<ServiceResponse<HandoverResponse | null>> {
        const handover = await Handover.findByPk(handoverId);
        if (!handover) {
            return ServiceResponse.failure('Handover not found', null, 404);
        }
        return ServiceResponse.success('Handover retrieved successfully', handover.toJSON() as HandoverResponse, 200);
    }

    @Security('jwt', ['handover:create'])
    @Post('/')
    @asyncCatch
    @Response<ServiceResponse<null>>(409, 'Handover already exists')
    public async createHandover(@Body() data: HandoverCreateAttributes): Promise<ServiceResponse<HandoverResponse | null>> {
        const existingHandover = await Handover.findOne({ where: { outgoingUser: data.outgoingUser, handOverDate: data.handOverDate, handOverShift: data.handOverShift } });
        if (existingHandover) {
            return ServiceResponse.failure('Handover already exists', null, 409);
        }
        const createdhandover = await Handover.create(data);
        return ServiceResponse.success('Handover created successfully', createdhandover.toJSON() as HandoverResponse, 201);
    }

    @Security('jwt', ['handover:update'])
    @Put('/{handoverId}')
    @asyncCatch
    @Response<ServiceResponse<null>>(404, 'Handover not found')
    public async updateHandover(
        @Path() handoverId: string,
        @Body() data: HandoverUpdateAttributes
    ): Promise<ServiceResponse<HandoverResponse | null>> {
        const handover = await Handover.findByPk(handoverId);
        if (!handover) {
            return ServiceResponse.failure('Handover not found', null, 404);
        }
        await handover.update(data);
        return ServiceResponse.success('Handover updated successfully', handover.toJSON() as HandoverResponse);
    }

    //confirm handover
    @Security('jwt', ['handover:update'])
    @Put('/{handoverId}/confirm')
    @asyncCatch
    @Response<ServiceResponse<null>>(404, 'Handover not found')
    public async confirmHandleOver(@Path() handoverId: string): Promise<ServiceResponse<HandoverResponse | null>> {
        const findHandover = await Handover.findByPk(handoverId);
        if (!findHandover) return ServiceResponse.failure('Handover not found', null, 404);
        const result = await findHandover.update({ status: 'pending' });
        return ServiceResponse.success('Handover confirmed successfully', result.toJSON() as HandoverResponse, 200);
    }

    //complete
    @Security('jwt', ['handover:update'])
    @Put('/{handoverId}/complete')
    @asyncCatch
    @Response<ServiceResponse<null>>(404, 'Handover not found')
    public async completeHandleOver(@Path() handoverId: string): Promise<ServiceResponse<HandoverResponse | null>> {
        const findHandover = await Handover.findByPk(handoverId);
        if (!findHandover) return ServiceResponse.failure('Handover not found', null, 404);
        const result = await findHandover.update({ status: 'completed' });
        return ServiceResponse.success('Handover completed successfully', result.toJSON() as HandoverResponse, 200);
    }

    //cancel
    @Security('jwt', ['handover:update'])
    @Put('/{handoverId}/cancel')
    @asyncCatch
    @Response<ServiceResponse<null>>(404, 'Handover not found')
    public async cancelHandleOver(@Path() handoverId: string): Promise<ServiceResponse<HandoverResponse | null>> {
        const findHandover = await Handover.findByPk(handoverId);
        if (!findHandover) return ServiceResponse.failure('Handover not found', null, 404);
        const result = await findHandover.update({ status: 'cancelled' });
        return ServiceResponse.success('Handover cancelled successfully', result.toJSON() as HandoverResponse, 200);
    }

    @Security('jwt', ['handover:delete'])
    @Delete('/{handoverId}')
    @asyncCatch
    @Response<ServiceResponse<HandoverResponse | null>>(400, 'Bad Request')
    @Response<ServiceResponse<HandoverResponse | null>>(404, 'Handover not found')
    public async deleteHandover(
        @Path() handoverId: string
    ): Promise<ServiceResponse<HandoverResponse | null>> {
        const handover = await Handover.findByPk(handoverId);
        if (!handover) {
            return ServiceResponse.failure('Handover not found', null, 404);
        }
        await handover.destroy();
        return ServiceResponse.success('Handover deleted successfully', null);
    }
}