import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const APPROVE_IN_BULK_CODE = `const SUBMITTED = 2
const APPROVED = 3
const REJECTED = 4

const GridExample = () => {
    const [selectedIds, setSelectedIds] = React.useState<string[]>([])
    const selectedEntries = selectedIds.map(id => provider.getRecordsMap()[id])
    const selectedHours = selectedEntries.reduce((total, entry) => total + Number(entry.getValue('hours') ?? 0), 0)
    const hasSelection = selectedEntries.length > 0

    const setStatus = (status: number) => {
        selectedEntries.forEach(entry => {
            entry.setValue('status', status)
            entry.save()
        })
        provider.clearSelectedRecordIds()
    }

    const selectSubmitted = () => {
        const submitted = provider.getRecords().filter(entry => Number(entry.getValue('status')) === SUBMITTED)
        provider.setSelectedRecordIds(submitted.map(entry => entry.getRecordId()))
    }

    const commands: ICommandBarItemProps[] = [
        { key: 'approve', text: 'Approve (' + selectedEntries.length + ')', iconProps: { iconName: 'CheckMark' }, disabled: !hasSelection, onClick: () => setStatus(APPROVED) },
        { key: 'reject', text: 'Reject (' + selectedEntries.length + ')', iconProps: { iconName: 'Cancel' }, disabled: !hasSelection, onClick: () => setStatus(REJECTED) },
        { key: 'selectSubmitted', text: 'Select all submitted', iconProps: { iconName: 'MultiSelect' }, onClick: selectSubmitted },
        { key: 'clear', text: 'Clear selection', iconProps: { iconName: 'Clear' }, disabled: !hasSelection, onClick: () => provider.clearSelectedRecordIds() },
    ]

    return <Stack tokens={{ childrenGap: 8 }}>
        <CommandBar items={commands} />
        {hasSelection && <MessageBar>{selectedEntries.length} {selectedEntries.length === 1 ? 'entry' : 'entries'} selected, {selectedHours} hours in all.</MessageBar>}
        <Grid.Root
            provider={provider}
            modules={{
                rowModel: createClientSideRowModelModule(),
                rowSelection: createRowSelectionModule({ mode: 'multiple', onSelectionChanged: setSelectedIds }),
                sorting: createSortingModule(),
            }}
            enableOptionSetColors
            height='440px' />
    </Stack>
}
`

export const PICK_ONE_PRODUCT_CODE = `const styles = mergeStyleSets({
    grid: { flexGrow: 1, minWidth: 0 },
    card: { width: 260, flexShrink: 0, padding: 16, border: '1px solid #edebe9', borderRadius: 8 },
    photo: { width: 96, height: 96, borderRadius: 12 },
    muted: { color: '#605e5c' },
    warning: { color: '#a4262c' },
})

interface IProductCardProps {
    product?: IRecord
}

const ProductCard = (props: IProductCardProps) => {
    const { product } = props
    if (!product) {
        return <Stack className={styles.card} verticalAlign='center' horizontalAlign='center'>
            <Text variant='small' className={styles.muted}>Pick a product to see its details.</Text>
        </Stack>
    }
    const inStock = Number(product.getValue('instock') ?? 0)
    const needsReorder = inStock <= Number(product.getValue('reorderlevel') ?? 0)
    return <Stack className={styles.card} tokens={{ childrenGap: 8 }}>
        <img className={styles.photo} src={product.getValue('photo')?.thumbnailUrl} alt='' />
        <Text variant='xLarge'>{product.getValue('name')}</Text>
        <Text variant='small' className={styles.muted}>{product.getValue('sku')}</Text>
        <Text variant='large'>{product.getFormattedValue('price')}</Text>
        <Text className={needsReorder ? styles.warning : undefined}>{inStock === 0 ? 'Out of stock' : inStock + ' in stock'}{needsReorder ? ', reorder now' : ''}</Text>
        <Text>Supplied by {product.getValue('supplier')}</Text>
        <Text variant='small' className={styles.muted}>Last restocked {product.getFormattedValue('lastrestocked')}</Text>
    </Stack>
}

const GridExample = () => {
    const [productId, setProductId] = React.useState<string>()

    return <Stack horizontal tokens={{ childrenGap: 16 }}>
        <div className={styles.grid}>
            <Grid.Root
                provider={provider}
                modules={{
                    rowModel: createClientSideRowModelModule(),
                    rowSelection: createRowSelectionModule({ mode: 'single', onSelectionChanged: ids => setProductId(ids[0]) }),
                }}
                height='440px' />
        </div>
        <ProductCard product={productId ? provider.getRecordsMap()[productId] : undefined} />
    </Stack>
}
`

export const COPY_PRICE_LIST_CODE = `const GridExample = () => {
    const [spreadsheet, setSpreadsheet] = React.useState('')

    return <Stack tokens={{ childrenGap: 12 }}>
        <Grid.Root
            provider={provider}
            modules={{
                rowModel: createClientSideRowModelModule(),
                cellSelection: createCellSelectionModule(),
                clipboard: createClipboardModule({ copyHeadersToClipboard: true }),
            }}
            height='360px' />
        <TextField
            label='Your spreadsheet'
            placeholder='Paste here with Ctrl+V'
            multiline
            rows={7}
            value={spreadsheet}
            onChange={(_event, value) => setSpreadsheet(value ?? '')}
            styles={{ field: { fontFamily: 'Consolas, monospace', whiteSpace: 'pre' } }} />
    </Stack>
}
`

export const ApproveInBulkExample = () => <GridExampleRunner seedCode={APPROVE_IN_BULK_CODE} dataset='timesheets' />
export const PickOneProductExample = () => <GridExampleRunner seedCode={PICK_ONE_PRODUCT_CODE} dataset='products' />
export const CopyPriceListExample = () => <GridExampleRunner seedCode={COPY_PRICE_LIST_CODE} dataset='products' />
