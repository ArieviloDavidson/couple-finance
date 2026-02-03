export const parseDateToNoon = (dateString) => {
    if (!dateString) return new Date();
    const [year, month, day] = dateString.split('-');
    // Cria a data ao meio-dia para evitar problemas de fuso horário (UTC-3 vs UTC)
    return new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0);
};
