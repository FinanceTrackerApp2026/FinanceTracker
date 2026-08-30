import { ApolloClient, HttpLink, InMemoryCache, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const graphqlUrl =
  import.meta.env.VITE_GRAPHQL_URL?.trim() || 'http://localhost:8080/query';

export const apolloClient = new ApolloClient({
  link: from([
    setContext((_, { headers }) => {
      const token = sessionStorage.getItem('finance-tracker-token');
      return {
        headers: {
          ...headers,
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      };
    }),
    new HttpLink({ uri: graphqlUrl }),
  ]),
  cache: new InMemoryCache(),
});
