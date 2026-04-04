import { useMessContext } from '../context/MessContext';

export function useMess() {
  const ctx = useMessContext();
  return ctx;
}

export { useMess };
export default useMess;
