import { SNSEvent, SNSHandler, S3EventRecord } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import * as Jimp from 'jimp/es'

import { createLogger } from '../../utils/logger'
const logger = createLogger('s3_events')

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3()

const docClient = new AWS.DynamoDB.DocumentClient()
const imageTable = process.env.IMAGE_PIPELINE_TABLE

const imagesBucketName = process.env.IMAGES_S3_BUCKET
const thumbnailBucketName = process.env.THUMBNAILS_S3_BUCKET

import {ImageItem} from "../../models/ImageItem";

export const handler: SNSHandler = async (event: SNSEvent) => {
  logger.info('Processing SNS event ', {event: event})

  for (const snsRecord of event.Records) {
    const s3EventStr = snsRecord.Sns.Message

    const s3Event = JSON.parse(s3EventStr)
    logger.info('Parsed s3 Event', {s3Event: s3Event})

    for (const record of s3Event.Records) {
      await processImage(record)
    }
  }
}

/**
 * Proecss a single record
 * 
 * @param record 
 */
async function processImage(record: S3EventRecord) {
  logger.info('Processing S3 Event Record ', {record: record})

  if (record.eventName === 'ObjectCreated:Put') {
    // const bucket = record.s3.bucket.name
    const imageKey = record.s3.object.key
    const imageUrl = `https://${thumbnailBucketName}.s3.amazonaws.com/${imageKey}.jpeg`

    await processThumbnail(imageKey, imageUrl)
  }
}

/**
 * Update imageURL value on DynamoDB table
 * 
 * @param imageId 
 * @param imageUrl 
 */
async function processThumbnail(imageKey: string, imageUrl: string) {

  const split = imageKey.split('/')
  const imageId = split[1]

  logger.info('Fetching image item from the database.', {Info: {imageId: imageId}})

  const resultExisting = await docClient.get({
      TableName : imageTable,
      Key: {
          'imageId': imageId
      }
  }).promise()

  if (!(await resultExisting.Item)) {
    // Log the event
    logger.info("Image item doesn't exist in database.", {Info: {imageId: imageId}})
    return
  }

  var imageItem = await resultExisting.Item as ImageItem

  await resizeImage(imageKey)

  // Update record
  logger.info('Updating thumbnail item to the database', {Info: {imageItem: imageItem, imageUrl: imageUrl}})
  const result = await docClient.update({
      TableName: imageTable,
      Key: {
          "imageId": imageId
      },
      UpdateExpression: "set #image_sizes = :sizesValue",
      ExpressionAttributeValues: {
          ":sizesValue": JSON.stringify({ thumbnail: imageUrl })
      },
      ExpressionAttributeNames: {
        "#image_sizes": "sizes"
      },
      ReturnValues: "UPDATED_NEW"
  }).promise();

  logger.info("Updated record with attachment information", {Info: {result: result}})

}



async function resizeImage(key: string) {
  
  console.log('Processing S3 item with key: ', key)
  const response = await s3
    .getObject({
      Bucket: imagesBucketName,
      Key: key
    })
    .promise()

  const body = Buffer.from(response.Body)
  const image = await Jimp.read(body)

  console.log('Resizing image')
  image.resize(160, Jimp.AUTO)
  const convertedBuffer = await image.getBufferAsync(`${Jimp.AUTO}`)

  console.log(`Writing image back to S3 bucket: ${thumbnailBucketName}`)

  await s3
    .putObject({
      Bucket: thumbnailBucketName,
      Key: `${key}.jpeg`,
      Body: convertedBuffer
    })
    .promise()
}


// dynamodb.update({
//     TableName: table,
//     Key: key,
//     UpdateExpression: 'SET #gs.#qs.#status = :newStatus',
//     ExpressionAttributeNames: {'#gs': 'Gamestats', '#qsm': 'QuickShootingMode', '#s': 'status' },
//     ExpressionAttributeValues: { ':newStatus': false }
//   }, callback)
