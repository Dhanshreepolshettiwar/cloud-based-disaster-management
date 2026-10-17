import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const isAwsLive = process.env.USE_AWS === 'true' && process.env.AWS_REGION;
const topicArn = process.env.DISASTER_SNS_TOPIC_ARN || '';

let snsClient: SNSClient | null = null;

if (isAwsLive) {
  snsClient = new SNSClient({
    region: process.env.AWS_REGION || 'us-east-1',
  });
}

export interface EmergencyNotificationPayload {
  alertId: string;
  title: string;
  severity: string;
  affectedRegions: string[];
  instructions: string;
}

export const snsService = {
  isLiveAws(): boolean {
    return !!snsClient;
  },

  async publishEmergencyAlert(payload: EmergencyNotificationPayload): Promise<{ messageId: string }> {
    const messageBody = `
[DISASTER ALERT - ${payload.severity.toUpperCase()}]
${payload.title}

AFFECTED REGIONS: ${payload.affectedRegions.join(', ')}

INSTRUCTIONS:
${payload.instructions}

DISCLAIMER: This alert is issued by the Cloud-Based Disaster Management Authority. In case of immediate life hazard, contact official local emergency telephone lines immediately.
    `.trim();

    if (snsClient && topicArn) {
      const command = new PublishCommand({
        TopicArn: topicArn,
        Subject: `[${payload.severity}] Emergency Alert: ${payload.title.substring(0, 80)}`,
        Message: messageBody,
        MessageAttributes: {
          severity: {
            DataType: 'String',
            StringValue: payload.severity,
          },
          alertId: {
            DataType: 'String',
            StringValue: payload.alertId,
          },
        },
      });

      const response = await snsClient.send(command);
      return { messageId: response.MessageId || `sns-${Date.now()}` };
    }

    // Local / offline simulation
    console.log(`[LOCAL SNS SIMULATION] Publishing alert to simulated topic: ${payload.title}`);
    return { messageId: `mock-msg-${Date.now()}` };
  },
};
