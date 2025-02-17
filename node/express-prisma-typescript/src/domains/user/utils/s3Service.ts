import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import dotenv from 'dotenv'

dotenv.config() // Load .env file

const s3 = new S3Client({
  region: process.env.AWS_DEFAULT_REGION ?? '' // Load from .env or AWS config
})

const BUCKET_NAME = process.env.AWS_BUCKET_NAME ?? ''

export const generateUploadUrl = async (folder: string): Promise<{ uploadUrl: string, fileUrl: string }> => {
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}`
  console.log('key', key)
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: 'image/jpeg'
  }

  const command = new PutObjectCommand(params)
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }) // 5 minutes expiration
  const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_DEFAULT_REGION ?? ''}.amazonaws.com/${key}`
  console.log('uploadUrl', uploadUrl)
  console.log('fileUrl', fileUrl)
  console.log('Headers in Signed URL:', params)
  return { uploadUrl, fileUrl }
}
