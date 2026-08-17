export const formatName = (rawValue: string): string => {
  // Оставляем только буквы (латиница, кириллица, ё), убираем пробелы и другие символы
  const cleanValue = rawValue.replace(/[^A-Za-zА-Яа-яЁё]/g, "");
  if (cleanValue === "") return "";
  // Первая буква заглавная, остальные строчные
  return cleanValue.charAt(0).toUpperCase() + cleanValue.slice(1).toLowerCase();
};
