import React from 'react';
import ReactDOM from 'react-dom';

import * as t from 'io-ts';

import useSearch, { SearchConfigProvider } from '.';

export const Page = () => {
  const {
    search,
    updateSearch,
  } = useSearch(t.type({
    id: t.union([t.undefined,  t.string]),
  }));

  return (
    <>
      {JSON.stringify(search)}

      <button
        onClick={() => updateSearch({ id: String(parseInt(search?.id ?? '0') + 1), })}
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