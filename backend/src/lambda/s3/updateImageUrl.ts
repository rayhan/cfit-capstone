import { SNSEvent, SNSHandler, S3EventRecord } from 'aws-lambda'
import 'source-map-support/register'

// import {updateImageUrl} from "../../businessLogic/todos";

import { createLogger } from '../../utils/logger'
const logger = createLogger('s3_events')

// For updateAttachementUrl function
import * as AWS from 'aws-sdk'
const docClient = new AWS.DynamoDB.DocumentClient()
const imageTable = process.env.IMAGE_PIPELINE_TABLE
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
    const bucket = record.s3.bucket.name
    const imageId = record.s3.object.key
    const imageUrl = `https://${bucket}.s3.amazonaws.com/${imageId}`

    await updateImageUrl(imageId, imageUrl)
  }
}

/**
 * Update imageURL value on DynamoDB table
 * 
 * @param imageId 
 * @param imageUrl 
 */
async function updateImageUrl(imageId: string, imageUrl: string) {

  

  logger.info('Fetching todo item from the database.', {Info: {imageId: imageId}})

  const resultExisting = await docClient.get({
      TableName : imageTable,
      Key: {
          'imageId': imageId
      }
  }).promise()

  if (await resultExisting.Item) {
    // Log the event
    logger.info("Todo item doesn't exist in database.", {Info: {imageId: imageId}})
    return
  }

  var imageItem = await resultExisting.Item as ImageItem
  logger.info('Todo item fetched from the database', {imageItem: imageItem})

  // Update record
  logger.info('Updating todo item to the database', {Info: {imageItem: imageItem, imageUrl: imageUrl}})
  const result = await docClient.update({
      TableName: imageTable,
      Key: {
          "imageId": imageId
      },
      UpdateExpression: "set imageUrl = :imageUrl",
      ExpressionAttributeValues: {
          ":imageUrl": imageUrl
      },
      ReturnValues: "UPDATED_NEW"
  }).promise();

  logger.info("Updated record with attachment information", {Info: {result: await result}})

}