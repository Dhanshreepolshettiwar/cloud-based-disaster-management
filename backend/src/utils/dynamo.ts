import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

const isAwsLive = process.env.USE_AWS === 'true' && process.env.AWS_REGION;

let docClient: DynamoDBDocumentClient | null = null;

if (isAwsLive) {
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
  });
  docClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true,
      convertEmptyValues: true,
    },
  });
}

// Memory cache for local testing / offline emulation
const inMemoryStore: Record<string, Map<string, any>> = {};

function getStore(tableName: string): Map<string, any> {
  if (!inMemoryStore[tableName]) {
    inMemoryStore[tableName] = new Map();
  }
  return inMemoryStore[tableName];
}

export const dynamoService = {
  isLiveAws(): boolean {
    return !!docClient;
  },

  async getItem<T>(tableName: string, key: Record<string, any>): Promise<T | null> {
    if (docClient) {
      const command = new GetCommand({ TableName: tableName, Key: key });
      const result = await docClient.send(command);
      return (result.Item as T) || null;
    }

    // Local in-memory emulation
    const keyVal = Object.values(key).join('#');
    const store = getStore(tableName);
    return (store.get(keyVal) as T) || null;
  },

  async putItem<T extends Record<string, any>>(tableName: string, item: T, keyField: string = 'id'): Promise<T> {
    if (docClient) {
      const command = new PutCommand({ TableName: tableName, Item: item });
      await docClient.send(command);
      return item;
    }

    const keyVal = item[keyField] || Object.values(item)[0];
    const store = getStore(tableName);
    store.set(String(keyVal), { ...item });
    return item;
  },

  async scanItems<T>(tableName: string, filterExp?: string, expValues?: Record<string, any>): Promise<T[]> {
    if (docClient) {
      const command = new ScanCommand({
        TableName: tableName,
        FilterExpression: filterExp,
        ExpressionAttributeValues: expValues,
      });
      const result = await docClient.send(command);
      return (result.Items as T[]) || [];
    }

    const store = getStore(tableName);
    return Array.from(store.values()) as T[];
  },

  async queryItems<T>(
    tableName: string,
    indexName?: string,
    keyCondition?: string,
    expValues?: Record<string, any>
  ): Promise<T[]> {
    if (docClient) {
      const command = new QueryCommand({
        TableName: tableName,
        IndexName: indexName,
        KeyConditionExpression: keyCondition,
        ExpressionAttributeValues: expValues,
      });
      const result = await docClient.send(command);
      return (result.Items as T[]) || [];
    }

    // Local fallback: filter by expression values
    const store = getStore(tableName);
    const all = Array.from(store.values()) as T[];
    return all;
  },

  async deleteItem(tableName: string, key: Record<string, any>): Promise<boolean> {
    if (docClient) {
      const command = new DeleteCommand({ TableName: tableName, Key: key });
      await docClient.send(command);
      return true;
    }

    const keyVal = Object.values(key).join('#');
    const store = getStore(tableName);
    return store.delete(keyVal);
  },
};
