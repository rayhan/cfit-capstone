import {S3} from 'aws-sdk'

import { createLogger } from './logger'
const logger = createLogger('api_calls')

/**
 * Get signed url for an S3 Bucket
 * 
 * @param imageId string
 * @param operation string operation permitted for the generated signed url like getObject, putObject
 * @returns a string of signed url
 */
export function getS3SignedUrl(imageId: string, operation: string): string {

    const bucket = process.env.IMAGES_S3_BUCKET
    const urlExpiration = process.env.SIGNED_URL_EXPIRATION
  
    const s3 = new S3({
        signatureVersion: 'v4'
    });


    logger.info('Generating signed url', {
        Bucket: bucket,
        Key: imageId,
        Expires: parseInt(urlExpiration)
    })
  
    const signedURL = s3.getSignedUrl(operation, {
        Bucket: bucket,
        Key: imageId,
        Expires: parseInt(urlExpiration)
    });  
  
    return signedURL
  }