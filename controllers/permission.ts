import { ServiceResponse } from '../utils/serviceResponse';
import { asyncCatch } from '../middlewares/errorHandler';
import { Op } from 'sequelize';
import { Body, Controller, Delete, Get, Path, Post, Put, Response, Route, Security, Tags } from 'tsoa';
import Permission from '../models/permission';
import { PermissionResponse } from '../types/responses';


export interface PermissionCreateRequest{
    name:string;
    description?:string|null;
}

export interface PermissionUpdateRequest{
    name?:string;
    description?:string|null;
}

@Route('api/permissions')
@Tags('Permissions')
export class PermissionController extends Controller{
@Get('/')
@asyncCatch
public async getAllPermissions():Promise<ServiceResponse<PermissionResponse[]>>{
    const permissions = await Permission.findAll({
        order:[['name','ASC']]
    });
    return ServiceResponse.success('Permissions retrieved successfully', permissions, 200);
}

@Security('jwt',['permission:read'])
@Get('/:permissionId')
@asyncCatch
@Response<ServiceResponse<PermissionResponse|null>>(404,'Permission not found')
public async getPermissionById(@Path() permissionId:string): Promise<ServiceResponse<PermissionResponse|null>> {
    const permission = await Permission.findByPk(permissionId);
    if (!permission) {
        return ServiceResponse.failure('Permission not found', null, 404);
    }
    return ServiceResponse.success('Permission retrieved successfully', permission, 200);
}

@Security('jwt',['permission:create'])
@Post('/')
@asyncCatch
@Response<ServiceResponse<PermissionResponse|null>>(400,'Bad Request')
@Response<ServiceResponse<PermissionResponse|null>>(409,'Permission already exists')
public async createPermission(@Body() data: PermissionCreateRequest): Promise<ServiceResponse<PermissionResponse|null>> {
// Check if a permission with the same name already exists
const existingPermission = await Permission.findOne({where:{name:data.name}});
if(existingPermission){
    return ServiceResponse.failure('Permission already exists', null, 409);
}
const created=await Permission.create({
    name:data.name,
    description:data.description||null
});
this.setStatus(201);
return ServiceResponse.success('Permission created successfully',created,201);
}

@Security('jwt', ['permission:update'])
@Put('/:permissionId')
@asyncCatch
@Response<ServiceResponse<PermissionResponse|null>>(400, 'Bad Request')
@Response<ServiceResponse<PermissionResponse|null>>(404, 'Permission not found')
public async updatePermission(
    @Path() permissionId: string,
    @Body() data: PermissionUpdateRequest
): Promise<ServiceResponse<PermissionResponse|null>> {
    const permission = await Permission.findByPk(permissionId);
    if (!permission) {
        return ServiceResponse.failure('Permission not found', null, 404);
    }

    // Check if another permission with the same name already exists
    if (data.name) {
        const existingPermission = await Permission.findOne({
            where: {
                name: data.name,
                id: { [Op.ne]: permissionId } // Exclude current permission from the check
            }
        });
        if (existingPermission) {
            return ServiceResponse.failure('A permission with this name already exists', null, 409);
        }
    }

    await permission.update({
        name: data.name || permission.name,
        description: data.description !== undefined ? data.description : permission.description
    });

    return ServiceResponse.success('Permission updated successfully', permission, 200);
}


@Security('jwt', ['permission:delete'])
@Delete('/:permissionId')
@asyncCatch
@Response<ServiceResponse<null>>(404, 'Permission not found')
@Response<ServiceResponse<null>>(409, 'cannot delete permission that is assigned to roles')
public async deletePermission(@Path() permissionId: string): Promise<ServiceResponse<null>> {
    const permission = await Permission.findByPk(permissionId);
    if (!permission) {
        return ServiceResponse.failure('Permission not found', null, 404);
    }
    //check if the permission is assigned to any role
    const roleCount=await (permission as any).countRoles();
    if(roleCount>0){
        return ServiceResponse.failure('Cannot delete permission that is assigned to roles', null, 409);
    }
    await permission.destroy();
    return ServiceResponse.success('Permission deleted successfully', null, 200);
}

}