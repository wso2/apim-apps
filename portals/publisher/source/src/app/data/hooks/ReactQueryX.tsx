import React, { useContext, useEffect, useState, FC } from "react";

type NTCacheContextType = {
  cache: {
    [key: string]: Promise<any>;
  };
};
const NTCacheContext = React.createContext<NTCacheContextType>({ cache: {} });
const { Provider: NTCacheProvider } = NTCacheContext;

export const QueryClientProviderX = ({ children }: { children: FC }) => {
  const { current: cache } = React.useRef({});
  return <NTCacheProvider value={{ cache }}>{children}</NTCacheProvider>;
};

export const useQuery = (cacheKey: string, fetcher: () => Promise<any>) => {
  const { cache } = useContext(NTCacheContext);
  const [data, setData] = useState(null);
  const [error, setError] = useState<null | Error>(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setIsLoading(true);
    (async () => {
      let cacheEntry = cache[cacheKey];
      if (!cacheEntry) {
        cacheEntry = cache[cacheKey] = fetcher();
      }
      try {
        const response = await cacheEntry;
        const jsonData = await response.clone().json();
        setData(jsonData);
      } catch (error) {
        console.error(error);
        setError(error as Error);
      }
    })();
  }, [cache, cacheKey, fetcher]);

  return { data, isLoading, error };
};
