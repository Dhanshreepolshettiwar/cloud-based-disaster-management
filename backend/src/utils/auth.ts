import { APIGatewayProxyEvent } from 'aws-lambda';
import { UserRole } from '../types';

export interface AuthContext {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export function extractAuthContext(event: Partial<APIGatewayProxyEvent>): AuthContext {
  // If Cognito Authorizer populated claims in requestContext
  const claims = (event.requestContext as any)?.authorizer?.claims;
  if (claims) {
    const cognitoGroups: string = claims['cognito:groups'] || '';
    let role: UserRole = 'CITIZEN';

    if (cognitoGroups.includes('ADMIN')) {
      role = 'ADMIN';
    } else if (cognitoGroups.includes('AUTHORITY')) {
      role = 'AUTHORITY';
    } else if (cognitoGroups.includes('RESCUE_TEAM')) {
      role = 'RESCUE_TEAM';
    }

    return {
      userId: claims.sub || 'unknown',
      email: claims.email || '',
      role,
      name: claims.name || claims['cognito:username'] || 'User',
    };
  }

  // Fallback for custom header / local test headers
  const authHeader = event.headers?.['x-user-role'] || event.headers?.['X-User-Role'];
  const userId = event.headers?.['x-user-id'] || event.headers?.['X-User-Id'] || 'guest-user';
  const userEmail = event.headers?.['x-user-email'] || event.headers?.['X-User-Email'] || 'guest@example.com';
  const userName = event.headers?.['x-user-name'] || event.headers?.['X-User-Name'] || 'Guest User';

  let role: UserRole = 'CITIZEN';
  if (authHeader === 'ADMIN' || authHeader === 'AUTHORITY' || authHeader === 'RESCUE_TEAM') {
    role = authHeader as UserRole;
  }

  return {
    userId,
    email: userEmail,
    role,
    name: userName,
  };
}

export function requireRole(context: AuthContext, allowedRoles: UserRole[]): void {
  if (!allowedRoles.includes(context.role)) {
    throw new Error(`Forbidden: Role '${context.role}' does not have permission for this action.`);
  }
}

export function createApiResponse(statusCode: number, data: any) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-User-Role,X-User-Id,X-User-Email,X-User-Name',
      'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
    },
    body: JSON.stringify(data),
  };
}
