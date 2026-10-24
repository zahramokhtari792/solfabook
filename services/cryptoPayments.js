import axios from 'axios';
import { uri } from './URL';

const authorized = (token) => ({
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
});

export const getCryptoSettings = async () => {
    const result = await axios.get(`${uri}/crypto/settings`);
    return result.data;
};


export const createCryptoPayment = async (token, data) => {
    const result = await axios.post(`${uri}/crypto/payments`, data, authorized(token));
    return result.data;
};

export const getCryptoPaymentStatus = async (token, orderId) => {
    const result = await axios.get(`${uri}/crypto/payments/${encodeURIComponent(orderId)}`, authorized(token));
    return result.data;
};

