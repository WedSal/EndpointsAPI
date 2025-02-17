import jwt from 'jsonwebtoken';

export const authenticate = () => ({
  before: async (request) => {
    try {
      
      const headers = request.event.headers;
      const authorizationHeader =
        headers.authorization || headers.Authorization;

      if (!authorizationHeader) {
        throw new Error('Authorization token is required');
      }

      const token = authorizationHeader.replace(/^Bearer\s/, '');

     
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      
      request.event.user = decoded;
    } catch (error) {
      console.error('Authentication error:', error.message);

      
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' }),
      };
    }
  },
});
