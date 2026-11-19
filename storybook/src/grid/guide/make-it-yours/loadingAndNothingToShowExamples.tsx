import React from 'react'
import { GridExampleRunner } from '../../GridExampleRunner'
import { DEAL_LIST_TABS, DEALS_RIBBON_FILE, withDealGrid } from '../dealGridFiles'

const LOADING_AND_NOTHING_TO_SHOW_CODE = `import { ClientSideGrid, createEditingModule, createFilteringModule, createRowSelectionModule, createSortingModule, DatasetControl, IGridComponents } from '@talxis/base-controls'
import { Icon, mergeStyleSets, ProgressIndicator, Stack, Text } from '@fluentui/react'
import { loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'

const styles = mergeStyleSets({
    //new: a card in AG Grid's own background and shadow
    card: { display: 'flex', flexDirection: 'column', gap: 12, width: 280, padding: 24, borderRadius: 8, background: 'var(--ag-background-color)', boxShadow: 'var(--ag-popup-shadow)' },
})

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
        loading: {
            onRender: props => <div {...props} className={styles.card} />,
            //new: says what the grid waits for
            onRenderSpinner: () => <ProgressIndicator label='Waiting for the CRM' />,
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
