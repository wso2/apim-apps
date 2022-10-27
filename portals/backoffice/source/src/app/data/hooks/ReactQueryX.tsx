/**
 * Copyright (c) 2021, WSO2 Inc. (http://wso2.com) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
NOTE: ReactQueryX is a simple state management implementation to manage data fetching & sharing via a context.
This is meant to be used for fetch and use data in READONLY manner, Do not support data mutations,
DO NOT extend this implementation to allow data mutations, If come up with such requirement use ReactQuery or SWR
*/
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
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setIsLoading(true);
    (async () => {
      let cacheEntry = cache[cacheKey];
      if (!cacheEntry) {
        cacheEntry = cache[cacheKey] = fetcher();
      }
      try {
        const response = await cacheEntry;
        let jsonData = response;
        if(response.clone) {
            jsonData = await response.clone().json();
        }
        setData(jsonData);
      } catch (error) {
        console.error(error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [cache, cacheKey, fetcher]);

  return { data, isLoading, error };
};
