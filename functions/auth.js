import AWS from 'aws-sdk';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE;
const JWT_SECRET = process.env.JWT_SECRET;


export const signup = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body);

   
    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Email and password are required' }),
      };
    }

    
    const userParams = {
      TableName: USERS_TABLE,
      Key: { email },
    };
    const userResult = await dynamoDb.get(userParams).promise();

    if (userResult.Item) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: 'User already exists' }),
      };
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const newUser = {
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    const putParams = {
      TableName: USERS_TABLE,
      Item: newUser,
    };

    await dynamoDb.put(putParams).promise();

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'User created successfully' }),
    };
  } catch (error) {
    console.error('Error in signup function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};


export const login = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body);

    
    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Email and password are required' }),
      };
    }

    
    const userParams = {
      TableName: USERS_TABLE,
      Key: { email },
    };
    const userResult = await dynamoDb.get(userParams).promise();

    if (!userResult.Item) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid email or password' }),
      };
    }

    
    const isPasswordValid = await bcrypt.compare(password, userResult.Item.password);

    if (!isPasswordValid) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid email or password' }),
      };
    }

    
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });

    return {
      statusCode: 200,
      body: JSON.stringify({ token }),
    };
  } catch (error) {
    console.error('Error in login function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
