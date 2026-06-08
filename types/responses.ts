export interface PermissionResponse {
    id: string;
    name: string;
    description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface RoleResponse {
    id: string;
    name: string;
    description?: string | null;
    category?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    permissions?: PermissionResponse[];
}

export interface AppointmentResponse {
    id: string;
    userId: string;
    status?:string;
    purpose?: string;
    host?: string;
    department?: string;
    cancelReason?:string;
    reasonToReschedule?:string;
    appointmentDate?: string;
    appointmentTime?: string;
    user:{
        fullName:string;
        email?:string;
        department:string;
        phoneNumber:string
    }
    timeDuration?: string;
    appointmentLocation?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface EventResponse{
    id:string;
    title:string;
    description?:string | null;
    eventDate?:string;
    eventTime?:string;
    timeDuration?:string;
    eventLocation?:string;
    createdAt?:Date;
    updatedAt?:Date;
    status?:string;

}

export interface EquipmentResponse{
    id:string;
    name:string;
    description?:string | null;
    serialNumber?:string|null;
    quantity?:number;
    status:string;
    assignedTo?:string | null;
    createdAt?:Date;
    updatedAt?:Date;
}

export interface HandoverResponse{
    id:string;
    outgoingUser:string;
    incomingUser:string;
    handOverShift:string;
    handOverDate:Date;
    handOverTime:string;
    handOverItems:string;
    handOverDescription?:string | null;
    status:string;
    createdAt?:Date;
    updatedAt?:Date;
}
export interface CardResponse{
    id:string;
    cardNumber:string;
    status:string;
    doneBy?:string;
    location?:string;
    branch?:string;
    assignedTo?:string;
    createdAt?:Date;
    updatedAt?:Date;
}