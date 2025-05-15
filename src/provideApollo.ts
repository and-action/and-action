import { provideApollo } from 'apollo-angular';
import { inject } from '@angular/core';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { relayStylePagination } from '@apollo/client/utilities';

export function provideAndActionApollo() {
  return provideApollo(() => {
    const uri = 'https://api.github.com/graphql';
    const httpLink = inject(HttpLink);

    return {
      link: httpLink.create({ uri }),
      cache: new InMemoryCache({
        typePolicies: {
          User: {
            fields: {
              repositories: relayStylePagination(),
            },
          },
        },
      }),
    };
  });
}
