import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import {getImageItems} from "../../businessLogic/images";
// import { getUserId } from '../utils'

const logger = createLogger('api_calls')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event .. ', event)

  const items = await getImageItems(null);

  logger.info('Items retrieved', items)

  return {
    statusCode: 200,
    body: JSON.stringify({
      items: items
    })
  }
})

handler.use(cors({    
    credentials: true
}))