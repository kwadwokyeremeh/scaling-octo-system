import SelectInput from '@/components/ui/select-input';
import Label from '@/components/ui/label';
import { Control, useWatch, useFormState } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import { useManufacturersQuery } from '@/data/manufacturer';
import { useRouter } from 'next/router';

interface Props {
  control: Control<any>;
  setValue: any;
}

const ProductManufacturerInput = ({ control, setValue }: Props) => {
  const { t } = useTranslation();
  const { locale } = useRouter();

  const type = useWatch({
    control,
    name: 'type',
  });
  const { dirtyFields } = useFormState({
    control,
  });
  useEffect(() => {
    if (type?.slug && dirtyFields?.type) {
      setValue('manufacturer', []);
    }
  }, [type?.slug]);

  const { manufacturers, loading } = useManufacturersQuery({
    limit: 1000,
    is_approved: true,
    ...(type && {
      type: type?.slug,
    }),
    language: locale,
  });

  return (
    <div className="mb-5">
      <Label>{t('common:text-manufacturers')}</Label>
      <SelectInput
        name="manufacturer"
        control={control}
        getOptionLabel={(option: any) => option.name}
        getOptionValue={(option: any) => option.id}
        // @ts-ignore
        options={manufacturers}
        isLoading={loading}
      />
    </div>
  );
};

export default ProductManufacturerInput;
