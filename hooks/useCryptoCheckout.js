import { useCallback, useEffect, useRef } from 'react';
import { AppState, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { createCryptoPayment, getCryptoPaymentStatus } from '../services/cryptoPayments';
import { handleError, showToastOrAlert } from '../helpers/Common';

/**
 * Paymento owns the checkout screen. Only the backend's verified order status
 * can confirm success. Returning from the browser is never considered payment.
 */
export const useCryptoCheckout = (token, onPaid) => {
    const { t } = useTranslation();
    const orderRef = useRef(null);
    const paidRef = useRef(onPaid);
    paidRef.current = onPaid;

    const checkPending = useCallback(async () => {
        const orderId = orderRef.current;
        if (!orderId || !token) return;
        try {
            const status = await getCryptoPaymentStatus(token, orderId);
            if (status?.status === 'paid' && status?.fulfilled === true) {
                orderRef.current = null;
                showToastOrAlert(t('Crypto payment confirmed'));
                paidRef.current?.();
            } else if (['expired', 'cancelled', 'rejected', 'failed', 'review'].includes(status?.status)) {
                orderRef.current = null;
                showToastOrAlert(status?.status === 'review'
                    ? t('Crypto payment review')
                    : t('Crypto payment failed'));
            }
        } catch (error) {
            // Network errors must not be treated as canceled/paid payments.
            console.warn('Unable to refresh Paymento status', error?.message);
        }
    }, [token, t]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') checkPending();
        });
        // Also check while the app remains in the foreground on web.
        const timer = setInterval(checkPending, 8000);
        return () => { subscription.remove(); clearInterval(timer); };
    }, [checkPending]);

    const payWithCrypto = useCallback(async (fileId) => {
        if (!token) return;
        try {
            const payment = await createCryptoPayment(token, { file_id: fileId });
            orderRef.current = payment.order_id;
            await Linking.openURL(payment.gateway_url);
            showToastOrAlert(t('Crypto payment pending'));
        } catch (error) {
            handleError(error);
        }
    }, [token, t]);

    return { payWithCrypto, checkPending };
};
