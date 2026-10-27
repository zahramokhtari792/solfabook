import { saveOfflineSubscription } from '../services/offlineSubscription';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { uri } from '../services/URL';

export const fetchUser = createAsyncThunk('user/fetchUser', async (token, { getState }) => {
    const response = await axios.get(`${uri}/fetchUser`, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    if (getState().auth?.token !== token) return undefined;
    await saveOfflineSubscription(response.data, token);
    return response.data;
});

const userSlice = createSlice({
    name: 'user',
    initialState: {
        loading: false,
        data: null,
        error: ''
    },
    extraReducers: builder => {
        builder.addCase(fetchUser.pending, state => {
            state.loading = true
        })
        builder.addCase(fetchUser.fulfilled, (state, action) => {
            state.loading = false
            if (action.payload) state.data = action.payload
            state.error = ''
        })
        builder.addCase(fetchUser.rejected, (state, action) => {
            state.loading = false
            state.error = action.error.message
        })
    },
    reducers: {
        expireRewardedSubscription: (state) => {
            if (state.data?.subscription_source !== 'rewarded_ad') return;
            const expiry = Date.parse(state.data.ad_access_expires_at);
            if (!Number.isFinite(expiry) || expiry > Date.now()) return;
            state.data.active_subscription = 0;
            state.data.is_word = 0;
            state.data.is_offline_mode = 0;
            state.data.ad_online_access = 0;
            state.data.ad_access_expires_at = null;
            state.data.offline_access_expires_at = null;
            state.data.subscription_source = null;
        },
        emptyUser: (state) => {
            state.loading = false;
            state.data = null;
            state.error = '';
        }
    }
});

export const { emptyUser, expireRewardedSubscription } = userSlice.actions;

export default userSlice.reducer