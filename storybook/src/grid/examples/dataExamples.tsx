import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const OWN_RECORDS_CODE = `const createCatalogue = () => {
    const catalogue = new MemoryDataProvider({
        dataSource: [
            { itemid: 'pens-blue', name: 'Ballpoint pens, blue, box of 50', sku: 'WRI-1001', price: 9.9, instock: 140 },
            { itemid: 'pens-gel', name: 'Gel pens, assorted colours, pack of 12', sku: 'WRI-1004', price: 7.5, instock: 62 },
            { itemid: 'notepads', name: 'Notepads A5, ruled, pack of 10', sku: 'PAP-2010', price: 14, instock: 85 },
            { itemid: 'paper', name: 'Copy paper A4, 80 g, 5 reams', sku: 'PAP-2001', price: 24.9, instock: 38 },
            { itemid: 'notes', name: 'Sticky notes 76 x 76 mm, pack of 12', sku: 'PAP-2030', price: 11.6, instock: 0 },
            { itemid: 'stapler', name: 'Desk stapler, 30 sheets', sku: 'DSK-3002', price: 12.4, instock: 21 },
            { itemid: 'staples', name: 'Staples 24/6, box of 5,000', sku: 'DSK-3003', price: 3.2, instock: 210 },
            { itemid: 'files', name: 'Lever arch files A4, pack of 10', sku: 'FIL-4001', price: 29, instock: 16 },
        ],
        metadata: { PrimaryIdAttribute: 'itemid', PrimaryNameAttribute: 'name', LogicalName: 'catalogueitem' },
    })
    catalogue.setColumns([
        { name: 'name', displayName: 'Item', dataType: DataTypes.SingleLineText, visualSizeFactor: 300, metadata: { IsValidForGrid: true } },
        { name: 'sku', displayName: 'SKU', dataType: DataTypes.SingleLineText, visualSizeFactor: 120, metadata: { IsValidForGrid: true } },
        { name: 'price', displayName: 'Unit price', dataType: DataTypes.Currency, visualSizeFactor: 120, metadata: { IsValidForGrid: true } },
        { name: 'instock', displayName: 'In stock', dataType: DataTypes.WholeNone, visualSizeFactor: 100, metadata: { IsValidForGrid: true } },
    ])
    return catalogue
}

const GridExample = () => {
    const catalogue = React.useMemo(createCatalogue, [])
    return <Grid.Root provider={catalogue} modules={{ rowModel: createClientSideRowModelModule(), sorting: createSortingModule() }} height='400px' />
}
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
        employees: 410, rating: 4.4, creditlimit: 75000, leadtime: 10080, contractend: dayjs().add(20, 'month').format('YYYY-MM-DD'), lastaudit: dayjs().subtract(150, 'day').hour(8).minute(45).toISOString(), status: 1, supplies: [4, 1], preferred: false },
    { supplierid: 'proseware', name: 'Proseware', initials: 'PW', color: '#0078d4', contact: 'Lucie Procházková', email: 'support@proseware.example', phone: '+420 605 902 441', website: 'https://proseware.example', address: 'Nádražní 15, 702 00 Ostrava', notes: 'Paused after two late deliveries in a row. Review the delivery record with the account manager before the next order.',
        employees: 58, rating: 2.9, creditlimit: 15000, leadtime: 1440, contractend: dayjs().add(1, 'month').format('YYYY-MM-DD'), lastaudit: dayjs().subtract(20, 'day').hour(16).minute(10).toISOString(), status: 3, supplies: [5, 3], preferred: false },
    { supplierid: 'northwind', name: 'Northwind Workspace', initials: 'NW', color: '#107c10', contact: 'Pavel Novák', email: 'b2b@northwind.example', phone: '+420 606 774 018', website: 'https://northwind.example', address: 'Třída Svobody 21, 779 00 Olomouc', notes: 'Can bundle desks and chairs into one delivery.',
        employees: 150, rating: 4.0, creditlimit: 40000, leadtime: 2160, contractend: dayjs().add(11, 'month').format('YYYY-MM-DD'), lastaudit: dayjs().subtract(60, 'day').hour(10).minute(0).toISOString(), status: 2, supplies: [1, 2, 5], preferred: false },
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

const createDirectory = (onOpen: (message: string) => void) => {
    const directory = new MemoryDataProvider({
        dataSource: SUPPLIERS.map(toRawRecord),
        metadata: { PrimaryIdAttribute: 'supplierid', PrimaryNameAttribute: 'name', LogicalName: 'supplier' },
    })
    directory.setColumns([
        { name: 'name', displayName: 'Supplier', dataType: DataTypes.SingleLineText, visualSizeFactor: 190, isPrimary: true },
        { name: 'email', displayName: 'Email', dataType: DataTypes.SingleLineEmail, visualSizeFactor: 220 },
        { name: 'phone', displayName: 'Phone', dataType: DataTypes.SingleLinePhone, visualSizeFactor: 150 },
        { name: 'website', displayName: 'Website', dataType: DataTypes.SingleLineUrl, visualSizeFactor: 210 },
        { name: 'address', displayName: 'Address', dataType: DataTypes.SingleLineTextArea, visualSizeFactor: 200 },
        { name: 'notes', displayName: 'Notes', dataType: DataTypes.Multiple, visualSizeFactor: 260 },
        { name: 'employees', displayName: 'Employees', dataType: DataTypes.WholeNone, visualSizeFactor: 110 },
        { name: 'rating', displayName: 'Rating', dataType: DataTypes.Decimal, visualSizeFactor: 90, metadata: { Precision: 1 } },
        { name: 'creditlimit', displayName: 'Credit limit', dataType: DataTypes.Currency, visualSizeFactor: 130 },
        { name: 'leadtime', displayName: 'Lead time', dataType: DataTypes.WholeDuration, visualSizeFactor: 110 },
        { name: 'contractend', displayName: 'Contract ends', dataType: DataTypes.DateAndTimeDateOnly, visualSizeFactor: 130 },
        { name: 'lastaudit', displayName: 'Last audit', dataType: DataTypes.DateAndTimeDateAndTime, visualSizeFactor: 170 },
        { name: 'status', displayName: 'Status', dataType: DataTypes.OptionSet, visualSizeFactor: 130, metadata: { OptionSet: STATUS } },
        { name: 'supplies', displayName: 'Supplies', dataType: DataTypes.MultiSelectOptionSet, visualSizeFactor: 220, metadata: { OptionSet: SUPPLIES } },
        { name: 'preferred', displayName: 'Preferred', dataType: DataTypes.TwoOptions, visualSizeFactor: 100, metadata: { OptionSet: YES_NO } },
        //the lookup editor searches Dataverse
        { name: 'contact', displayName: 'Contact', dataType: DataTypes.LookupSimple, visualSizeFactor: 170, metadata: { IsValidForUpdate: false } },
        { name: 'certificate', displayName: 'ISO certificate', dataType: DataTypes.File, visualSizeFactor: 230 },
        { name: 'logo', displayName: 'Logo', dataType: DataTypes.Image, visualSizeFactor: 130 },
    ])
    directory.setInterceptor('onOpenDatasetItem', reference => onOpen('Opening ' + reference.etn + ' ' + reference.name))
    return directory
}

const GridExample = () => {
    const [opened, setOpened] = React.useState('')
    const directory = React.useMemo(() => createDirectory(setOpened), [])

    return <Stack tokens={{ childrenGap: 8 }}>
        {opened && <MessageBar onDismiss={() => setOpened('')}>{opened}</MessageBar>}
        <Grid.Root provider={directory} modules={{ rowModel: createClientSideRowModelModule() }} enableEditing enableOptionSetColors height='360px' />
    </Stack>
}
`

export const REQUIRED_AND_READ_ONLY_CODE = `const createStockCount = () => {
    const stockCount = new MemoryDataProvider({
        dataSource: [
            { countlineid: 'line-1', sku: 'DSK-100', name: 'Standing desk', onrecord: 14, counted: 14, note: '' },
            { countlineid: 'line-2', sku: 'DSK-107', name: 'Corner desk', onrecord: 3, counted: 2, note: 'One returned damaged, in the repair bay' },
            { countlineid: 'line-3', sku: 'SEA-114', name: 'Ergonomic chair', onrecord: 22, counted: null, note: '' },
            { countlineid: 'line-4', sku: 'SEA-121', name: 'Meeting chair', onrecord: 12, counted: 12, note: '' },
            { countlineid: 'line-5', sku: 'LIG-128', name: 'Desk lamp', onrecord: 61, counted: 58, note: 'Three missing from aisle 4' },
            { countlineid: 'line-6', sku: 'LIG-135', name: 'Floor lamp', onrecord: 7, counted: null, note: '' },
            { countlineid: 'line-7', sku: 'STO-142', name: 'Filing cabinet', onrecord: 9, counted: 9, note: '' },
            { countlineid: 'line-8', sku: 'ACC-156', name: 'Monitor arm', onrecord: 38, counted: 40, note: 'Two found in returns' },
        ],
        metadata: { PrimaryIdAttribute: 'countlineid', PrimaryNameAttribute: 'name', LogicalName: 'stockcountline' },
    })
    stockCount.setColumns([
        { name: 'sku', displayName: 'SKU', dataType: DataTypes.SingleLineText, visualSizeFactor: 110, metadata: { IsValidForUpdate: false } },
        { name: 'name', displayName: 'Product', dataType: DataTypes.SingleLineText, visualSizeFactor: 200, metadata: { IsValidForUpdate: false } },
        { name: 'onrecord', displayName: 'On record', dataType: DataTypes.WholeNone, visualSizeFactor: 110, metadata: { IsValidForUpdate: false } },
        { name: 'counted', displayName: 'Counted', dataType: DataTypes.WholeNone, visualSizeFactor: 110, metadata: { RequiredLevel: 2 } },
        { name: 'note', displayName: 'Note', dataType: DataTypes.SingleLineText, visualSizeFactor: 280 },
    ])
    return stockCount
}

const GridExample = () => {
    const stockCount = React.useMemo(createStockCount, [])
    return <Grid.Root provider={stockCount} modules={{ rowModel: createClientSideRowModelModule() }} enableEditing enableAutoSave height='420px' />
}
`

export const PAGE_BY_PAGE_CODE = `const CATEGORIES = [
    { Value: 1, Label: 'Desks', Color: '#038387' },
    { Value: 2, Label: 'Seating', Color: '#8764b8' },
    { Value: 3, Label: 'Lighting', Color: '#c19c00' },
    { Value: 4, Label: 'Storage', Color: '#ca5010' },
    { Value: 5, Label: 'Accessories', Color: '#0078d4' },
]

const KINDS = [
    { name: 'desk', category: 1, price: 420 },
    { name: 'chair', category: 2, price: 260 },
    { name: 'lamp', category: 3, price: 60 },
    { name: 'cabinet', category: 4, price: 190 },
    { name: 'monitor arm', category: 5, price: 85 },
    { name: 'footrest', category: 5, price: 35 },
]
const SERIES = ['Aria', 'Bento', 'Cove', 'Dune', 'Echo', 'Fjord', 'Grove', 'Halo', 'Isle', 'Juno']
const FINISHES = ['oak', 'walnut', 'white', 'black', 'grey']

const PRODUCTS: IRawRecord[] = Array.from({ length: 300 }, (_, index) => {
    const kind = KINDS[index % KINDS.length]
    const series = SERIES[Math.floor(index / KINDS.length) % SERIES.length]
    const finish = FINISHES[Math.floor(index / (KINDS.length * SERIES.length))]
    return { productid: 'product-' + (index + 1), sku: 'FUR-' + (10001 + index), name: series + ' ' + kind.name + ', ' + finish, category: kind.category, price: kind.price + (index % 7) * 15, instock: (index * 37) % 120 }
})

const PAGE_SIZES = [25, 50, 100].map(size => ({ key: size, text: size + ' per page' }))

const createCatalogue = () => {
    const catalogue = new MemoryDataProvider({
        dataSource: PRODUCTS,
        metadata: { PrimaryIdAttribute: 'productid', PrimaryNameAttribute: 'name', LogicalName: 'product' },
    })
    catalogue.setColumns([
        { name: 'sku', displayName: 'SKU', dataType: DataTypes.SingleLineText, visualSizeFactor: 110, metadata: { IsValidForGrid: true } },
        { name: 'name', displayName: 'Product', dataType: DataTypes.SingleLineText, visualSizeFactor: 240, metadata: { IsValidForGrid: true } },
        { name: 'category', displayName: 'Category', dataType: DataTypes.OptionSet, visualSizeFactor: 140, metadata: { IsValidForGrid: true, OptionSet: CATEGORIES } },
        { name: 'price', displayName: 'Price', dataType: DataTypes.Currency, visualSizeFactor: 110, metadata: { IsValidForGrid: true } },
        { name: 'instock', displayName: 'In stock', dataType: DataTypes.WholeNone, visualSizeFactor: 100, metadata: { IsValidForGrid: true } },
    ])
    catalogue.getPaging().setPageSize(25)
    return catalogue
}

const GridExample = () => {
    const catalogue = React.useMemo(createCatalogue, [])
    const [paging, setPaging] = React.useState(() => catalogue.getPaging())
    const first = (paging.pageNumber - 1) * paging.pageSize + 1
    const last = Math.min(paging.pageNumber * paging.pageSize, paging.totalResultCount)
    const pageCount = Math.ceil(paging.totalResultCount / paging.pageSize)

    const changePageSize = (pageSize: number) => {
        catalogue.getPaging().setPageSize(pageSize)
        catalogue.refresh()
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <Grid.Root
            provider={catalogue}
            modules={{ rowModel: createClientSideRowModelModule(), sorting: createSortingModule() }}
            height='440px'
            onDataLoaded={() => setPaging(catalogue.getPaging())} />
        <Stack horizontal wrap horizontalAlign='space-between' verticalAlign='center' tokens={{ childrenGap: 8 }}>
            <span>Products {first}–{last} of {paging.totalResultCount}</span>
            <Stack horizontal verticalAlign='center' tokens={{ childrenGap: 4 }}>
                <Dropdown ariaLabel='Page size' options={PAGE_SIZES} selectedKey={paging.pageSize} onChange={(_, option) => changePageSize(Number(option?.key))} styles={{ root: { width: 140, marginRight: 8 } }} />
                <IconButton iconProps={{ iconName: 'ChevronLeft' }} title='Previous page' disabled={!paging.hasPreviousPage} onClick={() => catalogue.getPaging().loadPreviousPage()} />
                <span>Page {paging.pageNumber} of {pageCount}</span>
                <IconButton iconProps={{ iconName: 'ChevronRight' }} title='Next page' disabled={!paging.hasNextPage} onClick={() => catalogue.getPaging().loadNextPage()} />
            </Stack>
        </Stack>
    </Stack>
}
`

export const OwnRecordsExample = () => <GridExampleRunner seedCode={OWN_RECORDS_CODE} />

export const EveryDataTypeExample = () => <GridExampleRunner seedCode={EVERY_DATA_TYPE_CODE} />

export const RequiredAndReadOnlyExample = () => <GridExampleRunner seedCode={REQUIRED_AND_READ_ONLY_CODE} />

export const PageByPageExample = () => <GridExampleRunner seedCode={PAGE_BY_PAGE_CODE} />
