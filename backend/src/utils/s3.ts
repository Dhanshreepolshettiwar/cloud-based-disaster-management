import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const isAwsLive = process.env.USE_AWS === 'true' && process.env.AWS_REGION;
const bucketName = process.env.DISASTER_S3_BUCKET || 'disaster-management-media-bucket';

let s3Client: S3Client | null = null;

if (isAwsLive) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
  });
}

// Supported upload formats for disaster evidence/photos
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const s3Service = {
  isLiveAws(): boolean {
    return !!s3Client;
  },

  async getPresignedUploadUrl(
    fileName: string,
    contentType: string,
    fileSize: number
  ): Promise<{ uploadUrl: string; objectKey: string; publicUrl: string }> {
    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      throw new Error(`Unsupported file type: ${contentType}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`);
    }

    if (fileSize > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File size ${fileSize} exceeds maximum limit of 10MB`);
    }

    const timestamp = Date.now();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey = `incidents/${timestamp}-${cleanFileName}`;

    if (s3Client) {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        ContentType: contentType,
      });

      // 15-minute expiration presigned URL
      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
      const publicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${objectKey}`;

      return { uploadUrl, objectKey, publicUrl };
    }

    // Local development mock signed URL
    return {
      uploadUrl: `https://mock-s3-upload.local/${bucketName}/${objectKey}`,
      objectKey,
      publicUrl: `https://mock-s3.local/${bucketName}/${objectKey}`,
    };
  },

  async getPresignedDownloadUrl(objectKey: string): Promise<string> {
    if (s3Client) {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      });
      return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    }
    return `https://mock-s3.local/${bucketName}/${objectKey}`;
  },
};
