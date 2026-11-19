import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'
import type { IGridExampleFile } from '../GridLivePreview'
import { DEAL_LIST_TABS, withDealGrid } from '../guide/dealGridFiles'

const COLUMN_ORDER_LOCK_TYPES_FILE: IGridExampleFile = { name: 'types.ts', code: `//names the module for TypeScript
declare module '@talxis/base-controls' {
    interface IGridModuleMap {
        //its onLoad returns nothing
        columnOrderLock: void
    }
}
` }

const HIGHLIGHT_CHANGES_TYPES_FILE: IGridExampleFile = { name: 'types.ts', code: `//names the module for TypeScript
declare module '@talxis/base-controls' {
    interface IGridModuleMap {
        //its onLoad returns nothing
        highlightChanges: void
    }
}
` }

const REARRANGE_COLUMNS_CODE = `import { ClientSideGrid, DatasetControl, IGrid, IGridModule } from '@talxis/base-controls'
import { Toggle } from '@fluentui/react'
import { loadDeals } from './deals'

const createColumnOrderLock = (isUnlocked: () => boolean): IGridModule => ({
    name: 'columnOrderLock',
    onLoad: grid => {
        //read only when AG Grid is created
        grid.hooks.agGridInitialOptions.add(result => {
            result.options.ensureDomOrder = true
        })
        //read again on every refreshAgGridOptions()
        grid.hooks.agGridOptions.add(result => {
            result.options.suppressMovableColumns = !isUnlocked()
        })
    },
})

const GridExample = () => {
    const isArranging = React.useRef(false)
    const gridRef = React.useRef<IGrid>()

    const toggleArranging = (checked: boolean) => {
        isArranging.current = checked
        gridRef.current?.refreshAgGridOptions()
    }

    return <DatasetControl onLoad={loadDeals} height='480px'>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <Toggle label='Rearrange columns' inlineLabel onChange={(_, checked) => toggleArranging(!!checked)} />
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <ClientSideGrid modules={[createColumnOrderLock(() => isArranging.current)]} onReady={grid => { gridRef.current = grid }} />
        </DatasetControl.Body>
    </DatasetControl>
}
`

const JUMP_TO_THE_NEXT_DEAL_TO_CLOSE_CODE = `import { ClientSideGrid, DatasetControl, IGrid, IGridModule, IRibbonCommand } from '@talxis/base-controls'
import { IRecord } from '@talxis/client-libraries'
import { loadDeals } from './deals'

const WON = 4
const LOST = 5

//flashCells needs HighlightChangesModule from ag-grid-community
const highlightChanges: IGridModule = { name: 'highlightChanges', agGridModules: [HighlightChangesModule], onLoad: () => { } }

const isOpen = (deal: IRecord) => ![WON, LOST].includes(Number(deal.getValue('stage')))

//the open deal that closes first from today on
const findNextToClose = (deals: IRecord[]) => deals
    .filter(deal => isOpen(deal) && deal.getValue('closedate') && !dayjs(deal.getValue('closedate')).isBefore(dayjs(), 'day'))
    .sort((a, b) => dayjs(a.getValue('closedate')).diff(b.getValue('closedate')))[0]

const GridExample = () => {
    const gridRef = React.useRef<IGrid>()

    const jumpToNextToClose = () => {
        const gridApi = gridRef.current!.services.get('gridApi')
        const deal = findNextToClose(gridRef.current!.services.get('provider').getRecords())
        //a row's id is its record's id
        const node = gridApi.getRowNode(deal.getRecordId())!
        gridApi.ensureNodeVisible(node, 'middle')
        //the grid draws the row it scrolled to a frame later
        requestAnimationFrame(() => requestAnimationFrame(() => gridApi.flashCells({ rowNodes: [node] })))
    }

    const loadCommands = async (): Promise<IRibbonCommand[]> => [
        { id: 'nextToClose', label: 'Jump to the next deal to close', iconName: 'Calendar', onExecute: jumpToNextToClose },
    ]

    return <DatasetControl onLoad={loadDeals} height='480px'>
        <DatasetControl.Header>
            <DatasetControl.Header.End>
                <DatasetControl.Ribbon onLoad={loadCommands} />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <ClientSideGrid modules={[highlightChanges]} onReady={grid => { gridRef.current = grid }} />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const RearrangeColumnsExample = () => <GridExampleRunner seedCode={withDealGrid(REARRANGE_COLUMNS_CODE, COLUMN_ORDER_LOCK_TYPES_FILE)} tabs={DEAL_LIST_TABS} />

export const JumpToTheNextDealToCloseExample = () => <GridExampleRunner seedCode={withDealGrid(JUMP_TO_THE_NEXT_DEAL_TO_CLOSE_CODE, HIGHLIGHT_CHANGES_TYPES_FILE)} tabs={DEAL_LIST_TABS} />
