import Input from '@/components/ui/input';
import { useFieldArray, useForm } from 'react-hook-form';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import Card from '@/components/common/card';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-toastify';
import {
  useCreateAttributeMutation,
  useUpdateAttributeMutation,
} from '@/graphql/attributes.graphql';
import { useEffect, useState } from 'react';
import Alert from '@/components/ui/alert';
import { Attribute, AttributeValue } from '__generated__/__types__';
import { getErrorMessage } from '@/utils/form-error';
import { useShopLazyQuery } from '../../../__generated__/src/graphql/shops.graphql';
import { Routes } from '@/config/routes';
import { Config } from '@/config';

type FormValues = {
  name?: string | null;
  values: any;
};

type IProps = {
  initialValues?: Attribute | null;
};
export default function CreateOrUpdateAttributeForm({ initialValues }: IProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    query: { shop },
  } = router;
  const { t } = useTranslation();
  const [getShop, { data: shopData }] = useShopLazyQuery();

  useEffect(() => {
    if (shop) {
      getShop({
        variables: {
          slug: shop as string,
        },
      });
    }
  }, [shop]);

  const shopId = shopData?.shop?.id!;
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: initialValues ? initialValues : { name: '', values: [] },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'values',
  });
  const [createAttribute, { loading: creating }] = useCreateAttributeMutation({
    onCompleted: async () => {
      setErrorMessage(null);
      const generateRedirectUrl = shop
        ? `/${shop}${Routes.attribute.list}`
        : Routes.attribute.list;
      await router.push(generateRedirectUrl, undefined, {
        locale: Config.defaultLanguage,
      });

      toast.success(t('common:create-success'));
    },
    onError: (error) => {
      setErrorMessage(error?.message);
    },
  });
  const [updateAttribute, { loading: updating }] = useUpdateAttributeMutation({
    onCompleted: () => {
      toast.success(t('common:update-success'));
    },
  });
  const onSubmit = async (values: FormValues) => {
    const input = {
      language: router.locale,
      name: values.name!,
    };

    try {
      if (
        !initialValues ||
        !initialValues?.translated_languages?.includes(router?.locale!)
      ) {
        await createAttribute({
          variables: {
            input: {
              ...input,
              shop_id: shopId ?? initialValues?.shop_id,
              values: values.values.map(({ id: _id, value, meta }: any) => ({
                value,
                meta,
                language: router.locale,
              })),
              ...(initialValues?.slug && { slug: initialValues.slug }),
            },
          },
        });
      } else {
        const { data } = await updateAttribute({
          variables: {
            input: {
              ...input,
              id: initialValues.id!,
              shop_id: initialValues?.shop_id,
              values: values.values.map(({ id, value, meta }: any) => ({
                id: Number(id),
                value,
                meta,
                language: router.locale,
              })),
            },
          },
        });

        if (data) {
          toast.success(t('common:successfully-updated'));
        }
      }

      // Old code
      // if (!initialValues) {
      //   createAttribute({
      //     variables: {
      //       input: {
      //         language: router.locale,
      //         name: values.name!,
      //         shop_id: Number(shopId),
      //         values: values.values,
      //       },
      //     },
      //   });
      // } else {
      //   updateAttribute({
      //     variables: {
      //       input: {
      //         id: initialValues.id!,
      //         language: router.locale,
      //         name: values.name!,
      //         shop_id: Number(initialValues?.shop_id),
      //         values: values.values.map(({ id, value, meta }: any) => ({
      //           id: Number(id),
      //           value,
      //           meta,
      //         })),
      //       },
      //     },
      //   });
      // }
    } catch (error) {
      const serverErrors = getErrorMessage(error);
      Object.keys(serverErrors?.validation).forEach((field: any) => {
        setError(field.split('.')[1], {
          type: 'manual',
          message: serverErrors?.validation[field][0],
        });
      });
    }
  };

  return (
    <>
      {errorMessage ? (
        <Alert
          message={t(`common:${errorMessage}`)}
          variant="error"
          closeable={true}
          className="mt-5"
          onClose={() => setErrorMessage(null)}
        />
      ) : null}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-wrap pb-8 border-b border-dashed border-border-base my-5 sm:my-8">
          <Description
            title={t('common:attribute')}
            details={`${
              initialValues
                ? t('form:item-description-update')
                : t('form:item-description-add')
            } ${t('form:form-description-attribute-name')}`}
            className="w-full px-0 sm:pe-4 md:pe-5 pb-5 sm:w-4/12 md:w-1/3 sm:py-8"
          />

          <Card className="w-full sm:w-8/12 md:w-2/3">
            <Input
              label={t('form:input-label-name')}
              {...register('name', { required: 'Name is required' })}
              error={t(errors.name?.message!)}
              variant="outline"
              className="mb-5"
            />
          </Card>
        </div>

        <div className="flex flex-wrap my-5 sm:my-8">
          <Description
            title={t('common:attribute-values')}
            details={`${
              initialValues
                ? t('form:item-description-update')
                : t('form:item-description-add')
            } ${t('form:form-description-attribute-value')}`}
            className="w-full px-0 sm:pe-4 md:pe-5 pb-5 sm:w-4/12 md:w-1/3 sm:py-8"
          />

          <Card className="w-full sm:w-8/12 md:w-2/3">
            <div>
              {/* @ts-ignore */}
              {fields.map((item: AttributeValue, index: number) => (
                <div
                  className="border-b border-dashed border-border-200 last:border-0 py-5 md:py-8"
                  key={item.id}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-5">
                    <Input
                      className="sm:col-span-2"
                      label={t('form:input-label-value')}
                      variant="outline"
                      {...register(`values.${index}.value` as const)}
                      defaultValue={item.value!} // make sure to set up defaultValue
                    />
                    <Input
                      className="sm:col-span-2"
                      label={t('form:input-label-meta')}
                      variant="outline"
                      {...register(`values.${index}.meta` as const)}
                      defaultValue={item.meta!} // make sure to set up defaultValue
                    />
                    <button
                      onClick={() => remove(index)}
                      type="button"
                      className="text-sm text-red-500 hover:text-red-700 transition-colors duration-200 focus:outline-none sm:mt-4 sm:col-span-1"
                    >
                      {t('form:button-label-remove')}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              onClick={() => append({ value: '', meta: '' })}
              className="w-full sm:w-auto"
            >
              {t('form:button-label-add-value')}
            </Button>
          </Card>
        </div>

        <div className="mb-4 text-end">
          {initialValues && (
            <Button
              variant="outline"
              onClick={router.back}
              className="me-4"
              type="button"
            >
              {t('form:button-label-back')}
            </Button>
          )}

          <Button loading={creating || updating}>
            {initialValues
              ? t('form:item-description-update')
              : t('form:item-description-add')}{' '}
            {t('common:attribute')}
          </Button>
        </div>
      </form>
    </>
  );
}
