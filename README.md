# Serverless Image Pipeline

This serverless image pipeline project offers simplified image processing processing APIs using AWS lampda and S3 based image procesing needs. Which can be extended to provide more feature rich experience in the future.

## Functionality of the application

This application provide following HTTP APIs protected by AWS APIGateway ApiKeys for application developers who can generate signed URLs and use AWS lamba capability to scale the image processing pipeline for their applications.

Applications owner will be able to specify imageType parameters to identify images belongs to a specific types such as products, users, albums, etc. Later it can be extended to add more features.

### GET /images

List all images with optional `imageType=?` query parameters. If not imageType is not provided, then default value "images" will be used.

### POST /images

Create a new image record and get the signed url to upload the image. You need to specify imageType to identify the purpose of images. E.g. images or users or products etc

Reqeust:

```
{
	"imageType": "images"
}
```

Response:   

```
{
    "item": {
        "imageId": "de488b0d-4bac-4d8d-a4b3-48de11609523",
        "imageType": "images",
        "createdAt": "2020-06-07T18:57:14.692Z",
        "url": null,
        "sizes": null
    },
    "uploadUrl": "....."
}
```

### GET /images/{imageId}

Get an single image information.

Response:  

```
{
    "createdAt": "2020-06-07T18:57:14.692Z",
    "imageId": "de488b0d-4bac-4d8d-a4b3-48de11609523",
    "sizes": null,
    "url": null,
    "imageType": "images"
}
```

### DELETE /images/{imageId}

Delete an existing image record.

## Authentication

This app is protected by AWS ApiGateway API Key based authentication for server to server communication. To get the API Keys run the `sls deploy` command and you will get API keys generated from the API gateway in the output console.

# How to run the application

## Backend

To deploy an application run the following commands:

```
npm install
sls deploy -v
```

# Postman collection

Postman collection is available in the `CFIT-Capstone.postman_collection.json` file which can be used to test the APIs.

Please update following variables in the Postman collections to test the APIs.

```
- apiId
- region
- apiKey
```
