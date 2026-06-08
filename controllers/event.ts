import { ServiceResponse } from "../utils/serviceResponse";
import { asyncCatch } from "../middlewares/errorHandler";
import { Body, Controller, Delete, Get, Patch, Path, Post, Put, Response, Route, Security, Tags } from "tsoa";
import { EventResponse } from "../types/responses";
import AttendEvent from "../models/event";

export class EventCreateRequest {
    declare title: string;
    declare description?: string | null;
    declare hoster?: string;
    declare eventDate?: string;
    declare eventTime?: string;
    declare expectedAttendees?: string;
    declare timeDuration?: string;
    declare eventLocation?: string;
    declare status?: string;
}

export class EventUpdateRequest {
    declare title?: string;
    declare description?: string | null;
    declare eventDate?: string;
    declare hoster?: string;
    declare eventTime?: string;
    declare expectedAttendees?: string;
    declare timeDuration?: string;
    declare eventLocation?: string;
    declare status?: string;
}

@Route('api/events')
@Tags('Events')
export class EventController extends Controller {
    @Security('jwt', ['event:create'])
    @Post()
    @asyncCatch
    @Response<ServiceResponse<EventResponse | null>>(400, 'Bad Request')
    public async createEvent(@Body() data: EventCreateRequest
    ): Promise<ServiceResponse<EventResponse | null>> {
        const Eventexist = await AttendEvent.findOne({ where: { title: data.title } })
        if (Eventexist) {
            return ServiceResponse.failure('Event already exist', null, 409)
        } else{
        const event= await AttendEvent.create(data);
        return ServiceResponse.success('Event created successfully', event, 201)
    }}

    @Security('jwt', ['event:read'])
    @Get()
    @asyncCatch
    @Response<ServiceResponse<EventResponse | null>>(400, 'Bad Request')
    public async getAllEvents(): Promise<ServiceResponse<EventResponse[] | null>> {
        const events = await AttendEvent.findAll({order:[['createdAt','DESC']]})
        if (!events) return ServiceResponse.failure('Events not found', events, 404)
        return ServiceResponse.success('Events retrieved successfully', [], 200)
    }

    @Security('jwt', ['event:read'])
    @Get('{eventId}')
    @asyncCatch
    @Response<ServiceResponse<EventResponse | null>>(400, 'Bad Request')
    @Response<ServiceResponse<EventResponse | null>>(404, 'Event not found')
    public async getEventById(@Path() eventId: string
    ): Promise<ServiceResponse<EventResponse | null>> {
        const event = await AttendEvent.findByPk(eventId)
        if (!event) return ServiceResponse.failure('Event not found', null, 404)
        return ServiceResponse.success('Event retrieved successfully', event, 200)
    }

    @Security('jwt', ['event:update'])
    @Put('{eventId}')
    @asyncCatch
    @Response<ServiceResponse<EventResponse | null>>(400, 'Bad Request')
    @Response<ServiceResponse<EventResponse | null>>(404, 'Event not found')
    public async updateEvent(@Path() eventId: string,@Body() data: EventUpdateRequest
    ): Promise<ServiceResponse<EventResponse | null>> {
        const event = await AttendEvent.findByPk(eventId)
        if (!event) return ServiceResponse.failure('Event not found', null, 404)
             await event.update(data)
        return ServiceResponse.success('Event updated successfully', event, 200)
    }

    // we need to confirm
    @Security('jwt', ['event:update'])
    @Put('{eventId}/confirm')
    @asyncCatch
    @Response<ServiceResponse<EventResponse | null>>(400, 'Bad Request')
    @Response<ServiceResponse<EventResponse | null>>(404, 'Event not found')
    public async confirmEvent(@Path() eventId: string
    ): Promise<ServiceResponse<EventResponse | null>> {
        const event = await AttendEvent.findByPk(eventId)
        if (!event) return ServiceResponse.failure('Event not found', null, 404)
        await event.update({ status:'confirmed' })
        return ServiceResponse.success('Event confirmed successfully', event, 200)
    }
    // we need to cancel
    @Security('jwt', ['event:update'])
    @Put('{eventId}/cancel')
    @asyncCatch
    @Response<ServiceResponse<EventResponse | null>>(400, 'Bad Request')
    public async cancelEvent(@Path() eventId: string): Promise<ServiceResponse<EventResponse|null>>{
        const event = await AttendEvent.findByPk(eventId)
        if(!event) return ServiceResponse.failure('Event not found',null,404)
        await event.update({status:'cancelled'})
        return ServiceResponse.success('Event cancelled successfully',null,200)

    }
    // we need complete event
    @Security('jwt', ['event:update'])
    @Put('{eventId}/complete')
    @asyncCatch
    @Response<ServiceResponse<EventResponse | null>>(400, 'Bad Request')
    public async makeCompletedEvent(@Path() eventId: string
    ):Promise<ServiceResponse<EventResponse|null>>{
        const event = await AttendEvent.findByPk(eventId)
        if(!event) return ServiceResponse.failure('Event not found', null, 404)
        await event.update({status:'completed'})
        return ServiceResponse.success('Event completed successfully', null, 200)
    }


    @Security('jwt', ['event:delete'])
    @Delete('{eventId}')
    @asyncCatch
    @Response<ServiceResponse<EventResponse | null>>(400, 'Bad Request')
    @Response<ServiceResponse<EventResponse | null>>(404, 'Event not found')
    public async deleteEvent(
        @Path() eventId: string
    ): Promise<ServiceResponse<EventResponse | null>> {
        const event = await AttendEvent.findByPk(eventId)
        if (!event) return ServiceResponse.failure('Event not found', null, 404)
        await event.destroy()
        return ServiceResponse.success('Event deleted successfully', null, 200)
    }
}
