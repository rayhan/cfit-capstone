import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// import { getUserId } from '../utils'

import {getImageItem, deleteImageItem} from "../../businessLogic/images";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
const logger = createLogger('api_calls')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event .. ', event)

  const imageId = event.pathParameters.imageId

  // Velidate user owns the requested item.
  const imageItem = await getImageItem(imageId)

  if (!imageItem) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'Image does not exist'
      })
    }
  }

  logger.info("Delete Item with ID: ", imageId)
  deleteImageItem(imageId);

  return {
    statusCode: 202,
    body: ''
  }

})

handler.use(cors({
    credentials: true
}))



