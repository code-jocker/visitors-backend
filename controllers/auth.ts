import { Controller, Post, Get, Body, Route, Tags, Response, SuccessResponse, Res, Query, TsoaResponse, Request, Security } from "@tsoa/runtime";
import { compare, hash } from "bcrypt";
import { Request as ExpressRequest, request } from "express";
import { ServiceResponse } from "../utils/serviceResponse";

import {
    LoginRequest,
    SignupRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
} from "../types/auth-contoller-types";

import sequelize from "../config/database";
import db from "../models";
import User from "../models/user";
import { IUserAttributes } from "../types/user-type";
import { IUserResponse } from "../types/user-controller-types";
import { asyncCatch } from "../middlewares/errorHandler";
import { sanitizeString, validateSignupData } from "../utils/validationHelpers";
import { generateToken, verifyToken } from "../utils/jwt";

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string
}

@Route('api/auth')
@Tags('Authentication')
export class AuthController extends Controller {
    private async _buildUserResponse(user: User): Promise<IUserResponse> {
        const roles = await user.getRoles({
            attributes: ['id', 'name', 'description'],
            include: [{
                model: db.Permission,
                as: 'permissions',
                through: {
                    attributes: []
                },
                attributes: ['id', 'name', 'description']
            }]
        });

        const { password, ...userData } = user.toJSON() as IUserAttributes;
        return {
            ...userData,
            roles: roles.map(role => role.toJSON())
        } as IUserResponse;
    }

    @Post('/login')
    @SuccessResponse(200, 'Login successfull')
    @Response(401, 'Invalid credentials')
    @Response(403, 'Account is inactive')

    @asyncCatch
    public async login(
        @Body() credentials: LoginRequest,
        @Res() res: TsoaResponse<200 | 401 | 403, ServiceResponse<{ user: IUserResponse | null }>>
    ): Promise<void> {
        const { email, password, phone } = credentials;

        if ((!email && !phone) || !password) {
            res(401, ServiceResponse.failure('Invalid credentials', { user: null }));
            return;
        }

        let where: any;
        if (email) {
            where = { email: email };
        }
        else if (phone) {
            where = { phoneNumber: phone };
        }

        const data = await db.User.findOne({ where });
        const user = data?.toJSON() as IUserAttributes | undefined;

        if (!user || !user.password || !(await compare(password, user.password))) {
            res(401, ServiceResponse.failure('Invalid credentials', { user: null }));
            return;
        }

        if (user.status === 'inactive') {
            res(403, ServiceResponse.failure('Account is inactive. Please contact support', { user: null }));
            return;
        }

        if (user.status === 'pending') {
            res(403, ServiceResponse.failure('Account is waiting for approval', { user: null }));
            return;
        }

        const tokens = await this.generateTokens(data!);
        const userResponse = await this._buildUserResponse(data!);

        // Get roles with permissions for logging
        const rolesWithPermissions = await data!.getRoles({
            attributes: ['id', 'name'],
            include: [{
                model: db.Permission,
                as: 'permissions',
                attributes: ['name']
            }]
        });

        // Log successful login with user details
        const roleNames = rolesWithPermissions.map((role: any) => role.name).join(', ');
        console.log(`Login Successful - User: ${user.fullName} (${user.email}) - Roles: ${roleNames}`);
        console.log("User Permissions:",
            rolesWithPermissions.flatMap((role: any) =>
                role.permissions?.map((perm: any) => perm.name) || []
            )
        );

        return res(200, ServiceResponse.success('Login successful', { user: userResponse, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }));

    }

    // Auth me
    @Get('/me')
    @Security("jwt")
    @SuccessResponse(200, 'User retrieve successfully')
    @Response(401, 'Unauthorized')
    @asyncCatch
    public async getCurrentUser(
        @Request() req: ExpressRequest,
        @Res() res: TsoaResponse<200 | 401, ServiceResponse<{ user: IUserResponse | null }>>
    ): Promise<void> {
        try {
            const userId = req.user?.id;

            //Get fresh user data from the database with roles and permissions
            const userModel = await db.User.findByPk(userId, {
                include: [
                    {
                        model: db.Role,
                        as: 'roles',
                        attributes: ['id', 'name', 'description'],
                        through: { attributes: [] },
                        required: false
                    }
                ]
            });
            console.log('User found in DB:', userModel ? 'Yes' : 'No');

            if (!userModel) {
                console.log('User not found in database for ID:', userId);
                res(401, ServiceResponse.failure('User not found', { user: null }));
                return;
            }
            const userResponse = await this._buildUserResponse(userModel);
            res(200, ServiceResponse.success('User retrieved successfully', { user: userResponse }));
        } catch (error) {
            console.error('Error in getCurrentUser:', error);
            res(401, ServiceResponse.failure('Not authenticated', { user: null }));
        }
    }

    // The folllowing is for Signup for new user
    @Post('/signup')
    @SuccessResponse(201, 'User created successfully')
    @Response(400, 'Bad request, Validation Error')
    @Response(409, 'User already exists')

    public async signup(
        @Body() signupData: SignupRequest,
        @Res() res: TsoaResponse<201 | 400 | 409, ServiceResponse<{ user: IUserResponse | null, accessToken?: string, refreshToken?: string }>>
    ): Promise<void> {
        const { fullName, email, roleType, password, phone } = signupData;

        // Comprehensive input validation using validation helpers
        const validation = validateSignupData(signupData);
        if (!validation.isValid) {
            res(400, ServiceResponse.failure(validation.message!, { user: null }));
            return;
        }

        // We need to Clean phone number for database operations 
        const phoneStr = String(phone).trim();

        //Uniqueness checks with user-friendly messages
        const existingPhoneUser = await db.User.findOne({ where: { phoneNumber: phoneStr } });
        if (existingPhoneUser) {
            res(409, ServiceResponse.failure('A user with this phone number already exists', { user: null }));
            return;
        }
        if (email && String(email).trim().toLowerCase()) {
            const existingEmailUser = await db.User.findOne({ where: { email: String(email).trim().toLowerCase() } });
            if (existingEmailUser) {
                res(409, ServiceResponse.failure('A user with this email address already exists', { user: null }));
                return;
            }
        }

        const hashedPassword = await hash(password, 12)

        const newUser = await sequelize.transaction(async (t) => {
            // Clear data before saved to the database
            const userData: any = {
                fullName: sanitizeString(fullName)!,
                email: email ? sanitizeString(email)!.toLowerCase() : '',
                phoneNumber: phoneStr,
                password: hashedPassword,
                status: 'pending' as const
            };

            const user = await db.User.create(userData, { transaction: t });

            //Find or create Role
            const role = await db.Role.findOne({ where: { name: roleType }, transaction: t });

            //If the role doesn't exist , return error 
            if (!role) {
                res(400, ServiceResponse.failure('Invalid role type, Please set valid role:', { user: null }));
                await t.rollback();
                return;
            }
            await user.addRole(role, { transaction: t });

            // save user
            await user.save({ transaction: t });
            return user;
        });

        if (!newUser) {
            res(400, ServiceResponse.failure('Failed to create user', { user: null }));
            return;
        }
        const tokens = await this.generateTokens(newUser);

        const userResponse = await this._buildUserResponse(newUser);
        return res(201, ServiceResponse.success('User created successfully', { user: userResponse, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }));
    }

    @Post('/check-email')
    @SuccessResponse(200, 'Email check Successfull')
    @asyncCatch
    public async checkEmail(@Body() request: { email: string }): Promise<ServiceResponse<{ exists: boolean }>> {
        const { email } = request;
        if (!email || !email.trim()) {
            return ServiceResponse.failure('Email is required', { exists: false }, 400);
        }

        const user = await db.User.findOne({ where: { email: email.trim().toLowerCase() } });
        return ServiceResponse.success('Email checked successful', { exists: !!user });
    }

    @Post('/refresh')
    @SuccessResponse(200, 'Token refreshed successfully')
    @Response(401, 'Invalid refresh token')
    public async refreshToken(
        @Body() request: { refreshToken: string },
        @Res() res: TsoaResponse<200 | 401, ServiceResponse<{ accessToken: string, refreshToken: string }>>
    ): Promise<void> {
        const { refreshToken } = request;

        if (!refreshToken) {
            res(401, ServiceResponse.failure('Refresh token is required', { accessToken: '', refreshToken: '' }));
            return;
        }

        try {
            const decoded = await verifyToken(refreshToken, 'refresh');

            if (!decoded || !decoded.userId) {
                res(401, ServiceResponse.failure('Invalid refresh token', { accessToken: '', refreshToken: '' }));
                return;
            }

            const user = await db.User.findByPk(decoded.userId);
            if (!user) {
                res(401, ServiceResponse.failure('User not found', { accessToken: '', refreshToken: '' }));
                return;
            }

            if (user.status !== 'active') {
                res(401, ServiceResponse.failure('Account is not active', { accessToken: '', refreshToken: '' }));
                return;
            }

            const tokens = await this.generateTokens(user);
            return res(200, ServiceResponse.success('Token refreshed successfully', tokens));
        } catch (error: any) {
            res(401, ServiceResponse.failure(error.message || 'Invalid refresh token', { accessToken: '', refreshToken: '' }));
            return;
        }
    }

    private async generateTokens(userModel: User): Promise<{ accessToken: string, refreshToken: string }> {
        const roles = await userModel.getRoles({ attributes: ['name'] });

        const rolesNames = roles.map((role) => role.name);

        const user = userModel.toJSON();

        const accessToken = await generateToken({
            userId: user.id,
            email: user.email,
            roles: rolesNames,
            type: 'access' as const,
        }, 86400);

        const refreshToken = await generateToken({
            userId: user.id,
            email: user.email,
            roles: rolesNames,
            type: 'refresh' as const,
        }, 604800);

        return { accessToken, refreshToken };
    }

    private async generateToken(userModel: User): Promise<string> {
        const tokens = await this.generateTokens(userModel);
        return tokens.accessToken;
    }

    private async blacklistToken(token: string): Promise<void> {
        const decoded = await verifyToken(token, 'access');
        const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 86400000);
        await db.BlacklistedToken.create({ token, expiresAt });
    }

    @Post('/logout')
    @SuccessResponse(200, 'Logout successful')
    @Security("jwt")
    @asyncCatch
    public async logout(
        @Request() req: ExpressRequest,
        @Res() res: TsoaResponse<200, ServiceResponse<null>>
    ): Promise<void> {
        const token = req.headers.authorization?.split(' ')[1];

        if (token) {
            await this.blacklistToken(token);
            console.log(`User logged out, token: ${token}`);
        }
        return res(200, ServiceResponse.success('Logout successful', null));
    }
}