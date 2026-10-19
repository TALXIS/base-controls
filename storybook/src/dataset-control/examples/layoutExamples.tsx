import React from 'react'
import { mergeStyleSets, Text } from '@fluentui/react'
import { createClientSideRowModelModule, createRowSelectionModule, createSortingModule, DatasetControl, Grid, IRibbonCommand, useDataProvider } from '@talxis/base-controls'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { loadDeals, loadDealViews } from '../dealViews'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { VIEWS_FILE, withFiles } from './shared'

//enough commands that narrowing the control folds some into the overflow menu
const LAYOUT_RIBBON_FILE: IGridExampleFile = {
    name: 'DealsRibbon.tsx',
    code: `//stands in for a server call, during which the button is disabled
const serverCall = () => new Promise<void>(resolve => setTimeout(resolve, 1000))

export const DealsRibbon = () => {
    const provider = useDataProvider()

    const onLoad = async (): Promise<IRibbonCommand[]> => [
        { id: 'refresh', label: 'Refresh', iconName: 'Refresh', onExecute: async () => { await provider.refresh() } },
        { id: 'newDeal', label: 'New deal', iconName: 'Add', onExecute: serverCall },
        { id: 'assign', label: 'Assign', iconName: 'Contact', onExecute: serverCall },
        { id: 'share', label: 'Share', iconName: 'Share', onExecute: serverCall },
        { id: 'follow', label: 'Follow', iconName: 'FavoriteStar', onExecute: serverCall },
        { id: 'email', label: 'Email a link', iconName: 'Mail', onExecute: serverCall },
        { id: 'flow', label: 'Run flow', iconName: 'Flow', onExecute: serverCall },
    ]

    return <DatasetControl.Ribbon onLoad={onLoad} />
}
`,
}

const PICK_PARTS_CODE = `import { loadDeals, loadDealViews } from './views'
import { DealsRibbon } from './DealsRibbon'

const PARTS = ['View switcher', 'Ribbon', 'Edit columns', 'Quick find', 'Your own button', 'Notifications', 'Page size', 'Pagination']

//only its icon while the header is compact, like the built-in parts
const ExportButton = () => {
    const isCompact = useCompact()
    if (isCompact) {
        return <TooltipHost content='Export to Excel'>
            <IconButton iconProps={{ iconName: 'ExcelDocument' }} ariaLabel='Export to Excel' />
        </TooltipHost>
    }
    return <DefaultButton text='Export to Excel' iconProps={{ iconName: 'ExcelDocument' }} />
}

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
            <DatasetControl onLoadViews={loadDealViews} stateKey='deals' onLoad={loadDeals} height='420px'>
                <DatasetControl.Header>
                    <DatasetControl.Header.Start>
                        {has('View switcher') && <DatasetControl.ViewSwitcher />}
                        {has('Ribbon') && !has('View switcher') && <DealsRibbon />}
                    </DatasetControl.Header.Start>
                    <DatasetControl.Header.End>
                        {has('Ribbon') && has('View switcher') && <DealsRibbon />}
                        {has('Edit columns') && <DatasetControl.EditColumns />}
                        {has('Quick find') && <DatasetControl.QuickFind />}
                        {has('Your own button') && <ExportButton />}
                    </DatasetControl.Header.End>
                </DatasetControl.Header>
                {has('Notifications') && <DatasetControl.Notifications messages={[{ text: 'Deals are synced from the CRM every night.', level: 'INFO' }]} />}
                <DatasetControl.Body>
                    <Grid stateKey='grid' modules={{ rowModel: createClientSideRowModelModule(), rowSelection: createRowSelectionModule({ mode: 'multiple' }) }} />
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

export const PickPartsExample = () => <GridExampleRunner seedCode={withFiles(PICK_PARTS_CODE, VIEWS_FILE, LAYOUT_RIBBON_FILE)} />

const FullPageRibbon = () => {
    const provider = useDataProvider()
    const onLoad = async (): Promise<IRibbonCommand[]> => [
        { id: 'refresh', label: 'Refresh', iconName: 'Refresh', onExecute: async () => { await provider.refresh() } },
        ...(provider.getSelectedRecordIds().length > 0 ? [{ id: 'clearSelection', label: 'Clear selection', iconName: 'Clear', onExecute: () => provider.clearSelectedRecordIds() }] : []),
    ]
    return <DatasetControl.Ribbon onLoad={onLoad} />
}

const pageStyles = mergeStyleSets({
    page: { height: '100vh' },
    header: { padding: '12px 20px 0' },
    //a line of its own, above the regions
    title: { flexBasis: '100%' },
})

/** A page that is all the control, filling the window with `height='100%'`, its title in the header. */
export const FullPageExample = () => <div className={pageStyles.page}>
    <DatasetControl onLoadViews={loadDealViews} stateKey='deals' onLoad={loadDeals} height='100%'>
        <DatasetControl.Header className={pageStyles.header}>
            <Text variant='xLarge' className={pageStyles.title}>Sales pipeline</Text>
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
            <Grid stateKey='grid' modules={{ rowModel: createClientSideRowModelModule(), rowSelection: createRowSelectionModule({ mode: 'multiple' }), sorting: createSortingModule() }} />
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
