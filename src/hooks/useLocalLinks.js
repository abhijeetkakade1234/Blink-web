import { useEffect, useState } from "react";

const storageKey = "blink-links";

export default function useLocalLinks() {
  const [links, setLinks] = useState(() => {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(links));
  }, [links]);

  return { links, setLinks };
}
