import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { uri } from '../services/URL';

export const fetchContacts = createAsyncThunk('contact/contact', async () => {
    return await axios
        .get(`${uri}/contact`)
        .then(response => response.data)
        .catch(error => {
            console.log(error,'*');
            throw new Error(error.response?.data?.message || error.message);
        })
})

const contactSlice = createSlice({
    name: 'contacts',
    initialState: {
        loading: false,
        data: null,
        error: ''
    },
    extraReducers: builder => {
        builder.addCase(fetchContacts.pending, state => {
            state.loading = true
        })
        builder.addCase(fetchContacts.fulfilled, (state, action) => {
            state.loading = false
            state.data = action.payload
            state.error = ''
        })
        builder.addCase(fetchContacts.rejected, (state, action) => {
            state.loading = false
            state.data = null
            state.error = action.error.message
        })
    },
});

export default contactSlice.reducer