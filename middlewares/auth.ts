import { Request, Response, NextFunction } from "express";
import { ServiceResponse } from "../utils/serviceResponse";
import { verifyToken } from "../utils/jwt";
import db from "../models";
import Role from "../models/role";
// import {Role} from './models/role'

//Extend the role type to include the permissions association
type RoleWithPermissions = Role & {
    permissions?: Array<
        {
            name: string;
            [key: string]: any;
        }>
}

function authError(message: string, statusCode: number) {
    const error = new Error(message) as Error & { statusCode?: number; status?: number };
    error.statusCode = statusCode;
    error.status = statusCode;
    return error;
}
// helper function to extract token from Request
function extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    if (request.cookies?.token) {
        return request.cookies.token;
    }
    return null;
}

// Reusable function to fetch user and attach organization data
async function fetchUserWithDetails(userId: string, decodedToken?: any): Promise<any> {
    const user = await db.User.findByPk(userId, {
        include: [
            {
                model: db.Role,
                as: 'roles',
                attributes: ['id', 'name'],
                include: [{
                    model: db.Permission,
                    as: 'permissions',
                    attributes: ['name', 'description']
                }]
            }
        ]
    });
    if (!user) {
        throw new Error('User not found');
    }
    if (decodedToken) {
        (user as any).decodedToken = decodedToken;
    }
    return user;
}

//middleware to check auth.ts-checkUserPermissions function
function checkUserPermissions(user: any, scopes?: string[]): boolean {
    if (!scopes || scopes.length === 0) {
        return true;
    }

    const userPermissions = user?.roles?.flatMap((role: RoleWithPermissions) => role.permissions?.map(p => p.name) || []) || [];

    return scopes.some(scope => userPermissions.includes(scope));
}

//TSOA authentication function

export async function expressAuthentication(
    request: Request,
    securityName: string,
    scopes?: string[]
): Promise<any> {
    if (securityName === 'jwt') {
        try {
            const token = extractToken(request);
            console.log('Token extracted:', token ? 'Yes' : 'No');
            console.log('Token value:', token?.substring(0, 20) + '...');
            if (!token) {
                return Promise.reject(authError('No token provided', 401));
            }
            
            let decoded;
            try {
                decoded = await verifyToken(token, 'access');
                console.log('Token decoded successfully:', decoded);
            } catch (verifyError: any) {
                console.error('Token verification failed:', verifyError.message);
                throw verifyError;
            }
            
            if (!decoded || !decoded.userId) {
                console.error('Decoded token missing userId:', decoded);
                return Promise.reject(authError('Invalid token', 401));
            }

            const user = await fetchUserWithDetails(decoded.userId, decoded);
            console.log('User fetched:', user ? 'Yes' : 'No');
            if (!checkUserPermissions(user, scopes)) {
                return Promise.reject(authError('Forbidden: Insufficient permissions', 403));
            }
            return Promise.resolve(user);
        } catch (error: any) {
            console.error('JWT Auth Error:', error.message);
            return Promise.reject(authError(error.message || 'Invalid token', error.statusCode || error.status || (error.message?.includes('Forbidden') ? 403 : 401)));
        }
    }
    if (securityName === 'optionalJwt') {
        try {
            const token = extractToken(request);
            if (!token) {
                if (scopes && scopes.length > 0) {
                    return Promise.reject(authError('Forbidden: Insufficient permissions', 403));
                }
                return Promise.resolve({ roles: [] });
            }

            const decoded = await verifyToken(token, 'access');
            if (!decoded || !decoded.userId) {
                return Promise.reject(authError('Invalid token', 401));
            }
            const user = await fetchUserWithDetails(decoded.userId, decoded);
            if (!checkUserPermissions(user, scopes)) {
                return Promise.reject(authError('Forbidden: Insufficient permissions', 403));
            }
            return Promise.resolve(user);
        } catch (error: any) {
            return Promise.reject(authError(error.message || 'Invalid token', error.statusCode || error.status || (error.message?.includes('Forbidden') ? 403 : 401)));
        }
    }
    return Promise.reject(authError(`Unknown security scheme: ${securityName}`, 401));
}
//Optional:Keep old middleware for routes not managed by TSOA
export const checkAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
)=>{
    try {
    const user=await expressAuthentication(req,'jwt');
    req.user=user;
    next();    
    } catch (error:any) {
        return res.status(401).json(ServiceResponse.failure(error.message, null,401));
    }
};

export const checkOptionalAuth=async(
    req:Request,
    res:Response,
    next:NextFunction
)=>{
try {
    const user=await expressAuthentication(req,'optionalJwt');
    req.user=user;
    next();
    
} catch (error:any) {
    return res.status(401).json(ServiceResponse.failure(error.message, null, 401));
    
}
};

export const checkPermission=(requiredPermission:string)=>{
    return async(req:Request,res:Response,next:NextFunction)=>{
        try {
            await expressAuthentication(req,'jwt',[requiredPermission]);
            next();
        } catch (error:any) {
            const statusCode=error.message.includes('Forbidden')?403:401;
            return res.status(statusCode).json(ServiceResponse.failure(error.message, null, statusCode));  
        }
    };
};

export const checkOptionalPermission=(requiredPermission:string)=>{
    return async(req:Request,res:Response,next:NextFunction)=>{
   try {
    await expressAuthentication(req, 'optionalJwt', [requiredPermission]);
    next();
   } catch (error:any) {
    const statusCode=error.message.includes('Forbidden')?403:401;
    return res.status(statusCode).json(ServiceResponse.failure(error.message, null, statusCode));
   }
    };
};
