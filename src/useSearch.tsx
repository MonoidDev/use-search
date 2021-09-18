/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { useContext, useMemo } from 'react';

import * as t from 'io-ts';
import { parse, stringify } from 'query-string';
import type { Left } from 'fp-ts/lib/Either';

export class InvalidSearch {
  constructor(public message: string, public e: Left<t.Errors>) {}
}
export interface Router {
  pathname: string;
  search: string;
  navigate: (link: string) => void;
}

export interface UseSearchConfig {
  parse?: (q: string) => unknown;
  stringify?: (v: Record<string, unknown>) => string;
  errorPolicy?: 'throw' | 'return';
  useRouter?: () => Router;
  omitValue?: (value: unknown) => void;
}

export type ResolvedUseSearchConfig = typeof defaultSearchConfig;

export const defaultSearchConfig = {
  parse: (x: string) => parse(x, { arrayFormat: 'bracket-separator' }),
  stringify: (x: Record<string, unknown>) => stringify(x, { arrayFormat: 'bracket-separator' }),
  errorPolicy: 'throw',
  useRouter: () => {
    return {
      get pathname() {
        return location.pathname;
      },
      get search() {
        return location.search;
      },
      navigate(link: string) {
        location.href = link;
      },
    }
  },
  omitValue: (value: unknown) => value === undefined || value === null || (typeof value === 'string' && value.trim() === ''), 
} as const;

export const SearchConfigContext = React.createContext<UseSearchConfig>(defaultSearchConfig);

export interface UseSearchProviderProps {
  config?: UseSearchConfig;
}

export const SearchConfigProvider: React.FC<UseSearchProviderProps> = ({ children, config }) => {
  const finalConfig = {
    ...defaultSearchConfig,
    ...config,
  };

  return (
    <SearchConfigContext.Provider value={finalConfig}>
      {children}
    </SearchConfigContext.Provider>
  );
};

export function useSearch<T extends Record<string, unknown>>(type: t.Type<T>, config?: UseSearchConfig) {
  const contextConfig = useContext(SearchConfigContext) as ResolvedUseSearchConfig;
  const finalConfig = useMemo(() => ({
    ...contextConfig,
    ...config,
  }), [contextConfig, config]);

  const router = finalConfig.useRouter();

  const searchString = router.search;
  const pathname = router.pathname;

  const e = useMemo(
    () => type.decode(finalConfig.parse(searchString)),
    [type, searchString, finalConfig.parse],
  );

  if (e._tag === 'Left' && finalConfig.errorPolicy === 'throw') {
    throw new InvalidSearch('Invalid search', e);
  }

  const search = e._tag === 'Left' ? undefined : e.right;

  const setSearch = (p: T) => {
    const newSearchString = finalConfig.stringify(p);

    const optionalQuestionMark = newSearchString ? '?' : '';

    router.navigate(`${pathname}${optionalQuestionMark}${newSearchString}`);
  };

  return {
    search,
    errors: e._tag === 'Right' ? undefined : e.left,
    updateSearch: (p: Partial<T>) => {
      const newSearch = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...finalConfig.parse(searchString) as any,
        ...p,
      };

      for (const [key, value] of Object.entries(newSearch)) {
        if (finalConfig.omitValue(value)) {
          delete newSearch[key];
        }
      }

      setSearch(newSearch);
    },
    setSearch,
  }
}
