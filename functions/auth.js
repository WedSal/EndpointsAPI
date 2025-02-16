import jwt from 'jsonwebtoken';

export const authenticate = () => {
  return {
    before: async (handler) => {
      const token = handler.event.headers.authorization.replace(/^Bearer\s/, '');
      if (!token) {
        throw new Error('Authorization token is required');
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        handler.event.user = decoded;
      } catch (error) {
        throw new Error('Invalid or expired token');
      }
    },
  };
};
