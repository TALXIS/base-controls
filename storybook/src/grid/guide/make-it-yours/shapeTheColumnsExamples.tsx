import React from 'react'
import { GridExampleRunner } from '../../GridExampleRunner'
import { DEAL_LIST_TABS, DEALS_RIBBON_FILE, withDealGrid } from '../dealGridFiles'

const SHAPE_THE_COLUMNS_CODE = `import { ClientSideGrid, createEditingModule, createFilteringModule, createRowSelectionModule, createSortingModule, DatasetControl, Form, GRID_MODULE_PRIORITY, IGrid, Panel } from '@talxis/base-controls'
import { IRecord } from '@talxis/client-libraries'
import { loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'

//new: the columns the panel's form shows
const FORM_COLUMNS = ['name', 'stage', 'value', 'closedate', 'nextstep']

const GridExample = () => {
    //new: the deal the user opened from its name
    const [openedDeal, setOpenedDeal] = React.useState<IRecord>()

    //new: called with each new grid before it loads
    const shapeColumns = (grid: IGrid) => {
        const columns = grid.services.get('columns')
        //new: runs each time the grid builds its columns
        columns.hooks.columnDefinitions.add(columnDefs => {
            const deal = columnDefs.find(colDef => colDef.colId === 'name')!
            //new: Deal stays at the left edge
            deal.pinned = 'left'
            //new: each name is a link to its deal
            deal.context = { ...deal.context, isPrimary: true }
            const recurring = columnDefs.find(colDef => colDef.colId === 'recurring')!
            //new: a switch in each cell
            recurring.context = { ...recurring.context, cell: { ...recurring.context?.cell, enableOneClickEdit: true } }
            //new: room for the notes
            columnDefs.find(colDef => colDef.colId === 'notes')!.initialWidth = 360
        })
        //new: runs after the sorting module sets sortable
        columns.hooks.columnDefinitions.add(columnDefs => {
            columnDefs.find(colDef => colDef.colId === 'notes')!.sortable = false
        }, GRID_MODULE_PRIORITY.sorting + 1)
        //new: opens the clicked deal in the panel
        grid.hooks.openRecord.add(request => {
            request.isHandled = true
            setOpenedDeal(request.record)
        })
    }

    return <>
        <DatasetControl onLoad={loadDeals} height='480px'>
            <DatasetControl.Header>
                <DatasetControl.Header.End>
                    <DealsRibbon />
                </DatasetControl.Header.End>
            </DatasetControl.Header>
            <DatasetControl.Body>
                <ClientSideGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule(), createSortingModule(), createFilteringModule()]}
                    onSetup={shapeColumns} />
            </DatasetControl.Body>
        </DatasetControl>
        {/* new: the opened deal in a form */}
        <Panel isOpen={!!openedDeal} headerText={openedDeal?.getValue('name')} isLightDismiss onDismiss={() => setOpenedDeal(undefined)}>
            {openedDeal && <Form.Root key={openedDeal.getRecordId()} onLoad={async () => ({ record: openedDeal })}>
                <Form.Section cellLabelPosition='Top'>
                    {FORM_COLUMNS.map(columnName => <Form.Field key={columnName} name={columnName}>
                        <Form.Cell>
                            <Form.Control />
                        </Form.Cell>
                    </Form.Field>)}
                </Form.Section>
            </Form.Root>}
        </Panel>
    </>
}
`

export const ShapeTheColumnsExample = () => <GridExampleRunner seedCode={withDealGrid(SHAPE_THE_COLUMNS_CODE, DEALS_RIBBON_FILE)} tabs={DEAL_LIST_TABS} />
