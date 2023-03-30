import { useQuery } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { mapPaginatorData } from '@/utils/data-mappers';
import {
  OrderQueryOptions,
  OrderPaginator,
  Order,
  InvoiceTranslatedText,
} from '@/types';
import { orderClient } from './client/order';
import { exportClient } from '@/data/client/export';

export const useOrdersQuery = (
  params: Partial<OrderQueryOptions>,
  options: any = {}
) => {
  const { data, error, isLoading } = useQuery<OrderPaginator, Error>(
    [API_ENDPOINTS.ORDERS, params],
    ({ queryKey, pageParam }) =>
      orderClient.paginated(Object.assign({}, queryKey[1], pageParam)),
    {
      keepPreviousData: true,
      ...options,
    }
  );
  return {
    orders: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data),
    error,
    loading: isLoading,
  };
};

export const useOrderQuery = ({
  id,
  language,
}: {
  id: string;
  language: string;
}) => {
  const { data, error, isLoading } = useQuery<Order, Error>(
    [API_ENDPOINTS.ORDERS, { id, language }],
    () => orderClient.get({ id, language })
  );

  return {
    order: data,
    error,
    isLoading,
  };
};

export const useCreateOrderMutation = () => {
  return useMutation(orderClient.create);
};

export const useUpdateOrderMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation(orderClient.update, {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.ORDERS);
    },
  });
};

export const useDownloadInvoiceMutation = (
  { order_id, isRTL, language }: { order_id: string, isRTL: boolean, language: string },
  options: any = {}
) => {
  const { t } = useTranslation();
  const formattedInput = {
    order_id,
    is_rtl: isRTL,
    language,
    translated_text: {
      subtotal: t('order-sub-total'),
      discount: t('order-discount'),
      tax: t('order-tax'),
      delivery_fee: t('order-delivery-fee'),
      total: t('order-total'),
      products: t('text-products'),
      quantity: t('text-quantity'),
      invoice_no: t('text-invoice-no'),
      date: t('text-date'),
    },
  };

  return useQuery<string, Error>(
    [API_ENDPOINTS.ORDER_INVOICE_DOWNLOAD],
    () => orderClient.downloadInvoice(formattedInput),
    {
      ...options,
    }
  );
};
