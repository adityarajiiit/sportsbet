import { S3Client } from "@aws-sdk/client-s3";
import dotenv from 'dotenv'
dotenv.config()
const s3=new S3Client({
    region:"ap-southwest-1",
    endpoint:process.env.STORJ_ENDPOINT,
    credentials:{
        accessKeyId:process.env.STORJ_ACCESS_KEY,
        secretAccessKey:process.env.STORJ_SECRET_KEY
    },
    s3ForcePathStyle:true,
    signatureVersion:"v4",
    connectTimeout:0,
    httpOptions:{timeout:0}
})
export default s3