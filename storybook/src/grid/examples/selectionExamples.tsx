import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const APPROVE_IN_BULK_CODE = `const SUBMITTED = 2
const APPROVED = 3

//approved entries are final
const keepApprovedUnselected: IGridModule = {
    name: 'keepApprovedUnselected',
    onLoad: grid => {
        grid.modules.observe('rowSelection', rowSelection => rowSelection.hooks.selectRecords.add((selection, { provider }) => {
            const records = provider.getRecordsMap()
            selection.recordIds = selection.recordIds.filter(id => Number(records[id]?.getValue('status')) !== APPROVED)
        }))
    },
}

const approve = (entries: IRecord[]) => {
    entries.forEach(entry => {
        entry.setValue('status', APPROVED)
        entry.save()
    })
    provider.clearSelectedRecordIds()
}

const selectSubmitted = () => {
    const submitted = provider.getRecords().filter(entry => Number(entry.getValue('status')) === SUBMITTED)
    provider.setSelectedRecordIds(submitted.map(entry => entry.getRecordId()))
}

//loaded again whenever the selection changes
const loadCommands = async (): Promise<IRibbonCommand[]> => {
    const entries = provider.getSelectedRecordIds().map(id => provider.getRecordsMap()[id])
    return [
        { id: 'approve', label: 'Approve (' + entries.length + ')', iconName: 'CheckMark', disabled: entries.length === 0, onExecute: () => approve(entries) },
        { id: 'selectSubmitted', label: 'Select all submitted', iconName: 'MultiSelect', onExecute: selectSubmitted },
    ]
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.Ribbon onLoad={loadCommands} />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createRowSelectionModule({ mode: 'multiple' }), keepApprovedUnselected]}
            height='440px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const PICK_ONE_PRODUCT_CODE = `const GridExample = () => {
    const [productId, setProductId] = React.useState<string>()
    const product = productId ? provider.getRecordsMap()[productId] : undefined

    //the selection is the provider's
    React.useEffect(() => provider.addEventListener('onRecordsSelected', ids => setProductId(ids[0])), [])

    return <DatasetControl onLoad={async () => ({ provider: provider })}>
        <MessageBar>{product ? 'Quote for ' + product.getValue('name') + ', ' + product.getFormattedValue('price') + '.' : 'Pick the product to quote.'}</MessageBar>
        <DatasetControl.Body>
            <ClientSideGrid modules={[createRowSelectionModule({ mode: 'single' })]}
                height='440px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const COPY_PRICE_LIST_CODE = `const GridExample = () => {
    const [spreadsheet, setSpreadsheet] = React.useState('')

    return <>
        <DatasetControl onLoad={async () => ({ provider: provider })}>
            <DatasetControl.Body>
                <ClientSideGrid modules={[createCellSelectionModule(), createClipboardModule({ copyHeadersToClipboard: true })]}
                    height='360px' />
            </DatasetControl.Body>
        </DatasetControl>
        <TextField label='Your spreadsheet' placeholder='Paste here with Ctrl+V' multiline value={spreadsheet} onChange={(_event, value) => setSpreadsheet(value ?? '')} />
    </>
}
`

export const ApproveInBulkExample = () => <GridExampleRunner seedCode={APPROVE_IN_BULK_CODE} dataset='timesheets' />
export const PickOneProductExample = () => <GridExampleRunner seedCode={PICK_ONE_PRODUCT_CODE} dataset='products' />
export const CopyPriceListExample = () => <GridExampleRunner seedCode={COPY_PRICE_LIST_CODE} dataset='products' />
