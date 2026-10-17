import fs from 'fs';
import path from 'path';
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

// Persistent Disk Database for Local Server execution
const DATA_FILE = path.resolve(__dirname, '../../data/disaster_database.json');

function loadDiskStore(): Record<string, Record<string, any>> {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.warn('Could not read disk store, initializing new store:', e);
  }
  return {};
}

function saveDiskStore(store: Record<string, Record<string, any>>): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed to save to disk store:', e);
  }
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

    // Local persistent disk storage
    const store = loadDiskStore();
    const tableData = store[tableName] || {};
    const keyVal = Object.values(key).join('#');
    return (tableData[keyVal] as T) || null;
  },

  async putItem<T extends Record<string, any>>(tableName: string, item: T, keyField: string = 'id'): Promise<T> {
    if (docClient) {
      const command = new PutCommand({ TableName: tableName, Item: item });
      await docClient.send(command);
      return item;
    }

    const store = loadDiskStore();
    if (!store[tableName]) {
      store[tableName] = {};
    }

    const keyVal = item[keyField] || Object.values(item)[0];
    store[tableName][String(keyVal)] = { ...item };
    saveDiskStore(store);
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

    const store = loadDiskStore();
    const tableData = store[tableName] || {};
    return Object.values(tableData) as T[];
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

    const store = loadDiskStore();
    const tableData = store[tableName] || {};
    return Object.values(tableData) as T[];
  },

  async deleteItem(tableName: string, key: Record<string, any>): Promise<boolean> {
    if (docClient) {
      const command = new DeleteCommand({ TableName: tableName, Key: key });
      await docClient.send(command);
      return true;
    }

    const store = loadDiskStore();
    if (store[tableName]) {
      const keyVal = Object.values(key).join('#');
      delete store[tableName][keyVal];
      saveDiskStore(store);
      return true;
    }
    return false;
  },
};
