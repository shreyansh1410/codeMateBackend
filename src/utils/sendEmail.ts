import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "./sesClient";

const createSendEmailCommand = (
  toAddress: string,
  fromAddress: string,
  subject: string,
  body: string
) => {
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

const run = async (
  toAddress: string,
  fromAddress: string,
  subject: string,
  body: string
) => {
  try {
    // Use the provided parameters instead of hardcoded values
    const sendEmailCommand = createSendEmailCommand(
      "shreyansh.14010@gmail.com",
      "shreyansh@codemate.diy",
      subject,
      body
    );

    const result = await sesClient.send(sendEmailCommand);
    return { success: true, messageId: result.MessageId };
  } catch (error) {
    console.error("Error sending email:", error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        name: error.name,
        stack: error.stack,
      };
    }
    return { success: false, error: String(error) };
  }
};

export { run };
