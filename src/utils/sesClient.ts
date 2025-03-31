// snippet-start:[ses.JavaScript.createclientv3]
import { SESClient } from "@aws-sdk/client-ses";
import dotenv from "dotenv";

dotenv.config();

// Set the AWS Region
const REGION = "ap-south-1";

// Log configuration for debugging
console.log("SES Client Configuration:");
console.log(`- Region: ${REGION}`);
console.log(`- AWS Access Key ID: ${process.env.AWS_ACCESS_KEY ? "Set (first few chars: " + process.env.AWS_ACCESS_KEY.substring(0, 4) + "...)" : "Not set"}`);
console.log(`- AWS Secret Key: ${process.env.AWS_SECRET_KEY ? "Set (length: " + process.env.AWS_SECRET_KEY.length + ")" : "Not set"}`);

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
