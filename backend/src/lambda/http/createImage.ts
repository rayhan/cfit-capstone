import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { CreateImageRequest } from '../../requests/CreateImageRequest'


// import { getUserId } from '../utils'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { createLogger } from '../../utils/logger'
const logger = createLogger('api_calls')


import {createImageItem, generateUploadUrl} from "../../businessLogic/images";


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event .. ', event)
  
  const newImageRequest: CreateImageRequest = JSON.parse(event.body)
  const imageItem = await createImageItem(newImageRequest)

  logger.info("Todo created", imageItem)
  
  const imagePath = encodeURIComponent(imageItem.imageType) + '/' + imageItem.imageId
  logger.info('Generating signed url for ', {imagePath: imagePath})

  const signedUrl = generateUploadUrl(imagePath)
  logger.info('Signed upload url generated', {imagePath: imagePath, signedUrl: signedUrl})

  return {
    statusCode: 201,
    body: JSON.stringify({'item': imageItem, 'uploadUrl': signedUrl})
  }
})

handler.use(cors({
    credentials: true
  })
)