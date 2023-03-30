import Coupon from '@/components/checkout/coupon';
import usePrice from '@/lib/use-price';
import EmptyCartIcon from '@/components/icons/empty-cart';
import { CloseIcon } from '@/components/icons/close-icon';
import { useTranslation } from 'next-i18next';
import { useCart } from '@/store/quick-cart/cart.context';
import {
  calculatePaidTotal,
  calculateTotal,
} from '@/store/quick-cart/cart.utils';
import { useAtom } from 'jotai';
import {
  couponAtom,
  discountAtom,
  payableAmountAtom,
  verifiedResponseAtom,
  walletAtom,
} from '@/store/checkout';
import { ItemInfoRow } from '@/components/checkout/digital/item-info-row';
import PaymentGrid from '@/components/checkout/payment/payment-grid';
import { PlaceOrderAction } from '@/components/checkout/place-order-action';
import Wallet from '@/components/checkout/wallet/wallet';
import CartItem from '@/components/checkout/digital/cart-item';

interface Props {
  className?: string;
}
const VerifiedItemList: React.FC<Props> = ({ className }) => {
  const { t } = useTranslation('common');
  const { items, isEmpty: isEmptyCart } = useCart();
  const [verifiedResponse] = useAtom(verifiedResponseAtom);
  const [coupon, setCoupon] = useAtom(couponAtom);
  const [discount] = useAtom(discountAtom);
  const [payableAmount] = useAtom(payableAmountAtom);
  const [use_wallet] = useAtom(walletAtom);

  const available_items = items?.filter(
    (item) => !verifiedResponse?.unavailable_products?.includes(item.id)
  );

  const { price: tax } = usePrice(
    verifiedResponse && {
      amount: verifiedResponse.total_tax ?? 0,
    }
  );

  const { price: shipping } = usePrice(
    verifiedResponse && {
      amount: verifiedResponse.shipping_charge ?? 0,
    }
  );

  const base_amount = calculateTotal(available_items);
  const { price: sub_total } = usePrice(
    verifiedResponse && {
      amount: base_amount,
    }
  );

  const { price: discountPrice } = usePrice(
    //@ts-ignore
    discount && {
      amount: Number(discount),
    }
  );
  const totalPrice = verifiedResponse
    ? calculatePaidTotal(
        {
          totalAmount: base_amount,
          tax: verifiedResponse?.total_tax,
          shipping_charge: verifiedResponse?.shipping_charge,
        },
        Number(discount)
      )
    : 0;
  const { price: total } = usePrice(
    verifiedResponse && {
      amount: totalPrice,
    }
  );
  return (
    <div className={className}>
      <div className="flex flex-col pb-2 border-b border-border-200">
        {!isEmptyCart ? (
          items?.map((item) => {
            const notAvailable = verifiedResponse?.unavailable_products?.find(
              (d: any) => d === item.id
            );
            return (
              <CartItem
                item={item}
                key={item.id}
                notAvailable={!!notAvailable}
              />
            );
          })
        ) : (
          <EmptyCartIcon />
        )}
      </div>

      <div className="mt-4 space-y-3">
        <ItemInfoRow title={t('text-sub-total')} value={sub_total} />
        <ItemInfoRow title={t('text-tax')} value={tax} />
        <ItemInfoRow title={t('text-shipping')} value={shipping} />
        {discount && coupon ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-800 ltr:mr-4 rtl:ml-4">
              {t('text-discount')}
            </p>
            <span className="flex items-center text-xs font-semibold text-red-500 ltr:mr-auto rtl:ml-auto">
              ({coupon?.code})
              <button onClick={() => setCoupon(null)}>
                <CloseIcon className="w-3 h-3 ltr:ml-2 rtl:mr-2" />
              </button>
            </span>
            <span className="text-sm font-semibold text-gray-800">
              {discountPrice}
            </span>
          </div>
        ) : (
          <div className="flex justify-between !mt-5 !mb-4">
            <Coupon theme="dark" />
          </div>
        )}
        <div className="flex justify-between pt-3 border-t-4 border-double border-border-200">
          <p className="text-base font-semibold text-heading">
            {t('text-total')}
          </p>
          <span className="text-base font-semibold text-heading">{total}</span>
        </div>
      </div>
      {verifiedResponse && (
        <Wallet
          totalPrice={totalPrice}
          walletAmount={verifiedResponse.wallet_amount}
          walletCurrency={verifiedResponse.wallet_currency}
        />
      )}
      {use_wallet && !Boolean(payableAmount) ? null : (
        <PaymentGrid
          theme="bw"
          className="p-5 mt-10 border border-gray-200 bg-light"
        />
      )}
      <PlaceOrderAction className="w-full mt-8 font-normal h-[50px] !bg-gray-800 transition-colors hover:!bg-gray-900">
        {t('text-place-order')}
      </PlaceOrderAction>
    </div>
  );
};

export default VerifiedItemList;
