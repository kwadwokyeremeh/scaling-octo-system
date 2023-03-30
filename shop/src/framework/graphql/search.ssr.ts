import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import invariant from 'tiny-invariant';
import { addApolloState, initializeApollo } from './client';
import { CategoriesDocument } from './gql/categories.graphql';
import { SettingsDocument } from './gql/settings.graphql';
import { getCategories } from "@/framework/utils/categories";
export const getServerSideProps: GetServerSideProps = async ({
  locale,
  params,
}) => {
  invariant(params, 'params is required');
  const { searchType } : any = params;
  const apolloClient = initializeApollo();
  await apolloClient.query({
    query: SettingsDocument,
    variables: {
      language: locale
    }
  });
  await apolloClient.query({
    query: CategoriesDocument,
    variables: getCategories({
      type: searchType,
      limit: 1000,
      language: locale
    })
  });
  return addApolloState(apolloClient, {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
    },
  });
};
