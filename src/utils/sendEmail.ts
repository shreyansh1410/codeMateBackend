import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "./sesClient";

const createSendEmailCommand = (toAddress: string, fromAddress: string, subject: string, body: string) => {
    return new SendEmailCommand({
      Destination: {
        /* required */
        CcAddresses: [
          /* more items */
        ],
        ToAddresses: [
          toAddress,
          /* more To-email addresses */
        ],
      },
      Message: {
        /* required */
        Body: {
          /* required */
          Html: {
            Charset: "UTF-8",
            Data: body,
          },
          Text: {
            Charset: "UTF-8",
            Data: body,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
      },
      Source: fromAddress,
      ReplyToAddresses: [
        /* more items */
      ],
    });
  };

const run = async (toAddress: string, fromAddress: string, subject: string, body: string) => {
    const sendEmailCommand = createSendEmailCommand(
        //both these email IDs should be verified in SES Identity
        "shreyansh.14010@gmail.com",
        "shreyansh@codemate.diy",
        subject,
        body
    );

    try {
        return await sesClient.send(sendEmailCommand);
    } catch (caught) {
        if (caught instanceof Error && caught.name === "MessageRejected") {
        const messageRejectedError = caught;
        return messageRejectedError;
        }
        throw caught;
    }
};
  
// snippet-end:[ses.JavaScript.email.sendEmailV3]
export { run };