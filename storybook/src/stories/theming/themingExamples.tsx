import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { VIEWS_FILE, withFiles } from '../../dataset-control/examples/shared'

const BRAND_CODE = `import { IDealViewData, loadDeals, loadDealViews, saveDealViewData } from './views'

const BRANDS = [
    { key: 'light', text: 'Light', colors: { primary: '#5B5FC7', background: '#ffffff', text: '#242424' } },
    { key: 'dark', text: 'Dark', colors: { primary: '#7f85f5', background: '#292929', text: '#ffffff' } },
    { key: 'ocean', text: 'Ocean', colors: { primary: '#0f7b8a', background: '#f4fafb', text: '#12313a' } },
    { key: 'rose', text: 'Rose', colors: { primary: '#c2185b', background: '#fff7fa', text: '#3a1424' } },
    { key: 'midnight', text: 'Midnight', colors: { primary: '#4cc2ff', background: '#0f1b2d', text: '#e6edf7' } },
    { key: 'amber', text: 'Amber', colors: { primary: '#f5a623', background: '#1e1e1e', text: '#f2f2f2' } },
]

const loadCommands = async (): Promise<IRibbonCommand[]> => [
    { id: 'new', label: 'New deal', iconName: 'Add', onExecute: () => {} },
    { id: 'assign', label: 'Assign', iconName: 'Contact', onExecute: () => {} },
    { id: 'share', label: 'Share', iconName: 'Share', onExecute: () => {} },
]

const GridExample = () => {
    const isLightPage = isLightColor(useTheme().semanticColors.bodyBackground)
    const [colors, setColors] = React.useState(BRANDS[isLightPage ? 0 : 1].colors)
    const theme = useThemeBuilder({ colors })
    const controlModules = React.useMemo(() => [createLocalStorageUserQueriesModule<IDealViewData>({ storageKey: 'theming.deals.views' })], [])
    const gridModules = React.useMemo(() => [
        createClientSideRowModelModule(),
        createEditingModule(),
        createRowSelectionModule({ mode: 'multiple' }),
        createCellSelectionModule(),
        createClipboardModule(),
        createSortingModule(),
        createFilteringModule(),
        createGroupingModule(),
        createAggregationModule(),
    ], [])

    const setColor = (name: keyof typeof colors, value: string) => setColors({ ...colors, [name]: value })

    return <Stack tokens={{ childrenGap: 12 }}>
        <Stack horizontal wrap verticalAlign='end' tokens={{ childrenGap: 16 }}>
            <Dropdown label='Brand' placeholder='Your own' options={BRANDS} selectedKey={BRANDS.find(brand => brand.colors === colors)?.key ?? null} onChange={(_, option) => setColors(BRANDS.find(brand => brand.key === option?.key)!.colors)} styles={{ root: { width: 160 } }} />
            {(['primary', 'background', 'text'] as const).map(name => <Stack key={name}>
                <Label>{name}</Label>
                <input type='color' value={colors[name]} onChange={event => setColor(name, event.target.value)} />
            </Stack>)}
        </Stack>
        <ApplicationThemeProvider theme={theme} style={{ padding: 12 }}>
            <DatasetControl key={theme.id} modules={controlModules} onLoadViews={loadDealViews} stateKey='deals' onLoad={loadDeals} onMounted={saveDealViewData} height='480px'>
                <DatasetControl.Header>
                    <DatasetControl.Header.Start>
                        <DatasetControl.ViewSwitcher />
                        <DatasetControl.Ribbon onLoad={loadCommands} />
                    </DatasetControl.Header.Start>
                    <DatasetControl.Header.End>
                        <DatasetControl.EditColumns />
                        <DatasetControl.QuickFind />
                    </DatasetControl.Header.End>
                </DatasetControl.Header>
                <DatasetControl.Body>
                    <Grid stateKey='grid' modules={gridModules} />
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
        </ApplicationThemeProvider>
    </Stack>
}
`

const READABLE_TAGS_CODE = `const STAGES = [
    { name: 'Lead', hue: '#c19c00' },
    { name: 'Proposal', hue: '#0078d4' },
    { name: 'Won', hue: '#107c10', strength: 'strong' as const },
]

//one hue per stage, tinted for the theme the tag is drawn in
const StageTag = (props: { name: string; hue: string; strength?: ITintStrength }) => {
    const theme = useThemeBuilder({ theme: useTheme() }, { tint: { hue: props.hue, strength: props.strength } })
    return <ThemeProvider theme={theme} style={{ padding: '2px 8px', borderRadius: 4 }}>
        {props.name}
    </ThemeProvider>
}

//takes its colours from whatever theme it is drawn in
const Total = (props: { label: string; value: string }) => {
    const { palette, semanticColors, fonts } = useTheme()
    return <Stack tokens={{ childrenGap: 8 }} style={{ padding: 12, borderLeft: \`4px solid \${palette.themePrimary}\`, background: semanticColors.bodyStandoutBackground }}>
        <Text style={{ color: semanticColors.bodySubtext }}>{props.label}</Text>
        <Text style={{ ...fonts.xLarge, color: semanticColors.bodyText }}>{props.value}</Text>
        <Stack horizontal tokens={{ childrenGap: 4 }}>{STAGES.map(stage => <StageTag key={stage.name} {...stage} />)}</Stack>
    </Stack>
}

const GridExample = () => {
    const lightTheme = useThemeBuilder({ colors: { primary: '#5B5FC7', background: '#ffffff', text: '#242424' } })
    const darkTheme = useThemeBuilder({ colors: { primary: '#7f85f5', background: '#292929', text: '#ffffff' } })
    return <Stack horizontal tokens={{ childrenGap: 12 }}>
        <ThemeProvider theme={lightTheme} style={{ padding: 12 }}>
            <Total label='Pipeline' value='$1,284,000' />
        </ThemeProvider>
        <ThemeProvider theme={darkTheme} style={{ padding: 12 }}>
            <Total label='Won this quarter' value='$412,500' />
        </ThemeProvider>
    </Stack>
}
`

const RED_ROWS_CODE = `const ESCALATED = '#a4262c'

const escalatedTicketsModule: IGridModule = {
    name: 'escalatedTickets',
    onLoad: grid => {
        grid.services.get('cells').registerCellTheme((builder, { record }) => {
            //a two-options value reads as '1' or '0'
            if (record.getValue('escalated') === '1') {
                builder.tint(ESCALATED, 'strong')
            }
        }, GRID_MODULE_PRIORITY.grouping + 1)
    },
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <Grid modules={[createClientSideRowModelModule(), createEditingModule(), escalatedTicketsModule]} height='440px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const BrandExample = () => <GridExampleRunner seedCode={withFiles(BRAND_CODE, VIEWS_FILE)} />
export const RedRowsExample = () => <GridExampleRunner seedCode={RED_ROWS_CODE} dataset='tickets' />
export const ReadableTagsExample = () => <GridExampleRunner seedCode={READABLE_TAGS_CODE} />
