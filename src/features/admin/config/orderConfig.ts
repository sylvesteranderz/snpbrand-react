// Product categories used to query the products table.
// Add a new entry here when you want a new card on the order form.
export type ProductCategory = 'slippers' | 'shirt'

export interface CategoryMeta {
  key: ProductCategory
  label: string
  emoji: string
}

export const PRODUCT_CATEGORIES: CategoryMeta[] = [
  { key: 'slippers', label: 'Slippers', emoji: '👟' },
  { key: 'shirt',    label: 'Shirt',    emoji: '👕' },
]

export type OrderChannel = 'WhatsApp' | 'Walk-in' | 'Phone Call'

export const ORDER_CHANNELS: OrderChannel[] = ['WhatsApp', 'Walk-in', 'Phone Call']
