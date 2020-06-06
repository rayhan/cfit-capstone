import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import {getImageItem, generateUploadUrl} from "../../businessLogic/images";
// import { getUserId } from '../utils'

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

  const signedUrl = generateUploadUrl(imageId)
  logger.info('Signed upload url generated', {imageId: imageId, signedUrl: signedUrl})

  return {
    statusCode: 200,
    body: JSON.stringify({
      "uploadUrl": signedUrl
    })
  }
})

handler.use(cors({
  credentials: true
}))
