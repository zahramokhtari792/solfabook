import { createSlice } from '@reduxjs/toolkit';

export const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: null,
        deviceInfo: null
    },
    reducers: {
        setToken: (state, action) => {
            state.token = action.payload;
        },
        setDeviceInfo: (state, action) => {
            state.deviceInfo = action.payload;
        },
        removeToken: (state, action) => {
            state.token = null;
        },
    }
});

export const { setToken, removeToken, setDeviceInfo } = authSlice.actions;

export default authSlice.reducer