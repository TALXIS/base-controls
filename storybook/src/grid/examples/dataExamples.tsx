import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const VALUE_TYPES_CODE = `const CATEGORIES = [
    { Value: 1, Label: 'Paper', Color: '#0078d4' },
    { Value: 2, Label: 'Writing', Color: '#8764b8' },
    { Value: 3, Label: 'Desk', Color: '#038387' },
]

//two options need the values 0 and 1
const YES_NO = [
    { Value: 0, Label: 'No', Color: '' },
    { Value: 1, Label: 'Yes', Color: '' },
]

const createCatalogue = () => new MemoryDataProvider({
    dataSource: [
        { itemid: 'paper', name: 'Copy paper A4, 5 reams', category: 1, price: 24.9, instock: 38, restocked: '2026-10-02', onorder: true },
        { itemid: 'notes', name: 'Sticky notes, pack of 12', category: 1, price: 11.6, instock: 0, restocked: '2026-08-21', onorder: true },
        { itemid: 'pens', name: 'Gel pens, pack of 12', category: 2, price: 7.5, instock: 62, restocked: '2026-09-15', onorder: false },
        { itemid: 'stapler', name: 'Desk stapler', category: 3, price: 12.4, instock: 21, restocked: '2026-07-30', onorder: false },
    ],
    metadata: { PrimaryIdAttribute: 'itemid', PrimaryNameAttribute: 'name', LogicalName: 'catalogueitem' },
    //each column's data type decides how its values are drawn
    columns: [
        { name: 'name', displayName: 'Item', dataType: DataTypes.SingleLineText },
        { name: 'category', displayName: 'Category', dataType: DataTypes.OptionSet, metadata: { OptionSet: CATEGORIES } },
        { name: 'price', displayName: 'Unit price', dataType: DataTypes.Currency },
        { name: 'instock', displayName: 'In stock', dataType: DataTypes.WholeNone },
        { name: 'restocked', displayName: 'Last restocked', dataType: DataTypes.DateAndTimeDateOnly },
        { name: 'onorder', displayName: 'On order', dataType: DataTypes.TwoOptions, metadata: { OptionSet: YES_NO } },
    ],
})

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: createCatalogue() })}>
    <DatasetControl.Body>
        {/* enableOptionSetColors draws options as tags in their colour */}
        <ClientSideGrid enableOptionSetColors />
    </DatasetControl.Body>
</DatasetControl>
`

export const EVERY_DATA_TYPE_CODE = `const STATUS = [
    { Value: 1, Label: 'Approved', Color: '#107c10' },
    { Value: 2, Label: 'Under review', Color: '#c19c00' },
    { Value: 3, Label: 'On hold', Color: '#a4262c' },
]

const SUPPLIES = [
    { Value: 1, Label: 'Desks', Color: '#038387' },
    { Value: 2, Label: 'Seating', Color: '#8764b8' },
    { Value: 3, Label: 'Lighting', Color: '#c19c00' },
    { Value: 4, Label: 'Storage', Color: '#ca5010' },
    { Value: 5, Label: 'Accessories', Color: '#0078d4' },
]

const YES_NO = [
    { Value: 0, Label: 'No', Color: '#605e5c' },
    { Value: 1, Label: 'Yes', Color: '#107c10' },
]

//a duration is held in minutes
const SUPPLIERS = [
    { supplierid: 'woodgrove', name: 'Woodgrove Furniture', initials: 'WF', color: '#038387', contact: 'Jana Nováková', email: 'orders@woodgrove.example', phone: '+420 601 200 300', website: 'https://woodgrove.example', address: 'Na Příkopě 12, 110 00 Praha 1', notes: 'Delivers on Tuesdays and Thursdays. Anything over two pallets needs a booked loading slot at the rear gate.',
        employees: 240, rating: 4.6, creditlimit: 50000, leadtime: 4320, contractend: dayjs().add(9, 'month').format('YYYY-MM-DD'), lastaudit: dayjs().subtract(40, 'day').hour(9).minute(30).toISOString(), status: 1, supplies: [1, 4], preferred: true },
    { supplierid: 'contoso', name: 'Contoso Seating', initials: 'CS', color: '#8764b8', contact: 'Tomáš Dvořák', email: 'sales@contoso-seating.example', phone: '+420 602 410 220', website: 'https://contoso-seating.example', address: 'Cejl 48, 602 00 Brno', notes: 'Ten-year frame warranty.',
        employees: 85, rating: 4.2, creditlimit: 30000, leadtime: 2880, contractend: dayjs().add(14, 'month').format('YYYY-MM-DD'), lastaudit: dayjs().subtract(95, 'day').hour(14).minute(0).toISOString(), status: 1, supplies: [2], preferred: true },
    { supplierid: 'litware', name: 'Litware Lighting', initials: 'LL', color: '#c19c00', contact: 'Petra Svobodová', email: 'hello@litware.example', phone: '+420 603 118 905', website: 'https://litware.example', address: 'Masarykova 7, 400 01 Ústí nad Labem', notes: 'New supplier. The first order ships once the audit is closed.',
        employees: 32, rating: 3.8, creditlimit: 10000, leadtime: 7200, contractend: dayjs().add(3, 'month').format('YYYY-MM-DD'), lastaudit: dayjs().subtract(6, 'day').hour(11).minute(15).toISOString(), status: 2, supplies: [3], preferred: false },
    { supplierid: 'fabrikam', name: 'Fabrikam Office', initials: 'FO', color: '#ca5010', contact: 'Martin Černý', email: 'orders@fabrikam.example', phone: '+420 604 330 712', website: 'https://fabrikam.example', address: 'Průmyslová 3, 301 00 Plzeň', notes: '',
        employees: 410, rating: 4.4, creditlimit: 75000, leadtime: 10080, contractend: dayjs().add(20, 'month').format('YYYY-MM-DD'), lastaudit: dayjs().subtract(150, 'day').hour(8).minute(45).toISOString(), status: 3, supplies: [4, 5], preferred: false },
]

const createLogo = (initials: string, color: string) => btoa('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" rx="8" fill="' + color + '"/><text x="20" y="26" font-family="Segoe UI, sans-serif" font-size="15" font-weight="600" text-anchor="middle" fill="#ffffff">' + initials + '</text></svg>')

//a file and an image are read from keys suffixed to their column's name
const toRawRecord = ({ initials, color, contact, ...supplier }: typeof SUPPLIERS[number]): IRawRecord => {
    const logo = createLogo(initials, color)
    return {
        ...supplier,
        contact: [{ entityType: 'contact', id: supplier.supplierid + '-contact', name: contact }],
        certificate: supplier.supplierid + '-iso-9001',
        'certificate.filename': supplier.supplierid + '-iso-9001.pdf',
        'certificate.filesizeinbytes': 182400,
        'certificate.mimetype': 'application/pdf',
        'certificate.fileurl': 'https://example.com/certificates/' + supplier.supplierid + '-iso-9001.pdf',
        logo: logo,
        'logo.filename': supplier.supplierid + '.svg',
        'logo.mimetype': 'image/svg+xml',
        'logo.thumbnailurl': 'data:image/svg+xml;base64,' + logo,
    }
}

const createDirectory = () => new MemoryDataProvider({
    dataSource: SUPPLIERS.map(toRawRecord),
    metadata: { PrimaryIdAttribute: 'supplierid', PrimaryNameAttribute: 'name', LogicalName: 'supplier' },
    columns: [
        { name: 'name', displayName: 'Supplier', dataType: DataTypes.SingleLineText, isPrimary: true },
        { name: 'email', displayName: 'Email', dataType: DataTypes.SingleLineEmail },
        { name: 'phone', displayName: 'Phone', dataType: DataTypes.SingleLinePhone },
        { name: 'website', displayName: 'Website', dataType: DataTypes.SingleLineUrl },
        { name: 'address', displayName: 'Address', dataType: DataTypes.SingleLineTextArea },
        { name: 'notes', displayName: 'Notes', dataType: DataTypes.Multiple },
        { name: 'employees', displayName: 'Employees', dataType: DataTypes.WholeNone },
        { name: 'rating', displayName: 'Rating', dataType: DataTypes.Decimal, metadata: { Precision: 1 } },
        { name: 'creditlimit', displayName: 'Credit limit', dataType: DataTypes.Currency },
        { name: 'leadtime', displayName: 'Lead time', dataType: DataTypes.WholeDuration },
        { name: 'contractend', displayName: 'Contract ends', dataType: DataTypes.DateAndTimeDateOnly },
        { name: 'lastaudit', displayName: 'Last audit', dataType: DataTypes.DateAndTimeDateAndTime },
        { name: 'status', displayName: 'Status', dataType: DataTypes.OptionSet, metadata: { OptionSet: STATUS } },
        { name: 'supplies', displayName: 'Supplies', dataType: DataTypes.MultiSelectOptionSet, metadata: { OptionSet: SUPPLIES } },
        { name: 'preferred', displayName: 'Preferred', dataType: DataTypes.TwoOptions, metadata: { OptionSet: YES_NO } },
        //the lookup editor searches Dataverse
        { name: 'contact', displayName: 'Contact', dataType: DataTypes.LookupSimple, metadata: { IsValidForUpdate: false } },
        { name: 'certificate', displayName: 'ISO certificate', dataType: DataTypes.File },
        { name: 'logo', displayName: 'Logo', dataType: DataTypes.Image },
    ],
})

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: createDirectory() })}>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createEditingModule()]} enableOptionSetColors />
    </DatasetControl.Body>
</DatasetControl>
`

export const REQUIRED_AND_READ_ONLY_CODE = `const createStockCount = () => new MemoryDataProvider({
    dataSource: [
        { countlineid: 'line-1', sku: 'DSK-100', name: 'Standing desk', onrecord: 14, counted: 14 },
        { countlineid: 'line-2', sku: 'DSK-107', name: 'Corner desk', onrecord: 3, counted: 2 },
        { countlineid: 'line-3', sku: 'SEA-114', name: 'Ergonomic chair', onrecord: 22, counted: null },
        { countlineid: 'line-4', sku: 'LIG-128', name: 'Desk lamp', onrecord: 61, counted: 58 },
        { countlineid: 'line-5', sku: 'ACC-156', name: 'Monitor arm', onrecord: 38, counted: 40 },
    ],
    metadata: { PrimaryIdAttribute: 'countlineid', PrimaryNameAttribute: 'name', LogicalName: 'stockcountline' },
    columns: [
        { name: 'sku', displayName: 'SKU', dataType: DataTypes.SingleLineText, metadata: { IsValidForUpdate: false } },
        { name: 'name', displayName: 'Product', dataType: DataTypes.SingleLineText, metadata: { IsValidForUpdate: false } },
        { name: 'onrecord', displayName: 'On record', dataType: DataTypes.WholeNone, metadata: { IsValidForUpdate: false } },
        { name: 'counted', displayName: 'Counted', dataType: DataTypes.WholeNone, metadata: { RequiredLevel: 2 } },
    ],
})

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: createStockCount() })}>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createEditingModule({ enableAutoSave: true })]} />
    </DatasetControl.Body>
</DatasetControl>
`

export const ValueTypesExample = () => <GridExampleRunner seedCode={VALUE_TYPES_CODE} tabs={['preview', 'code']} />

export const EveryDataTypeExample = () => <GridExampleRunner seedCode={EVERY_DATA_TYPE_CODE} tabs={['preview', 'code']} />

export const RequiredAndReadOnlyExample = () => <GridExampleRunner seedCode={REQUIRED_AND_READ_ONLY_CODE} tabs={['preview', 'code']} />

