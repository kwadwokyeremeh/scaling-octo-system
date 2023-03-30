import type { GetStaticProps } from 'next';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { addApolloState, initializeApollo } from './client';
import { AUTHORS_PER_PAGE } from './client/variables';
import { AuthorsDocument } from './gql/authors.graphql';
import { GroupsDocument } from './gql/groups.graphql';
import { SettingsDocument } from './gql/settings.graphql';
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const apolloClient = initializeApollo();
  await apolloClient.query({
    query: SettingsDocument,
    variables: {
      language: locale
    }
  });
  await apolloClient.query({
    query: GroupsDocument,
    variables: {
      language: locale
    }
  });
  await apolloClient.query({
    query: AuthorsDocument,
    variables: {
      first: AUTHORS_PER_PAGE,
      language: locale
    },
  });
  return addApolloState(apolloClient, {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
    },
  });
};
