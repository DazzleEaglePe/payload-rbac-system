import { v2 as cloudinary } from 'cloudinary'

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export const isCloudinaryConfigured = (): boolean =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
  )

export const uploadToCloudinary = async (filePath: string): Promise<string> => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'payload-inventory',
    resource_type: 'auto',
  })
  return result.secure_url
}

export const getPublicIdFromUrl = (url: string): string | null => {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/)
  return match ? match[1] : null
}

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId)
}
