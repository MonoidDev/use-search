# Type-checked query string

> `use-search` is a simple library that helps your deal with all the shit with the query string on the url-bar. Handle `search` like you `React.useState`, with validation against arbitrary input!

## Install

```
yarn add @monoid-dev/use-search
```

## Usage

```tsx
import React from 'react';
import ReactDOM from 'react-dom';

import * as t from 'io-ts'; // For more information about io-ts, please click https://gcanti.github.io/io-ts/

import useSearch, { SearchConfigProvider } from '@monoid-dev/use-search';

export const Page = () => {
  const {
    search, // The parsed { id: string | undefined } object
    updateSearch, // The method to update the object
  } = useSearch(t.type({
    id: t.union([t.undefined,  t.string]),  // Define your query type here
  }));

  return (
    <>
      {JSON.stringify(search)}

      <button
        onClick={() => updateSearch({ id: String(parseInt(search?.id ?? '0') + 1) })}
      >
        Update Search
      </button>
    </>
  );
};

ReactDOM.render((
  <SearchConfigProvider>
    <Page />
  </SearchConfigProvider>
), document.body);
```

## APIs

+ useSearch

  ```tsx
  function useSearch<T>(type: t.Type<T>, config?: UseSearchConfig)
  ```
  Parameters:
    + `type` The `io-ts` type of the parsed search.
    + `config` The local [configuration](#UseSearchConfig) for the search, shallowly merged with the current `UseSearchConfig` in the context.

  Return Type:
    + `search: T | undefined` The parsed and validated search string. Returns `undefined` when there's an error.
    + `setSearch: T` Reset the search string, navigating to the new href.
    + `updateSearch: Partial<T>` Partially update the search string, navigating to the new href.

+ UseSearchConfig

```tsx
interface UseSearchConfig {
  parse?: (q: string) => unknown; // The method to parse the search string, by default using `query-string` with `{ arrayFormat: 'bracket-separator' }`.
  stringify?: (v: Record<string, unknown>) => string; // The method to stringify the search string from your object, by default using `query-string` with `{ arrayFormat: 'bracket-separator' }`.
  errorPolicy?: 'throw' | 'return'; // If 'throw', throws an error when an error happens. Warning: will cause a white screen when ErrorBoundary is not set up.
  useRouter?: () => Router; // The function that returns a Router object. It is called once per rendering thus safe to pass a React hook here. By default uses the native window.location methods. See API Router.
  omitValue?: (value: unknown) => void; // When to omit value in the query string. By default we omit `undefiend`, `null` and empty or all-whitespace strings.
}
```

+ Router

```tsx
interface Router {
  pathname: string; // The current pathname, e.g. the `/search` https://www.google.com.hk/search?q=ErrorBoundary
  search: string; // The current search
  navigate: (link: string) => void; // The method to redirect to new page
}
```

Recipes:

+ For `nextjs`

  ```tsx
  import { useRouter as useNextRouter } from 'next/router';

  // Wrap your tree with global configuration
  const useRouter = () => {
    const router = useNextRouter();

    return {
      get pathname() {
        return router.pathname;
      },
      get search() {
        return router.asPath.split('?')[1] ?? '';
      },
      navigate(link: string) {
        router.push(link);
      },
    };
  };

  // In _app.tsx
  function MyApp({ Component, pageProps }: any) {
    return (
      <SearchConfigProvider
        config={{
          useRouter,
        }}
      >
        <Component {...pageProps} />
      </SearchConfigProvider>
    );
  }

  export default MyApp;
  ```

  Note that, per NextJS document, [router](https://nextjs.org/docs/api-reference/next/router), does not include query information if the page is static. So you'll need the page to be serverside-generated or you'll face an inconsistency in the rehydration step! Or, you can leverage `useEffect` for static pages.

+ For `react-router-dom`

  TBD