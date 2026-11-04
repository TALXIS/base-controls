import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
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
            <DatasetControl onLoadViews={loadDealViews} stateKey='layoutParts' onLoad={loadDeals} height='420px'>
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
                    <Grid stateKey='grid' modules={[createClientSideRowModelModule(), createRowSelectionModule({ mode: 'multiple' })]} />
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

export const PickPartsExample = () => <GridExampleRunner seedCode={withFiles(PICK_PARTS_CODE, VIEWS_FILE, LAYOUT_RIBBON_FILE)} tabs={['preview', 'code']} />

const FULL_PAGE_CODE = `import { loadDeals, loadDealViews } from './views'

const getPageStyles = (theme: ITheme) => mergeStyleSets({
    //stands in for the window the page fills
    window: { height: 480, border: \`1px solid \${theme.semanticColors.bodyDivider}\` },
    //a line of its own, above the header's start and end
    title: { flexBasis: '100%' },
})

const GridExample = () => {
    const theme = useTheme()
    const styles = React.useMemo(() => getPageStyles(theme), [theme])

    //height='100%' fills the parent, which needs a height of its own
    return <div className={styles.window}>
        <DatasetControl onLoadViews={loadDealViews} stateKey='layoutFullPage' onLoad={loadDeals} height='100%'>
            <DatasetControl.Header>
                <Text variant='xLarge' className={styles.title}>Sales pipeline</Text>
                <DatasetControl.Header.Start>
                    <DatasetControl.ViewSwitcher />
                </DatasetControl.Header.Start>
                <DatasetControl.Header.End>
                    <DatasetControl.EditColumns />
                    <DatasetControl.QuickFind />
                </DatasetControl.Header.End>
            </DatasetControl.Header>
            {/* takes what the header and the footer leave */}
            <DatasetControl.Body>
                <Grid stateKey='grid' modules={[createClientSideRowModelModule(), createSortingModule()]} />
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
}
`

export const FullPageExample = () => <GridExampleRunner seedCode={withFiles(FULL_PAGE_CODE, VIEWS_FILE)} tabs={['preview', 'code']} />
