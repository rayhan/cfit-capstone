import * as uuid from 'uuid';
import {ImageItem} from "../models/ImageItem";
// import {TodoUpdate} from "../models/TodoUpdate";
import {CreateImageRequest} from "../requests/CreateImageRequest";
// import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import {ImageItemAccess} from "../dataLayer/imageItemAccess";
import { getS3SignedUrl } from '../utils/s3'

const imageItemAccess = new ImageItemAccess();

export async function getImageItem(imageId: string): Promise<ImageItem> {
    return await imageItemAccess.getImageItem(imageId)
}

export async function deleteImageItem(imageId: string) {
    return await imageItemAccess.deleteImageItem(imageId)
}

export async function getImageItems(imageType?: string) : Promise<ImageItem[]> {
    return await imageItemAccess.getImageItems(imageType)
}

export async function createImageItem(createImageRequest: CreateImageRequest) : Promise<ImageItem> {
    const createdAt = new Date().toISOString()
    const imageId = uuid.v4();

    return await imageItemAccess.createImageItem({
        imageId: imageId,
        imageType: createImageRequest.imageType,
        createdAt: createdAt,
        name: null,
        url: null,
        sizes: null
    })
}


export function generateUploadUrl(imageId: string) : string {
    return getS3SignedUrl(imageId, 'putObject')
}

export function updateImageUrl(imageId: string, url: string): Promise<null> {
    return imageItemAccess.updateImageUrl(imageId, url)

}