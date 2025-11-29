
import { BCV_RATE } from '../constants';

export const convertToVes = (usdPrice: number): number => {
    return usdPrice * BCV_RATE;
};

export const formatPrice = (price: number, currency: 'USD' | 'VES'): string => {
    const currencyCode = currency === 'VES' ? 'VEF' : currency;
    const options: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    };

    try {
        const formatter = new Intl.NumberFormat('es-VE', options);
        return formatter.format(price);
    } catch (e) {
        // Fallback for environments that might not support 'es-VE' or 'VEF'
        return `${currency === 'USD' ? '$' : 'Bs.'}${price.toFixed(2)}`;
    }
};
