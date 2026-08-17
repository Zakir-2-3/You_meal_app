export const formatEmail = (rawValue: string, maxLength = 30): string => {
  // Удаляем все пробелы, ограничиваем длину
  return rawValue.replace(/\s/g, "").slice(0, maxLength);
};
