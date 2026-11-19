import React from 'react'
import { GridExampleRunner } from '../../GridExampleRunner'
import type { IGridExampleFile } from '../../GridLivePreview'
import { DEAL_LIST_TABS, DEALS_RIBBON_FILE, withDealGrid } from '../dealGridFiles'

const WRITE_A_MODULE_CODE = `import { ClientSideGrid, createEditingModule, createFilteringModule, createRowSelectionModule, createSortingModule, DatasetControl, IGridModule, useGridModule, useGridService } from '@talxis/base-controls'
import { IRecord } from '@talxis/client-libraries'
import { MessageBar, PrimaryButton } from '@fluentui/react'
import { loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'

//as in Lock closed deals
const WON = 4
const LOST = 5

//a won or lost stage reads '4' or '5'
const isClosed = (deal: IRecord) => [WON, LOST].includes(Number(deal.getValue('stage')))

//new: the lock of Lock closed deals as a module
const closedDealsModule: IGridModule<'closedDeals'> = {
    name: 'closedDeals',
    onLoad: grid => {
        //new: the editing module loads at the same time as this one
        grid.modules.observe('editing', editing => {
            editing.locks.hooks.row.add((result, { record }) => {
                if (isClosed(record)) {
                    result.isLocked = true
                }
            })
            editing.locks.hooks.cell.add((result, { record, columnName }) => {
                if (columnName === 'stage' && isClosed(record)) {
                    result.isLocked = false
                }
            })
        })
    },
}

//new: drawn inside the grid by the module below
const UnsavedChangesBar = () => {
    const unsavedChanges = useGridModule('unsavedChanges')
    const provider = useGridService('provider')
    const [count, setCount] = React.useState(unsavedChanges.getCount)

    React.useEffect(() => unsavedChanges.subscribe(setCount), [])

    if (count === 0) {
        return null
    }
    return <MessageBar isMultiline={false} actions={<PrimaryButton text='Save all' onClick={() => provider.save()} />}>
        {count === 1 ? '1 deal has unsaved changes.' : \`\${count} deals have unsaved changes.\`}
    </MessageBar>
}

//new: counts the deals with unsaved changes and draws the bar
const unsavedChangesModule: IGridModule<'unsavedChanges'> = {
    name: 'unsavedChanges',
    onLoad: grid => {
        const provider = grid.services.get('provider')
        const listeners = new Set<(count: number) => void>()
        const getCount = () => provider.getDirtyRecordIds().length
        const notify = () => listeners.forEach(listener => listener(getCount()))
        //new: drawn inside the grid, after the rows
        grid.services.get('surfaces').hooks.surfaces.add(surfaces => {
            surfaces.push({ key: 'unsavedChanges', onRender: () => <UnsavedChangesBar /> })
        })
        //new: the provider outlives the grid
        grid.services.observe('gridApi', () => {
            const unsubscribes = [
                provider.addEventListener('onRecordColumnValueChanged', notify),
                provider.addEventListener('onAfterRecordSaved', notify),
            ]
            return () => unsubscribes.forEach(unsubscribe => unsubscribe())
        })
        //new: what useGridModule('unsavedChanges') returns
        return {
            getCount,
            subscribe: listener => {
                listeners.add(listener)
                return () => listeners.delete(listener)
            },
        }
    },
}

const GridExample = () => <DatasetControl onLoad={loadDeals} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <DealsRibbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        {/* new: your modules go in beside the built-in ones */}
        <ClientSideGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule(), createSortingModule(), createFilteringModule(), closedDealsModule, unsavedChangesModule]} />
    </DatasetControl.Body>
</DatasetControl>
`

const WRITE_A_MODULE_TYPES_FILE: IGridExampleFile = {
    name: 'types.ts',
    code: `//names each module and what its onLoad returns
export interface IUnsavedChanges {
    getCount(): number
    subscribe(listener: (count: number) => void): () => void
}

declare module '@talxis/base-controls' {
    interface IGridModuleMap {
        unsavedChanges: IUnsavedChanges
        //its onLoad returns nothing
        closedDeals: void
    }
}
`,
}

const REOPEN_THE_LAST_OPENED_DEAL_CODE = `import { ClientSideGrid, createEditingModule, createFilteringModule, createRowSelectionModule, createSortingModule, DatasetControl, IGridModule } from '@talxis/base-controls'
import { IRecord } from '@talxis/client-libraries'
import { MessageBar, Toggle } from '@fluentui/react'
import { loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'

//new: what the module keeps in the grid's state
interface ILastOpenedDeal {
    recordId: string
}

//new: keeps the clicked deal in the grid's state for the next mount
const createLastOpenedDealModule = (onOpened: (deal: IRecord) => void): IGridModule<'lastOpenedDeal'> => ({
    name: 'lastOpenedDeal',
    onLoad: grid => {
        //new: the store under the grid's stateKey
        const state = grid.services.get('state')
        const provider = grid.services.get('provider')
        //new: the deals are there to find once AG Grid is ready
        grid.services.observe('gridApi', () => {
            const recordId = state.get<ILastOpenedDeal>('lastOpenedDeal')?.recordId
            const deal = recordId ? provider.getRecordsMap()[recordId] : undefined
            if (deal) {
                onOpened(deal)
            }
        })
        grid.services.get('rows').events.addEventListener('onRowClicked', deal => {
            state.set<ILastOpenedDeal>('lastOpenedDeal', { recordId: deal.getRecordId() })
            onOpened(deal)
        })
    },
})

const GridExample = () => {
    //stands in for leaving the page and coming back
    const [isShown, setIsShown] = React.useState(true)
    //new: the deal the module last handed over
    const [openedDeal, setOpenedDeal] = React.useState<IRecord>()

    //new: the bar goes with the deals
    const toggleDeals = (isOn: boolean) => {
        setOpenedDeal(undefined)
        setIsShown(isOn)
    }

    return <DatasetControl onLoad={loadDeals} height='480px'>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <Toggle inlineLabel label='Show the deals' checked={isShown} onChange={(_, checked) => toggleDeals(!!checked)} />
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                <DealsRibbon />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        {/* new: the last opened deal */}
        {openedDeal && <MessageBar>{openedDeal.getFormattedValue('name')}: {openedDeal.getFormattedValue('nextstep')}</MessageBar>}
        <DatasetControl.Body>
            {/* new: the key the grid and the module keep their state under */}
            {isShown && <ClientSideGrid stateKey='guide.module' modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule(), createSortingModule(), createFilteringModule(), createLastOpenedDealModule(setOpenedDeal)]} />}
        </DatasetControl.Body>
    </DatasetControl>
}
`

const REOPEN_THE_LAST_OPENED_DEAL_TYPES_FILE: IGridExampleFile = {
    name: 'types.ts',
    code: `//names the module for TypeScript
declare module '@talxis/base-controls' {
    interface IGridModuleMap {
        //its onLoad returns nothing
        lastOpenedDeal: void
    }
}

export { }
`,
}

export const WriteAModuleExample = () => <GridExampleRunner seedCode={withDealGrid(WRITE_A_MODULE_CODE, DEALS_RIBBON_FILE, WRITE_A_MODULE_TYPES_FILE)} tabs={DEAL_LIST_TABS} />

export const ReopenTheLastOpenedDealExample = () => <GridExampleRunner seedCode={withDealGrid(REOPEN_THE_LAST_OPENED_DEAL_CODE, DEALS_RIBBON_FILE, REOPEN_THE_LAST_OPENED_DEAL_TYPES_FILE)} tabs={DEAL_LIST_TABS} />
