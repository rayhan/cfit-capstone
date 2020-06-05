// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'yiop0nehgb'
const region = 'us-west-2'
export const apiEndpoint = `https://${apiId}.execute-api.${region}.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'udacity-serverless.auth0.com',            // Auth0 domain
  clientId: 'hSwmsl7bDOnBqtOh598XrTq9qK18ZdHB',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
