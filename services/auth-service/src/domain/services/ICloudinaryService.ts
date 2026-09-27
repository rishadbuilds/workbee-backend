/** cloudinary service interface */

export interface ICloudinaryService {
    generateUploadSignature(paramsToSign: Record<string, string | number>):{signature:string, timestamp:number};
    deleteFile(publicId:string):Promise<void>;
}