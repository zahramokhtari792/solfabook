import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser, expireRewardedSubscription } from '../slices/userSlice';
import { queryClient } from '../lib/queryClient';

/**
 * A rewarded subscription expires on the SERVER. This component also refreshes
 * the local subscription flags immediately when it expires or the app resumes.
 * No extra date conversion/formatting function is introduced.
 */
export default function RewardedSubscriptionSync({ navigationRef }) {
    const dispatch = useDispatch();
    const token = useSelector(state => state.auth?.token);
    const source = useSelector(state => state.user?.data?.subscription_source);
    const expiresAt = useSelector(state => state.user?.data?.ad_access_expires_at);

    useEffect(() => {
        if (!token || source !== 'rewarded_ad' || !expiresAt) return;

        let live = true;
        const checkExpiry = async () => {
            if (!live) return;
            // Expire local feature flags even without a network connection.
            if (Date.parse(expiresAt) <= Date.now()) dispatch(expireRewardedSubscription());
            const action = await dispatch(fetchUser(token));
            if (!live || !action.payload) return;
            if (Number(action.payload.active_subscription) !== 1) {
                // Never keep cached premium media after the server has revoked it.
                queryClient.removeQueries({ queryKey: ['pdf-reader-files'] });
                queryClient.invalidateQueries({ queryKey: ['my-files'] });
                queryClient.invalidateQueries({ queryKey: ['my-albums'] });
                const route = navigationRef.isReady() ? navigationRef.getCurrentRoute() : null;
                if (route && ['PDFReader', 'MusicPlayer', 'VideoPlayer', 'PictureAudio'].includes(route.name)) {
                    navigationRef.reset({ index: 0, routes: [{ name: 'MainLayout' }] });
                }
            }
        };

        const ms = new Date(expiresAt).getTime() - Date.now();
        const timeout = setTimeout(checkExpiry, Math.max(0, Math.min(ms + 500, 2147483647)));
        const listener = AppState.addEventListener('change', state => {
            if (state === 'active') checkExpiry();
        });
        return () => {
            live = false;
            clearTimeout(timeout);
            listener.remove();
        };
    }, [token, source, expiresAt, dispatch, navigationRef]);

    return null;
}
