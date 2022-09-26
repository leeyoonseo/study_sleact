import { useState, useCallback, ChangeEvent, Dispatch, SetStateAction } from 'react';

export type ChangeInputEvent = ChangeEvent<HTMLInputElement>; 
type ReturnTypes<T = any> = [T, (e: ChangeInputEvent) => void, Dispatch<SetStateAction<T>>];

const useInput = <T>(initialData: T): ReturnTypes<T> => {
  const [value, setValue] = useState(initialData);
  const handler = useCallback((e: ChangeInputEvent) => {
    const { value } = e.target;
    setValue((value as unknown as T));
  }, []);

  return [value, handler, setValue];
};

export default useInput;