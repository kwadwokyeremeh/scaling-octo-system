import Input from '@/components/ui/input';
import { useForm, useFieldArray } from 'react-hook-form';
import Button from '@/components/ui/button';
import TextArea from '@/components/ui/text-area';
import Label from '@/components/ui/label';
import { getErrorMessage } from '@/utils/form-error';
import Description from '@/components/ui/description';
import Card from '@/components/common/card';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import FileInput from '@/components/ui/file-input';
import { yupResolver } from '@hookform/resolvers/yup';
import { manufacturerValidationSchema } from './manufacturer-validation-schema';
import { getIcon } from '@/utils/get-icon';
import SelectInput from '@/components/ui/select-input';
import * as socialIcons from '@/components/icons/social';
import ProductGroupInput from '@/components/product/product-group-input';
import { AttachmentInput, Manufacturer, ShopSocialInput } from '@/types';
import { useShopQuery } from '@/data/shop';
import {
  useCreateManufacturerMutation,
  useUpdateManufacturerMutation,
} from '@/data/manufacturer';

const socialIcon = [
  {
    value: 'FacebookIcon',
    label: 'Facebook',
  },
  {
    value: 'InstagramIcon',
    label: 'Instagram',
  },
  {
    value: 'TwitterIcon',
    label: 'Twitter',
  },
  {
    value: 'YouTubeIcon',
    label: 'Youtube',
  },
];

export const updatedIcons = socialIcon.map((item: any) => {
  item.label = (
    <div className="flex items-center text-body space-s-4">
      <span className="flex h-4 w-4 items-center justify-center">
        {getIcon({
          iconList: socialIcons,
          iconName: item.value,
          className: 'w-4 h-4',
        })}
      </span>
      <span>{item.label}</span>
    </div>
  );
  return item;
});

type FormValues = {
  name: string;
  description: string;
  website: string;
  socials: ShopSocialInput[];
  shop_id: string;
  is_approved?: boolean;
  type: any;
  image: AttachmentInput;
  cover_image: AttachmentInput;
};

// const defaultValues = {
//   image: "",
//   amount: 0,
//   active_from: new Date(),
//   expire_at: new Date(),
// };

type IProps = {
  initialValues?: Manufacturer | null;
};
export default function CreateOrUpdateManufacturerForm({
  initialValues,
}: IProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    query: { shop },
  } = router;
  const { data: shopData } = useShopQuery(
    {
      slug: shop as string,
    },
    { enabled: !!router.query.shop }
  );
  const shopId = shopData?.id!;
  const isNewTranslation = router?.query?.action === 'translate';

  const {
    register,
    handleSubmit,
    control,
    setError,

    formState: { errors },
  } = useForm<FormValues>({
    shouldUnregister: true,
    resolver: yupResolver(manufacturerValidationSchema),
    ...(Boolean(initialValues) && {
      defaultValues: {
        ...initialValues,
        socials: initialValues?.socials
          ? initialValues?.socials.map((social: any) => ({
              icon: updatedIcons?.find((icon) => icon?.value === social?.icon),
              url: social?.url,
            }))
          : [],
        ...(isNewTranslation && {
          type: null,
        }),
      } as any,
    }),
  });

  const { mutate: createManufacturer, isLoading: creating } =
    useCreateManufacturerMutation();
  const { mutate: updateManufacturer, isLoading: updating } =
    useUpdateManufacturerMutation();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'socials',
  });

  const onSubmit = async (values: FormValues) => {
    const {
      name,
      description,
      is_approved,
      website,
      type,
      socials,
      image,
      cover_image,
    } = values;
    const input = {
      language: router.locale,
      name,
      description,
      is_approved,
      website,
      socials: socials
        ? socials?.map((social: any) => ({
            icon: social?.icon?.value,
            url: social?.url,
          }))
        : [],
      image: {
        thumbnail: image?.thumbnail,
        original: image?.original,
        id: image?.id,
      },
      cover_image: {
        thumbnail: cover_image?.thumbnail,
        original: cover_image?.original,
        id: cover_image?.id,
      },
      type_id: type?.id!,
    };
    try {
      if (
        !initialValues ||
        !initialValues.translated_languages.includes(router.locale!)
      ) {
        createManufacturer({
          ...input,
          shop_id: shopId,
          ...(initialValues?.slug && { slug: initialValues.slug }),
        });
      } else {
        updateManufacturer({
          ...input,
          id: initialValues.id!,
          shop_id: shopId,
        });
      }
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
        <Description
          title={t('form:input-label-logo')}
          details={t('form:manufacturer-image-helper-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <FileInput name="image" control={control} multiple={false} />
        </Card>
      </div>
      <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
        <Description
          title={t('form:input-label-cover-image')}
          details={t('form:manufacturer-cover-image-helper-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <FileInput name="cover_image" control={control} multiple={false} />
        </Card>
      </div>

      <div className="my-5 flex flex-wrap sm:my-8">
        <Description
          title={t('form:input-label-description')}
          details={`${
            initialValues
              ? t('form:item-description-edit')
              : t('form:item-description-add')
          } ${t('form:manufacturer-form-description-details')}`}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5 "
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-name')}
            {...register('name')}
            error={t(errors.name?.message!)}
            variant="outline"
            className="mb-5"
          />

          <Input
            label={t('form:input-label-website')}
            {...register('website')}
            error={t(errors.website?.message!)}
            variant="outline"
            className="mb-5"
          />

          <TextArea
            label={t('form:input-label-description')}
            {...register('description')}
            variant="outline"
            className="mb-5"
          />
          <ProductGroupInput
            control={control}
            error={t(errors?.type?.message)}
          />
          {/* Social and Icon picker */}
          <div>
            {fields.map(
              (item: ShopSocialInput & { id: string }, index: number) => (
                <div
                  className="border-b border-dashed border-border-200 py-5 first:mt-5 first:border-t last:border-b-0 md:py-8 md:first:mt-10"
                  key={item.id}
                >
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-5">
                    <div className="sm:col-span-2">
                      <Label>{t('form:input-label-select-platform')}</Label>
                      <SelectInput
                        name={`socials.${index}.icon` as const}
                        control={control}
                        options={updatedIcons}
                        isClearable={true}
                        defaultValue={item?.icon!}
                      />
                    </div>

                    <Input
                      className="sm:col-span-2"
                      label={t('form:input-label-social-url')}
                      variant="outline"
                      {...register(`socials.${index}.url` as const)}
                      defaultValue={item.url!} // make sure to set up defaultValue
                    />
                    <button
                      onClick={() => {
                        remove(index);
                      }}
                      type="button"
                      className="text-sm text-red-500 transition-colors duration-200 hover:text-red-700 focus:outline-none sm:col-span-1 sm:mt-4"
                    >
                      {t('form:button-label-remove')}
                    </button>
                  </div>
                </div>
              )
            )}
          </div>

          <Button
            type="button"
            onClick={() => append({ icon: '', url: '' })}
            className="w-full sm:w-auto"
          >
            {t('form:button-label-add-social')}
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

        <Button loading={updating || creating}>
          {initialValues
            ? t('form:button-label-update-manufacturer-publication')
            : t('form:button-label-add-manufacturer-publication')}
        </Button>
      </div>
    </form>
  );
}
