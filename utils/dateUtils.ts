
export const calculateDaysRemaining = (isoDateString: string | null): number | null => {
    if (!isoDateString) return null;
    const expiryDate = new Date(isoDateString);
    const now = new Date();
    // If the subscription has expired, return 0 days.
    if (expiryDate < now) return 0;
    const diffTime = expiryDate.getTime() - now.getTime();
    // Calculate the number of days, rounding up to count partial days as a full day.
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};
