import React from 'react'
import { mergeStyleSets, Text } from '@fluentui/react'
import { createClientSideRowModelModule, createRowSelectionModule, createSortingModule, DatasetControl, Grid, IRibbonCommand, useDataProvider } from '@talxis/base-controls'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { loadDeals } from '../dealViews'
import { RIBBON_FILE, VIEWS_FILE, withFiles } from './shared'

const PICK_PARTS_CODE = `import { loadDeals } from './views'
import { DealsRibbon } from './DealsRibbon'

const PARTS = ['View switcher', 'Ribbon', 'Edit columns', 'Quick find', 'Your own button', 'Page size', 'Pagination']

const GridExample = () => {
    const [parts, setParts] = React.useState<string[]>(PARTS)
    const [width, setWidth] = React.useState(100)
    const has = (part: string) => parts.includes(part)
    const toggle = (part: string, checked?: boolean) => setParts(parts => checked ? [...parts, part] : parts.filter(other => other !== part))

    return <Stack tokens={{ childrenGap: 12 }}>
        <Stack horizontal wrap tokens={{ childrenGap: 16 }}>
            {PARTS.map(part => <Checkbox key={part} label={part} checked={has(part)} onChange={(_, checked) => toggle(part, checked)} />)}
        </Stack>
        <Slider label='Width (%)' min={30} max={100} value={width} onChange={setWidth} />
        <div style={{ width: \`\${width}%\` }}>
            <DatasetControl stateKey='deals' onLoad={loadDeals} height='420px'>
                <DatasetControl.Header>
                    <DatasetControl.Header.Start>
                        {has('View switcher') && <DatasetControl.ViewSwitcher />}
                        {has('Ribbon') && !has('View switcher') && <DealsRibbon />}
                    </DatasetControl.Header.Start>
                    <DatasetControl.Header.End>
                        {has('Ribbon') && has('View switcher') && <DealsRibbon />}
                        {has('Edit columns') && <DatasetControl.EditColumns />}
                        {has('Quick find') && <DatasetControl.QuickFind />}
                        {has('Your own button') && <DefaultButton text='Export to Excel' iconProps={{ iconName: 'ExcelDocument' }} />}
                    </DatasetControl.Header.End>
                </DatasetControl.Header>
                <DatasetControl.Body>
                    <Grid.Root stateKey='grid' modules={{ rowModel: createClientSideRowModelModule(), rowSelection: createRowSelectionModule({ mode: 'multiple' }) }} />
                </DatasetControl.Body>
                <DatasetControl.Footer>
                    <DatasetControl.Footer.Start>
                        {has('Page size') && <DatasetControl.PageSizeSwitcher />}
                    </DatasetControl.Footer.Start>
                    <DatasetControl.Footer.End>
                        {has('Pagination') && <DatasetControl.Pagination />}
                    </DatasetControl.Footer.End>
                </DatasetControl.Footer>
            </DatasetControl>
        </div>
    </Stack>
}
`

export const PickPartsExample = () => <GridExampleRunner seedCode={withFiles(PICK_PARTS_CODE, VIEWS_FILE, RIBBON_FILE)} />

const FullPageRibbon = () => {
    const provider = useDataProvider()
    const onLoad = async (): Promise<IRibbonCommand[]> => [
        { id: 'refresh', label: 'Refresh', iconName: 'Refresh', onExecute: async () => { await provider.refresh() } },
        ...(provider.getSelectedRecordIds().length > 0 ? [{ id: 'clearSelection', label: 'Clear selection', iconName: 'Clear', onExecute: () => provider.clearSelectedRecordIds() }] : []),
    ]
    return <DatasetControl.Ribbon onLoad={onLoad} />
}

const pageStyles = mergeStyleSets({
    page: { height: '100vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', padding: '16px 24px', gap: 16 },
    title: { flexShrink: 0 },
    content: { flex: 1, minHeight: 0 },
})

/** A page with a title, and the control filling the rest of the window with `height='100%'`. */
export const FullPageExample = () => <div className={pageStyles.page}>
    <Text variant='xLarge' className={pageStyles.title}>Sales pipeline</Text>
    <div className={pageStyles.content}>
        <DatasetControl stateKey='deals' onLoad={loadDeals} height='100%'>
            <DatasetControl.Header>
                <DatasetControl.Header.Start>
                    <DatasetControl.ViewSwitcher />
                </DatasetControl.Header.Start>
                <DatasetControl.Header.End>
                    <FullPageRibbon />
                    <DatasetControl.EditColumns />
                    <DatasetControl.QuickFind />
                </DatasetControl.Header.End>
            </DatasetControl.Header>
            <DatasetControl.Body>
                <Grid.Root stateKey='grid' modules={{ rowModel: createClientSideRowModelModule(), rowSelection: createRowSelectionModule({ mode: 'multiple' }), sorting: createSortingModule() }} />
            </DatasetControl.Body>
            <DatasetControl.Footer>
                <DatasetControl.Footer.Start>
                    <DatasetControl.PageSizeSwitcher />
                </DatasetControl.Footer.Start>
                <DatasetControl.Footer.End>
                    <DatasetControl.Pagination />
                </DatasetControl.Footer.End>
            </DatasetControl.Footer>
        </DatasetControl>
    </div>
</div>
