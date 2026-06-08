import { SignJWT,jwtVerify,JWTPayload } from "jose";
import {v4 as uuidv4} from 'uuid'
import config from "../config/config";

//Define token payload types
export type TokenType='access'|'refresh'

export interface TokenPayload extends JWTPayload{
    userId:string;
    type:TokenType;
    email:string;
    roles:string[];
    tokenId:string;
}

//Get JWT secret from config

const secret = new TextEncoder().encode(config.jwt.secret);

/**
 * Generate a JWT token
 * @param payload Token payload
 * @param expiresIn Expiration time in seconds (default: 1 day for access, 7 days for refresh)
 * @returns Signed JWT token
 */

export async function generateToken(payload:Omit<TokenPayload,'tokenId'>,expiresIn:number):Promise<string>{

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + expiresIn;
    return new SignJWT({...payload,iat,exp})
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(secret);
}

/**
 * Verify a JWT token
 * @param token JWT token to verify
 * @param expectedType Expected token type (access or refresh)
 * @returns Decoded token payload if valid
 * @throws If token is invalid or expired
 */

export async function verifyToken(token:string,expectedType?:TokenType):Promise<TokenPayload>{
   try{ 
    const {payload}=await jwtVerify(token,secret,{
        algorithms:['HS256'],
        ...(expectedType && {typ:'JWT'})
    });

    const typedPayload=payload as TokenPayload;
    
    if(expectedType && typedPayload.type !== expectedType){
        throw new Error(`Invalid token type. Expected ${expectedType}, got ${typedPayload.type}`);
    }
    return typedPayload;

}
catch(error){
    console.error('JWT Verify Error Details:', error);
    if(error instanceof Error){
        if(error.message.includes('expired')){
            throw new Error('Token has expired');
        }
        if(error.message.includes('signature')){
            throw new Error('Invalid token signature');
        }
        throw error;
    }
    throw new Error('Invalid token');

}
}