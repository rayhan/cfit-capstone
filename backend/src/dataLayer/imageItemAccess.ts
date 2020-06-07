import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import {DocumentClient} from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

console.log(typeof XAWS)

import {ImageItem} from "../models/ImageItem";

import { createLogger } from '../utils/logger'
const logger = createLogger('data_layer')

export class ImageItemAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly imageTable = process.env.IMAGE_PIPELINE_TABLE,
        private readonly imageIndex = process.env.IMAGE_INDEX) {
    }

    /**
     * Get ImageItem
     * 
     * @param imageId
     */
    async getImageItem(imageId: string): Promise<ImageItem|null> {
        const result = await this.docClient.get({
            TableName : this.imageTable,
            Key: {
                'imageId': imageId
            }
        }).promise()
    
        if (result.Item) {
            return result.Item as ImageItem
        }

        return null
    }

    /**
     * Get all todo items for a image type
     * 
     * @param imageType 
     */
    async getImageItems(imageType?: string) : Promise<ImageItem[]> {

        if (!imageType) {
            imageType = 'images';
        }

        const result = await this.docClient
                      .query({
                        TableName: this.imageTable,
                        IndexName: this.imageIndex,
                        KeyConditionExpression: 'imageType = :imageType',
                        ExpressionAttributeValues: {
                            ':imageType': imageType
                        }
                    })
                      .promise()

        // debug
        logger.debug('get items results ', result)

        return result.Items as ImageItem[]
    }

    /**
     * Create an new Image Item
     * 
     * @param imageItem 
     */
    async createImageItem(imageItem: ImageItem): Promise<ImageItem> {
        logger.info('Create new ImageItem: ', imageItem)
        await this.docClient.put({
            TableName: this.imageTable,
            Item: imageItem
        }).promise()

        // debug
        logger.debug('Create new image item ', imageItem)

        return Promise.resolve(imageItem)
    }


    async updateImageUrl(imageId: string, url: string): Promise<null> {
        logger.info('Updating image item for url', {Info: {imageId: imageId, url: url}})

        logger.info('Fetching image item from the database.', {Info: {imageId: imageId}})
        const queryResult = await this.docClient.get({
            TableName : this.imageTable,
            Key : {
                'imageId': imageId
            }
        }).promise()
        
        if (!(await queryResult.Item)) {
            logger.info("Todo item doesn't exist in database.", {Info: {imageId: imageId}})
            return
        }

        const imageItem = await queryResult.Item as ImageItem
        logger.info('image item fetched from the database', {imageItem: imageItem})


        // Update record in database
        logger.info('Updating image item to the database', {Info: {imageItem: imageItem, url: url}})
        
        const updateResult = await this.docClient.update({
            TableName: this.imageTable,
            Key: {
                "imageId": imageId
            },
            UpdateExpression: "set #url_alias = :url",
            ExpressionAttributeValues: {
                ":url": url
            },
            ExpressionAttributeNames: {
              "#url_alias": "url"
            },
            ReturnValues: "UPDATED_NEW"
        }).promise();

        logger.info("Updated record with imageUrl", {Info: {updateResult: await updateResult}})
    }

    /**
     * Delete image item using composite key
     * 
     * @param imageId  
     */
    async deleteImageItem(imageId: string) {
        logger.info('Deleting an imageItem with imageId', {imageId: imageId})

        await this.docClient.delete({
            TableName: this.imageTable,
            Key: {
                imageId: imageId
            }
        }).promise();
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.info('Creating a local DynamoDB instance')
        return new AWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new AWS.DynamoDB.DocumentClient()
}