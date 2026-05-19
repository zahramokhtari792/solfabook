import { createSlice } from '@reduxjs/toolkit';

export const languageSlice = createSlice({
    name: 'language',
    initialState: {
        lang: 'en'
    },
    reducers: {
        setLanguage: (state, action) => {
            state.lang = action.payload;
        },
        removeLanguage: (state) => {
            state.lang = null;
        },
    }
});

export const { setLanguage, removeLanguage } = languageSlice.actions;

export default languageSlice.reducer