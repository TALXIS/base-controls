import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { STORE_OPENINGS_TABS, STORES_RIBBON_FILE, withStoreOpenings } from '../storeOpeningsFiles'

const VIEWS_AND_COMMANDS_CODE = `import { ClientSideGrid, createAggregationModule, createEditingModule, createFilteringModule, createRowSelectionModule, createSortingModule, DatasetControl, IDatasetControlView } from '@talxis/base-controls'
import { Operators, Type } from '@talxis/client-libraries'
import { createStoresProvider, OPEN, VIEW_COLUMNS } from './stores'
import { StoresRibbon } from './StoresRibbon'

//new: each view sets the provider up as it opens, and returns its columns
const VIEWS: IDatasetControlView[] = [
    { id: 'all', name: 'All stores', resolve: () => ({ columns: VIEW_COLUMNS }) },
    {
        id: 'notopen',
        name: 'Not open yet',
        //the stores still to open, soonest first
        resolve: provider => {
            provider.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'status', conditionOperator: Operators.DoesNotEqual.Value, value: String(OPEN) }] })
            provider.setSorting([{ name: 'openingdate', sortDirection: 0 }])
            return { columns: VIEW_COLUMNS }
        },
    },
]

//new: the views come with the provider
const loadStores = async () => ({ provider: createStoresProvider(), views: VIEWS })

const Stores = () => <>
    <DatasetControl.Header>
        {/* new: lists the views and opens the one picked */}
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            {/* new: Mark N as open, beside Save and Discard changes */}
            <StoresRibbon />
            {/* new: picks the columns of the open view */}
            <DatasetControl.EditColumns />
            {/* new: searches the stores by name, manager and country */}
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid
            enableOptionSetColors
            modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule(), createSortingModule(), createFilteringModule(), createAggregationModule()]} />
    </DatasetControl.Body>
</>

const StoreOpenings = () => <DatasetControl onLoad={loadStores} height='520px'>
    <Stores />
</DatasetControl>

const GridExample = () => <StoreOpenings />
`

const VIEWS_AND_COMMANDS_FILES = withStoreOpenings(VIEWS_AND_COMMANDS_CODE, STORES_RIBBON_FILE)

export const ViewsAndCommandsExample = () => <GridExampleRunner seedCode={VIEWS_AND_COMMANDS_FILES} tabs={STORE_OPENINGS_TABS} />
