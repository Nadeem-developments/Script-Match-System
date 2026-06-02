"use client";
import { SWRConfig } from "swr";

export const SWRProvider = ({ children }) => {
  return (
    <SWRConfig
      value={{
        fetcher: (url) => fetch(url).then((res) => res.json()),
        revalidateOnFocus: false,
      }}>
      {children}
    </SWRConfig>
  );
};
