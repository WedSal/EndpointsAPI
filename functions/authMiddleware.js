// functions/authMiddleware.js

import jwt from 'jsonwebtoken';

export const authenticate = () => ({
  before: async (request) => {
    try {
      // Normalize headers to handle different casing
      const headers = request.event.headers;
      const authorizationHeader =
        headers.authorization || headers.Authorization;

      if (!authorizationHeader) {
        throw new Error('Authorization token is required');
      }

      const token = authorizationHeader.replace(/^Bearer\s/, '');

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user information to the event object
      request.event.user = decoded;
    } catch (error) {
      console.error('Authentication error:', error.message);

      // Return an unauthorized response
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' }),
      };
    }
  },
});
