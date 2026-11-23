import React from 'react'
import { GridExampleRunner } from '../../GridExampleRunner'
import { DEAL_LIST_TABS, DEALS_RIBBON_FILE, withDealGrid } from '../dealGridFiles'

const LOADING_AND_NOTHING_TO_SHOW_CODE = `import { ClientSideGrid, createEditingModule, createFilteringModule, createRowSelectionModule, createSortingModule, DatasetControl, IGridComponents } from '@talxis/base-controls'
import { Icon, Stack, Text } from '@fluentui/react'
import { loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'

//new: the pieces the grid draws over its rows
const COMPONENTS: IGridComponents = {
    overlays: {
        emptyState: {
            onRenderIcon: props => <Icon {...props} iconName='Money' />,
            //new: the label, then a hint of your own
            onRenderText: props => <Stack horizontalAlign='center' tokens={{ childrenGap: 4 }}>
                <Text {...props} variant='large' />
                <Text>Try a lower value or clear a filter.</Text>
            </Stack>,
        },
    },
}

const GridExample = () => <DatasetControl onLoad={loadDeals} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <DealsRibbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule(), createSortingModule(), createFilteringModule()]}
            //new: your pieces in place of the grid's
            components={COMPONENTS} />
    </DatasetControl.Body>
</DatasetControl>
`

export const LoadingAndNothingToShowExample = () => <GridExampleRunner seedCode={withDealGrid(LOADING_AND_NOTHING_TO_SHOW_CODE, DEALS_RIBBON_FILE)} tabs={DEAL_LIST_TABS} />
