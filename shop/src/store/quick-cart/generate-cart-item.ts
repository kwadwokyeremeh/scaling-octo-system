import isEmpty from 'lodash/isEmpty';
interface Item {
  id: string | number;
  name: string;
  slug: string;
  image: {
    thumbnail: string;
    [key: string]: unknown;
  };
  price: number;
  sale_price?: number;
  quantity?: number;
  [key: string]: unknown;
  language: string;
}
interface Variation {
  id: string | number;
  title: string;
  price: number;
  sale_price?: number;
  quantity: number;
  [key: string]: unknown;
}
export function generateCartItem(item: Item, variation: Variation) {
  const {
    id,
    name,
    slug,
    image,
    price,
    sale_price,
    quantity,
    unit,
    is_digital,
    language
  } = item;
  if (!isEmpty(variation)) {
    return {
      id: `${id}.${variation.id}`,
      productId: id,
      name: `${name} - ${variation.title}`,
      slug,
      unit,
      is_digital: variation?.is_digital,
      stock: variation.quantity,
      price: Number(
        variation.sale_price ? variation.sale_price : variation.price
      ),
      image: image?.thumbnail,
      variationId: variation.id,
      language
    };
  }
  return {
    id,
    name,
    slug,
    unit,
    is_digital,
    image: image?.thumbnail,
    stock: quantity,
    price: Number(sale_price ? sale_price : price),
    language
  };
}
