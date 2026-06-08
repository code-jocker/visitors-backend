import { Body, Controller, Delete, Get, Path, Post, Put, Query, Response, Route, Security, SuccessResponse, Tags } from "tsoa";
import { asyncCatch } from "../middlewares/errorHandler";
import { ServiceResponse } from "../utils/serviceResponse";
import { Op, where } from "sequelize";
import Role from "../models/role";
import Permission from "../models/permission";
import { RoleResponse } from "../types/responses";

interface RoleCreateRequest {
    name: string;
    description?: string | null;
    category?: string | null;
    permissionIds?: string[]; // Array of permission IDs to associate with the role
}
interface RoleUpdateRequest {
    name?: string;
    description?: string | null;
    category?: string | null;
    permissionIds?: string[];
    permissions?: any[]; // Allow permissions array from frontend
}

@Route('/api/roles')
@Tags('Roles')
export class RoleController extends Controller {
    @Security('jwt', ['role:read'])
    @Get('/')
    @asyncCatch
    public async listRoles(
        @Query() page: number,
        @Query() limit: number,
        @Query() search?: string
    ): Promise<any> {
        const where: any = {};

        // Add search functionality using Sequelize operators
        if (search && search.trim()) {
            const searchTerm = search.trim();
            where[Op.or] = [
                { name: { [Op.like]: `%${searchTerm}%` } },
                { description: { [Op.like]: `%${searchTerm}%` } },
                { category: { [Op.like]: `%${searchTerm}%` } }
            ];
        }
        //Filter by category if provided
        if (search && search.trim()) {
            const categoryTerm = search.trim();
            where.category = { [Op.like]: `%${categoryTerm}%` };
        }

        const offset = (page - 1) * limit;
        const { count, rows } = await Role.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            include: ['permissions'] // Include associated permissions
        });
        return ServiceResponse.success('Roles retrieved successfully', {
            roles: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit)
            }
        }, 200);
    }

    // The sigle role retrieval, creation, update and deletion endpoints would go here, following a similar pattern to the permissions controller
    @Security('jwt', ['role:read'])
    @Get('/:roleId')
    @asyncCatch
    @Response<ServiceResponse<RoleResponse|null>>(404, 'Role not found')
    public async getRoleById(@Path() roleId: string): Promise<ServiceResponse<RoleResponse|null>> {
        const role = await Role.findByPk(roleId, {
            include: [{
                model: Permission,
                as: 'permissions',
                through: {
                    attributes: [] // Exclude the join table attributes
                }
            }]
        });
        if (!role) {
            return ServiceResponse.failure('Role not found', null, 404);
        }
        return ServiceResponse.success('Role retrieved successfully', role, 200);
    }

    @Security('jwt', ['role:create'])
    @Post('/')
    @asyncCatch
    public async createRole(@Body() data: RoleCreateRequest): Promise<ServiceResponse<RoleResponse|null>> {
        const createdRole = await Role.create({
            name: data.name,
            description: data.description || null,
            category: data.category || null
        });
        if (data.permissionIds && data.permissionIds.length > 0) {
            await (createdRole as any).setPermissions(data.permissionIds);
        }
        this.setStatus(201);
        const result = await Role.findByPk(createdRole.id, {
            include: [{
                model: Permission,
                as: 'permissions',
                through: {
                    attributes: []
                }
            }]
        });
        return ServiceResponse.success('Role created successfully', result, 201);
    }
    // updating role and its permissions
    @Security('jwt', ['role:update'])
    @Put('/:roleId')
    @asyncCatch
    public async updateRole(
        @Path() roleId: string,
        @Body() data: RoleUpdateRequest
    ): Promise<ServiceResponse<RoleResponse|null>> {
        const role = await Role.findByPk(roleId);
        if (!role) {
            return ServiceResponse.failure('Role not found', null, 404);
        }
        await role.update({
            name: data.name || role.name,
            description: data.description !== undefined ? data.description : role.description,
            category: data.category !== undefined ? data.category : role.category
        });
        // Handle both permissionIds and permissions array
        const permissionIds = data.permissionIds || 
            (Array.isArray(data.permissions) 
                ? (typeof data.permissions[0] === 'string' 
                    ? data.permissions 
                    : data.permissions.map((p: any) => p.id).filter(Boolean))
                : undefined);
        if (permissionIds !== undefined) {
            await (role as any).setPermissions(permissionIds);
        }
        const result = await Role.findByPk(roleId, {
            include: [{
                model: Permission,
                as: 'permissions',
                through: {
                    attributes: []
                }
            }]
        });
        return ServiceResponse.success('Role updated successfully', result, 200);
    }
    // deleting role
    @Security('jwt', ['role:delete'])
    @Delete('/:roleId')
    @asyncCatch
    @SuccessResponse(204, 'No Content')
    public async deleteRole(
        @Path() roleId: string
    ): Promise<ServiceResponse<null>> {
        const role = await Role.findByPk(roleId);
        if (!role) {
            return ServiceResponse.failure('Role not found', null, 404);
        }
        await role.destroy();
        this.setStatus(204);
        return ServiceResponse.success('Role deleted successfully', null, 204);
    }

    // deleting permissions of a role
    @Security('jwt', ['role:update'])
    @Delete('/:roleId/permissions/:permissionId')
    @asyncCatch
    @SuccessResponse(204, 'No Content')
    public async removePermissionFromRole(
        @Path() roleId: string,
        @Path() permissionId: string
    ): Promise<ServiceResponse<null>> {
        const role = await Role.findByPk(roleId);
        const permission = await Permission.findByPk(permissionId);
        if (!role || !permission) {
            return ServiceResponse.failure('Role or Permission not found', null, 404);
        }
        await (role as any).removePermission(permission);
        this.setStatus(204);
        return ServiceResponse.success('Permission removed from role successfully', null, 204);
    }
}
