import { useThemeContext } from '../context/ThemeContext';

export function useTheme() {
  const ctx = useThemeContext();
  return ctx;
}

export { useTheme };
export default useTheme;
