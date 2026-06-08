import { Body, Controller, Delete, Get, Path, Post, Put, Response, Route, Security, Tags } from "tsoa";
import { asyncCatch } from "../middlewares/errorHandler";
import { CardResponse } from "../types/responses";
import Card from "../models/card";
import { ServiceResponse } from "../utils/serviceResponse";

export interface CardListResponse {
    success: boolean;
    message: string;
    result: CardResponse[] | null;
    statusCode: number;
}

export interface CardSingleResponse {
    success: boolean;
    message: string;
    result: CardResponse | null;
    statusCode: number;
}

export interface CreateCardRequest {
    cardNumber: string;
    location?: string;
    description?:string;
    branch?: string;
    status: 'assigned' | 'available'|'maintenance';
    doneBy?: string;
    assignedTo?: string;
    assignedAt?: Date;
    lastUsed?: Date;
}

export interface UpdateCardRequest {
    cardNumber?: string;
    description?:string;
    location?: string;
    branch?: string;
    status?: 'assigned' | 'available'|'maintenance';
    doneBy?: string;
    assignedTo?: string;
    assignedAt?: Date;
    lastUsed?: Date;
}

@Route('api/cards')
@Tags('Cards')
export class CardController extends Controller{
    @Security('jwt',['card:read'])
    @Get('/')
    @asyncCatch
    public async getAllCards(): Promise<CardListResponse> {
        const cards = await Card.findAll({ order: [['createdAt', 'DESC']] });
        return ServiceResponse.success('Cards retrieved successfully', cards.map(c => c.toJSON()));
    }

    @Security('jwt', ['card:read'])
    @Get('/available')
    @asyncCatch
    public async getAvailableCards(): Promise<CardListResponse> {
        const cards = await Card.findAll({ where: { status: 'available' }, order: [['createdAt', 'DESC']] });
        return ServiceResponse.success('Available cards retrieved successfully', cards.map(c => c.toJSON()));
    }

    @Security('jwt',['card:create'])
    @Post('/')
    @asyncCatch
    public async createCard(@Body() body: CreateCardRequest): Promise<CardSingleResponse> {
        const card = await Card.create(body);
        return ServiceResponse.success('Card created successfully', card.toJSON(), 201);
    }

    @Security('jwt', ['card:read'])
    @Get('/{id}')
    @asyncCatch
    @Response<CardSingleResponse>(404, 'Card not found')
    public async getCard(@Path() id: string): Promise<CardSingleResponse> {
        const card = await Card.findByPk(id);
        if (!card) return ServiceResponse.failure('Card not found', null, 404);
        return ServiceResponse.success('Card retrieved successfully', card.toJSON());
    }

    @Security('jwt', ['card:assign'])
    @Put('/{id}/assign')
    @asyncCatch
    @Response<CardSingleResponse>(404, 'Card not found')
    public async assignCard(@Path() id: string, @Body() body: { userId: string }): Promise<CardSingleResponse> {
        const card = await Card.findByPk(id);
        if (!card) return ServiceResponse.failure('Card not found', null, 404);
        await card.update({ assignedTo: body.userId, status: 'assigned', assignedAt: new Date() });
        return ServiceResponse.success('Card assigned successfully', card.toJSON());
    }

    @Security('jwt', ['card:update'])
    @Put('/{id}/return')
    @asyncCatch
    @Response<CardSingleResponse>(404, 'Card not found')
    public async returnCard(@Path() id: string, @Body() body: { userId: string }): Promise<CardSingleResponse> {
        const card = await Card.findByPk(id);
        if (!card) return ServiceResponse.failure('Card not found', null, 404);
        if (card.assignedTo !== body.userId) return ServiceResponse.failure('Card is not assigned to this user', null, 400);
        await card.update({ assignedTo: undefined, status: 'available', assignedAt: undefined });
        return ServiceResponse.success('Card returned successfully', card.toJSON());
    }

    @Security('jwt', ['card:update'])
    @Put('/{id}')
    @asyncCatch
    @Response<CardSingleResponse>(404, 'Card not found')
    public async updateCard(@Path() id: string, @Body() body: UpdateCardRequest): Promise<CardSingleResponse> {
        const card = await Card.findByPk(id);
        if (!card) return ServiceResponse.failure('Card not found', null, 404);
        await card.update(body);
        return ServiceResponse.success('Card updated successfully', card.toJSON());
    }

    @Security('jwt', ['card:delete'])
    @Delete('/{id}')
    @asyncCatch
    @Response<CardSingleResponse>(404, 'Card not found')
    public async deleteCard(@Path() id: string): Promise<CardSingleResponse> {
        const card = await Card.findByPk(id);
        if (!card) return ServiceResponse.failure('Card not found', null, 404);
        await card.destroy();
        return ServiceResponse.success('Card deleted successfully', null);
    }
}