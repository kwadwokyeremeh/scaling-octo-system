import Select from '@/components/ui/select/select';
import React from 'react';
import { useTypesQuery } from '@/graphql/type.graphql';
import { useTranslation } from 'next-i18next';
import cn from 'classnames';
import { QueryCategoriesHasTypeColumn } from '__generated__/__types__';
import { useRouter } from 'next/router';

type Props = {
  refetch: Function;
  className?: string;
};

export default function TypeFilter({ refetch, className }: Props) {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const { data, loading } = useTypesQuery({
    variables: {
      language: locale,
    },
    fetchPolicy: 'network-only',
  });

  return (
    <div className={cn('flex w-full', className)}>
      <div className="w-full">
        <Select
          options={data?.types}
          isLoading={loading}
          getOptionLabel={(option: any) => option.name}
          getOptionValue={(option: any) => option.slug}
          placeholder={t('common:filter-by-group-placeholder')}
          // @ts-ignore
          onChange={({ slug }: { slug: string }) => {
            refetch({
              page: 1,
              hasType: {
                column: QueryCategoriesHasTypeColumn.Slug,
                value: slug,
              },
            });
          }}
        />
      </div>
    </div>
  );
}
