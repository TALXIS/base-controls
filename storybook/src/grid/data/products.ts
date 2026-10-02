import dayjs from 'dayjs'
import { DataTypes, IColumn, IRawRecord, MemoryDataProvider } from '@talxis/client-libraries'
import { createMemoryProvider, metadataFor, numberMetadataFor } from './metadata'

const CATEGORY_OPTIONS = [
    { Value: 1, Label: 'Desks', Color: '#038387' },
    { Value: 2, Label: 'Seating', Color: '#8764b8' },
    { Value: 3, Label: 'Lighting', Color: '#c19c00' },
    { Value: 4, Label: 'Storage', Color: '#ca5010' },
    { Value: 5, Label: 'Accessories', Color: '#0078d4' },
]

const DISCONTINUED_OPTIONS = [
    { Value: 0, Label: 'No', Color: '#605e5c' },
    { Value: 1, Label: 'Yes', Color: '#a4262c' },
]

export const PRODUCT_COLUMNS: IColumn[] = [
    { name: 'photo', dataType: DataTypes.Image, displayName: 'Photo', visualSizeFactor: 80, metadata: { ...metadataFor(DataTypes.Image), IsValidForUpdate: false } },
    { name: 'name', dataType: DataTypes.SingleLineText, displayName: 'Product', visualSizeFactor: 200, metadata: metadataFor(DataTypes.SingleLineText) },
    { name: 'sku', dataType: DataTypes.SingleLineText, displayName: 'SKU', visualSizeFactor: 110, metadata: metadataFor(DataTypes.SingleLineText) },
    { name: 'category', dataType: DataTypes.OptionSet, displayName: 'Category', visualSizeFactor: 130, metadata: { ...metadataFor(DataTypes.OptionSet), OptionSet: CATEGORY_OPTIONS } },
    { name: 'price', dataType: DataTypes.Currency, displayName: 'Price', visualSizeFactor: 110, metadata: numberMetadataFor(DataTypes.Currency) },
    { name: 'instock', dataType: DataTypes.WholeNone, displayName: 'In stock', visualSizeFactor: 100, metadata: numberMetadataFor(DataTypes.WholeNone) },
    { name: 'reorderlevel', dataType: DataTypes.WholeNone, displayName: 'Reorder at', visualSizeFactor: 100, metadata: numberMetadataFor(DataTypes.WholeNone) },
    { name: 'supplier', dataType: DataTypes.SingleLineText, displayName: 'Supplier', visualSizeFactor: 150, metadata: metadataFor(DataTypes.SingleLineText) },
    { name: 'lastrestocked', dataType: DataTypes.DateAndTimeDateOnly, displayName: 'Last restocked', visualSizeFactor: 130, metadata: metadataFor(DataTypes.DateAndTimeDateOnly) },
    { name: 'discontinued', dataType: DataTypes.TwoOptions, displayName: 'Discontinued', visualSizeFactor: 110, metadata: { ...metadataFor(DataTypes.TwoOptions), OptionSet: DISCONTINUED_OPTIONS } },
    { name: 'producturl', dataType: DataTypes.SingleLineUrl, displayName: 'Product page', visualSizeFactor: 220, metadata: metadataFor(DataTypes.SingleLineUrl) },
]

const PRODUCTS = [
    { name: 'Standing desk', category: 1, price: 640, instock: 14, reorderlevel: 5, supplier: 'Woodgrove Furniture' },
    { name: 'Corner desk', category: 1, price: 520, instock: 3, reorderlevel: 4, supplier: 'Woodgrove Furniture' },
    { name: 'Ergonomic chair', category: 2, price: 410, instock: 22, reorderlevel: 10, supplier: 'Contoso Seating' },
    { name: 'Meeting chair', category: 2, price: 150, instock: 0, reorderlevel: 12, supplier: 'Contoso Seating' },
    { name: 'Desk lamp', category: 3, price: 45, instock: 61, reorderlevel: 20, supplier: 'Litware Lighting' },
    { name: 'Floor lamp', category: 3, price: 120, instock: 7, reorderlevel: 8, supplier: 'Litware Lighting' },
    { name: 'Filing cabinet', category: 4, price: 230, instock: 9, reorderlevel: 4, supplier: 'Fabrikam Office' },
    { name: 'Bookshelf', category: 4, price: 180, instock: 2, reorderlevel: 3, supplier: 'Fabrikam Office' },
    { name: 'Monitor arm', category: 5, price: 85, instock: 38, reorderlevel: 15, supplier: 'Proseware' },
    { name: 'Cable tray', category: 5, price: 25, instock: 120, reorderlevel: 40, supplier: 'Proseware' },
    { name: 'Footrest', category: 5, price: 35, instock: 11, reorderlevel: 10, supplier: 'Proseware' },
    { name: 'Pedestal drawer', category: 4, price: 210, instock: 16, reorderlevel: 6, supplier: 'Fabrikam Office' },
    { name: 'Bar stool', category: 2, price: 95, instock: 4, reorderlevel: 6, supplier: 'Contoso Seating' },
    { name: 'Pendant light', category: 3, price: 160, instock: 13, reorderlevel: 5, supplier: 'Litware Lighting' },
    { name: 'Conference table', category: 1, price: 1450, instock: 1, reorderlevel: 1, supplier: 'Woodgrove Furniture' },
    { name: 'Whiteboard', category: 5, price: 140, instock: 0, reorderlevel: 3, supplier: 'Proseware' },
]

//a tile with the product's initial stands in for a photo
const createPhoto = (name: string, color: string) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="12" fill="${color}"/><text x="32" y="42" font-family="Segoe UI, sans-serif" font-size="28" font-weight="600" text-anchor="middle" fill="#ffffff">${name[0]}</text></svg>`
    return btoa(svg)
}

export const PRODUCT_ROWS: IRawRecord[] = PRODUCTS.map((product, index) => {
    const color = CATEGORY_OPTIONS.find(option => option.Value === product.category)!.Color
    const photo = createPhoto(product.name, color)
    const slug = product.name.toLowerCase().replace(/[^a-z]+/g, '-')
    return {
        docs_productid: `product-${index + 1}`,
        ...product,
        sku: `${CATEGORY_OPTIONS[product.category - 1].Label.slice(0, 3).toUpperCase()}-${String(100 + index * 7)}`,
        lastrestocked: dayjs().startOf('day').subtract(3 + index * 4, 'day').toISOString(),
        discontinued: index === 7 || index === 12,
        producturl: `https://shop.example/products/${slug}`,
        photo,
        'photo.filename': `${slug}.svg`,
        'photo.filesizeinbytes': photo.length,
        'photo.mimetype': 'image/svg+xml',
        'photo.thumbnailurl': `data:image/svg+xml;base64,${photo}`,
    }
})

/** An office furniture shop's inventory, not yet loaded. */
export const createProductsProvider = (): MemoryDataProvider => createMemoryProvider({
    primaryIdAttribute: 'docs_productid',
    primaryNameAttribute: 'name',
    logicalName: 'docs_product',
    rows: PRODUCT_ROWS,
    columns: PRODUCT_COLUMNS,
})
