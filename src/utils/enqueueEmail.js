import { SendMessageCommand } from "@aws-sdk/client-sqs";
import sqsClient from "../config/sqsClient.js";

export class EmailQueueUnavailableError extends Error {
  constructor() {
    super("Email queue is not configured. Set EMAIL_QUEUE_URL in your environment.");
    this.name = "EmailQueueUnavailableError";
    this.status = 503;
  }
}

function getQueueUrl() {
  const queueUrl = process.env.EMAIL_QUEUE_URL;
  if (!queueUrl) {
    throw new EmailQueueUnavailableError();
  }
  return queueUrl;
}

export async function enqueueEmail(job) {
  const queueUrl = getQueueUrl();
  await sqsClient.send(
    new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(job),
    })
  );
}

async function runWithConcurrency(items, concurrency, fn) {
  let index = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (index < items.length) {
      const i = index++;
      await fn(items[i], i);
    }
  });
  await Promise.all(workers);
}

export async function enqueueEmailBatch(jobs, { concurrency = 10 } = {}) {
  if (!jobs.length) return 0;
  getQueueUrl();
  await runWithConcurrency(jobs, concurrency, (job) => enqueueEmail(job));
  return jobs.length;
}
