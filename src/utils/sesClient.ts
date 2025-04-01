// snippet-start:[ses.JavaScript.createclientv3]
import { SESClient } from "@aws-sdk/client-ses";
import dotenv from "dotenv";

dotenv.config();

// Set the AWS Region
const REGION = "ap-south-1";

// Create SES service object with proper error handling
const sesClient = new SESClient({ 
  region: REGION, 
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || "",
    secretAccessKey: process.env.AWS_SECRET_KEY || ""
  }
});

export { sesClient };
// snippet-end:[ses.JavaScript.createclientv3]
