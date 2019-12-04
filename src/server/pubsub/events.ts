import { PubSub } from '@google-cloud/pubsub';

import { getGoogleCloudCredentials } from '../utils/google-cloud-credentials';
import { logger } from '../utils/logger';

const { GOOGLE_CLOUD_PUBSUB_TOPIC_NAME } = process.env;

export interface PlayerEvent {
  articleId: string;
  audiofileId: string;
  anonymousUserId: string;
  sessionId: string;
  event: string;
  device: string;
  timestamp: number;
  value: number;
  countryCode: string | null;
  regionCode: string | null;
  city: string | null;
}

const pubsub = new PubSub(getGoogleCloudCredentials());

if (!GOOGLE_CLOUD_PUBSUB_TOPIC_NAME) {
  const errorMessage = 'Required env variable "GOOGLE_CLOUD_PUBSUB_TOPIC_NAME" not set. Please add it.';
  logger.error(errorMessage);
  throw new Error(errorMessage);
}

// Make the pubsub client here, so we can re-use it
// Resulting in faster publishes
const pubsubClient = pubsub.topic(GOOGLE_CLOUD_PUBSUB_TOPIC_NAME, {
  batching: {
    maxMessages: 1,
    maxMilliseconds: 1
  }
})

export async function publishEvent(event: PlayerEvent) {
  const loggerPrefix = 'Publish Event to Google Cloud PubSub:';

  try {
    const buffer = Buffer.from(
      JSON.stringify(event)
    );

    logger.info(loggerPrefix, 'Publishing...', event);

    const result = await pubsubClient.publish(buffer);

    logger.info(loggerPrefix, 'Published to:', GOOGLE_CLOUD_PUBSUB_TOPIC_NAME);

    return result;
  } catch (err) {

    throw err;
  }
}
