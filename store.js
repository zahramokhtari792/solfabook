import { configureStore } from '@reduxjs/toolkit';
import userSlice from './slices/userSlice';
import contactSlice from './slices/contactSlice';
import  authSlice  from './slices/authSlice'; 
import languageSlice from './slices/languageSlice';
export default configureStore({
  reducer: {
    auth: authSlice,
    lang: languageSlice,
    user: userSlice,
    contacts: contactSlice,
  }
})