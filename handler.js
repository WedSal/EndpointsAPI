import middy from '@middy/core';
import { authenticate } from './functions/authMiddleware.js';
import { 
  getNotes as getNotesFromDb, 
  addNote as addNoteToDb, 
  updateNote as updateNoteInDb, 
  deleteNote as deleteNoteFromDb 
} from './functions/notes.js';

import { signup, login } from './functions/auth.js';  
export{signup, login};

const getNotesHandler = async (event) => {
  try {
    const userId = event.user.email; // Get user ID from JWT
    return await getNotesFromDb(userId);
  } catch (error) {
    console.error('Error in getNotesHandler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};

const addNoteHandler = async (event) => {
  try {
    const noteData = JSON.parse(event.body);
    noteData.userId = event.user.email;
    return await addNoteToDb(noteData);
  } catch (error) {
    console.error('Error in addNoteHandler:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid Request' }),
    };
  }
};

const updateNoteHandler = async (event) => {
  try {
    const noteData = JSON.parse(event.body);
    noteData.userId = event.user.email;
    return await updateNoteInDb(noteData);
  } catch (error) {
    console.error('Error in updateNoteHandler:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid Request' }),
    };
  }
};

const deleteNoteHandler = async (event) => {
  try {
    const { id } = event.pathParameters;
    const userId = event.user.email;

    if (!id || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid request parameters' }),
      };
    }
    return await deleteNoteFromDb(id, userId);
  } catch (error) {
    console.error('Error in deleteNoteHandler:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid Request' }),
    };
  }
};


export const getNotes = middy(getNotesHandler).use(authenticate());
export const addNote = middy(addNoteHandler).use(authenticate());
export const updateNote = middy(updateNoteHandler).use(authenticate());
export const deleteNote = middy(deleteNoteHandler).use(authenticate());
