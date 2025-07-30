import { createSlice } from '@reduxjs/toolkit';

export const languageSlice = createSlice({
    name: 'language',
    initialState: {
        lang: 'fa'
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