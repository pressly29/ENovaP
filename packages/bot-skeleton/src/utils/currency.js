import { addComma, getDecimalPlaces, isCryptocurrency } from '@deriv/shared';

// Removed from @deriv/shared in the new template; the trade engine still needs them.
export const getRoundedNumber = (number, currency) => Number(Number(number).toFixed(getDecimalPlaces(currency)));

export const getFormattedText = (number, currency) =>
    `${addComma(number, getDecimalPlaces(currency), isCryptocurrency(currency))} ${currency}`;
