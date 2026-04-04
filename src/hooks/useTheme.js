import { useThemeContext } from '../context/ThemeContext';

const useTheme = () => {
  const ctx = useThemeContext();
  return ctx;
}

export { useTheme };
export default useTheme;
