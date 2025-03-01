import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.NOTES_TABLE;

export const getNotes = async (userId) => {
  const params = {
    TableName: TABLE_NAME,
    FilterExpression: 'userId = :userId',
    ExpressionAttributeValues: { ':userId': userId },
  };

  try {
    const result = await dynamoDb.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error('Error fetching notes:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};

export const addNote = async (noteData) => {
  const { title, text, userId } = noteData;

  if (!title || !text) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Title and text are required' }),
    };
  }

  const timestamp = new Date().toISOString();
  const params = {
    TableName: TABLE_NAME,
    Item: {
      id: uuidv4(),
      title,
      text,
      userId,
      createdAt: timestamp,
      modifiedAt: timestamp,
    },
  };

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Note created successfully' }),
    };
  } catch (error) {
    console.error('Error adding note:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to add note' }),
    };
  }
};

export const updateNote = async (noteData) => {
  const { id, title, text, userId } = noteData;

  if (!id || !title || !text) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'ID, title, and text are required' }),
    };
  }

  const params = {
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set #title = :title, #text = :text, modifiedAt = :modifiedAt',
    ExpressionAttributeNames: {
      '#title': 'title',
      '#text': 'text',
    },
    ExpressionAttributeValues: {
      ':title': title,
      ':text': text,
      ':modifiedAt': new Date().toISOString(),
    },
    ReturnValues: 'ALL_NEW',
  };

  try {
    const result = await dynamoDb.update(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
  } catch (error) {
    console.error('Error updating note:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to update note' }),
    };
  }
};

export const deleteNote = async (id, userId) => {
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'ID is required' }),
    };
  }

  const params = {
    TableName: TABLE_NAME,
    Key: { id },
    ConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  };

  try {
    await dynamoDb.delete(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Note deleted successfully' }),
    };
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
    return { statusCode: 404,
    body: JSON.stringify({ message: 'Note not found or you do not have permission to delete it' }),
  };
} else {
  console.error('Error deleting note:', error);
  return {
    statusCode: 500,
    body: JSON.stringify({ message: 'Failed to delete note' }),
  };
}
}
};
