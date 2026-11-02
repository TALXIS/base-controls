import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { VIEWS_FILE, withFiles } from '../../dataset-control/examples/shared'

const BRAND_CODE = `import { loadDeals, loadDealViews } from './views'

const BRANDS = [
    { key: 'light', text: 'Light', colors: { primary: '#5B5FC7', background: '#ffffff', text: '#242424' } },
    { key: 'dark', text: 'Dark', colors: { primary: '#7f85f5', background: '#383838', text: '#ffffff' } },
    { key: 'forest', text: 'Forest', colors: { primary: '#2e7d32', background: '#f3f8f1', text: '#1b2e1c' } },
    { key: 'sand', text: 'Sand', colors: { primary: '#b35c00', background: '#fbf6ee', text: '#3b2a17' } },
]

const GridExample = () => {
    const [colors, setColors] = React.useState(BRANDS[1].colors)
    const theme = useThemeBuilder({ colors })

    const setColor = (name: keyof typeof colors, value: string) => setColors({ ...colors, [name]: value })

    return <Stack tokens={{ childrenGap: 12 }}>
        <Stack horizontal wrap verticalAlign='end' tokens={{ childrenGap: 16 }}>
            <Dropdown label='Brand' placeholder='Your own' options={BRANDS} selectedKey={BRANDS.find(brand => brand.colors === colors)?.key ?? null} onChange={(_, option) => setColors(BRANDS.find(brand => brand.key === option?.key)!.colors)} styles={{ root: { width: 160 } }} />
            {(['primary', 'background', 'text'] as const).map(name => <Stack key={name}>
                <Label>{name}</Label>
                <input type='color' value={colors[name]} onChange={event => setColor(name, event.target.value)} />
            </Stack>)}
        </Stack>
        <ThemeProvider theme={theme} style={{ padding: 12 }}>
            <DatasetControl key={theme.id} onLoadViews={loadDealViews} stateKey='deals' onLoad={loadDeals} height='420px'>
                <DatasetControl.Header>
                    <DatasetControl.Header.Start>
                        <DatasetControl.ViewSwitcher />
                    </DatasetControl.Header.Start>
                    <DatasetControl.Header.End>
                        <DatasetControl.EditColumns />
                        <DatasetControl.QuickFind />
                    </DatasetControl.Header.End>
                </DatasetControl.Header>
                <DatasetControl.Body>
                    <Grid stateKey='grid' modules={[createClientSideRowModelModule()]} />
                </DatasetControl.Body>
            </DatasetControl>
        </ThemeProvider>
    </Stack>
}
`

const OWN_COMPONENT_CODE = `const STAGES = [
    { name: 'Lead', color: '#fde68a' },
    { name: 'Proposal', color: '#60a5fa' },
    { name: 'Won', color: '#166534' },
]

//any colour works as a background: the text picks a readable colour for it
const StageTag = (props: { name: string; color: string }) => <span style={{ padding: '2px 8px', borderRadius: 4, background: props.color, color: getTextColorForBackground(props.color) }}>
    {props.name}
</span>

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
    const darkTheme = useThemeBuilder({ colors: { primary: '#7f85f5', background: '#383838', text: '#ffffff' } })
    return <Stack horizontal tokens={{ childrenGap: 12 }}>
        <Total label='Pipeline' value='$1,284,000' />
        <ThemeProvider theme={darkTheme} style={{ padding: 12 }}>
            <Total label='Won this quarter' value='$412,500' />
        </ThemeProvider>
    </Stack>
}
`

const SURFACE_CODE = `const ESCALATED = '#a4262c'

//every cell of an escalated ticket is drawn red, and so is any field inside it
const escalatedTicketsModule: IGridModule = {
    name: 'escalatedTickets',
    onLoad: grid => {
        grid.services.get('cells').registerCellTheme((theme, { record }) => {
            //a two-options value reads as '1' or '0'
            if (record.getValue('escalated') !== '1') {
                return
            }
            theme.colors.background = ESCALATED
            theme.colors.text = getTextColorForBackground(ESCALATED)
        })
    },
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <Grid modules={[createClientSideRowModelModule(), createEditingModule(), escalatedTicketsModule]} height='440px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const BrandExample = () => <GridExampleRunner seedCode={withFiles(BRAND_CODE, VIEWS_FILE)} />
export const OwnComponentExample = () => <GridExampleRunner seedCode={OWN_COMPONENT_CODE} />
export const SurfaceExample = () => <GridExampleRunner seedCode={SURFACE_CODE} dataset='tickets' />
