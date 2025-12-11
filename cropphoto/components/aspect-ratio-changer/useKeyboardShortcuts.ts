import { useEffect, useRef } from "react";
import { tinykeys } from "tinykeys";

export default function useKeyboardShortcuts(toSave: () => void, toCopy: () => void, dependencies: any[] = []) {
  const save = useRef(toSave);
  const copy = useRef(toCopy);
  
  useEffect(() => {
    save.current = toSave;
    copy.current = toCopy;
  }, [toSave, toCopy, ...dependencies]);

  useEffect(() => {
    const unsubscribe = tinykeys(window, {
      "$mod+KeyS": (event) => {
        event.preventDefault();
        save.current && save.current();
      },
      "$mod+KeyC": (event) => {
        event.preventDefault();
        copy.current && copy.current();
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);
}

