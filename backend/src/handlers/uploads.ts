import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { s3Service } from '../utils/s3';
import { extractAuthContext, createApiResponse } from '../utils/auth';

export async function handler(event: Partial<APIGatewayProxyEvent>): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod || 'POST';

  try {
    if (method !== 'POST') {
      return createApiResponse(405, { error: `Method ${method} not allowed` });
    }

    const authContext = extractAuthContext(event);
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};

    if (!body.fileName || !body.contentType) {
      return createApiResponse(400, { error: 'fileName and contentType are required' });
    }

    const fileSize = Number(body.fileSize) || 1024;
    const result = await s3Service.getPresignedUploadUrl(body.fileName, body.contentType, fileSize);

    return createApiResponse(200, {
      message: 'Presigned S3 upload URL generated',
      uploadUrl: result.uploadUrl,
      objectKey: result.objectKey,
      fileUrl: result.publicUrl,
      uploadedBy: authContext.userId,
    });
  } catch (err: any) {
    console.error('Error generating presigned upload URL:', err);
    return createApiResponse(400, { error: err.message || 'Failed to generate upload URL' });
  }
}
