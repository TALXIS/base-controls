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
    const theme = useThemeGenerator(colors)

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

const OWN_COMPONENT_CODE = `//takes its colours from whatever theme it is drawn in
const Total = (props: { label: string; value: string }) => {
    const { palette, semanticColors, fonts } = useTheme()
    return <Stack style={{ padding: 12, borderLeft: \`4px solid \${palette.themePrimary}\`, background: semanticColors.bodyStandoutBackground }}>
        <Text style={{ color: semanticColors.bodySubtext }}>{props.label}</Text>
        <Text style={{ ...fonts.xLarge, color: semanticColors.bodyText }}>{props.value}</Text>
    </Stack>
}

const GridExample = () => {
    const highlightTheme = useThemeGenerator({ primary: '#7f85f5', background: '#383838', text: '#ffffff' })
    return <Stack horizontal tokens={{ childrenGap: 12 }}>
        <Total label='Pipeline' value='$1,284,000' />
        <ThemeProvider theme={highlightTheme} style={{ padding: 12 }}>
            <Total label='Won this quarter' value='$412,500' />
        </ThemeProvider>
    </Stack>
}
`

const SURFACE_CODE = `const SURFACE_THEMES = [
    { key: 'application', text: 'The application theme' },
    { key: 'own', text: 'A theme of its own' },
    { key: 'none', text: 'Not set' },
]

const ACTIONS = [{ key: 'export', text: 'Export', iconProps: { iconName: 'Download' }, subMenuProps: { items: [{ key: 'csv', text: 'CSV' }, { key: 'excel', text: 'Excel' }, { key: 'pdf', text: 'PDF' }] } }]

//Callout draws in the surface theme, and so does everything inside it
const DealDetails = () => {
    const [isOpen, setIsOpen] = React.useState(false)
    const targetRef = React.useRef<HTMLDivElement>(null)
    return <div ref={targetRef}>
        <DefaultButton text='Details' onClick={() => setIsOpen(!isOpen)} />
        {isOpen && <Callout target={targetRef} onDismiss={() => setIsOpen(false)}>
            <Stack tokens={{ childrenGap: 4 }} style={{ padding: 16 }}>
                <Text variant='mediumPlus'>Contoso renewal</Text>
                <Text>$412,500, closing on 30 June</Text>
                <Link>Open the deal</Link>
            </Stack>
        </Callout>}
    </div>
}

const GridExample = () => {
    const applicationTheme = useTheme()
    const bannerTheme = useThemeGenerator({ primary: '#7f85f5', background: '#383838', text: '#ffffff' })
    const ownTheme = useThemeGenerator({ primary: '#b35c00', background: '#fbf6ee', text: '#3b2a17' })
    const [surfaceThemeKey, setSurfaceThemeKey] = React.useState('application')
    const surfaceTheme = { application: applicationTheme, own: ownTheme, none: undefined }[surfaceThemeKey]

    return <Stack tokens={{ childrenGap: 12 }}>
        <ChoiceGroup label='The banner opens its surfaces in' options={SURFACE_THEMES} selectedKey={surfaceThemeKey} onChange={(_, option) => setSurfaceThemeKey(option!.key)} />
        <ThemeProvider theme={bannerTheme} surfaceTheme={surfaceTheme} style={{ padding: 12 }}>
            <Stack horizontal verticalAlign='center' tokens={{ childrenGap: 12 }}>
                <Text variant='large'>Won this quarter: $412,500</Text>
                <CommandBar items={ACTIONS} />
                <DealDetails />
            </Stack>
        </ThemeProvider>
    </Stack>
}
`

export const BrandExample = () => <GridExampleRunner seedCode={withFiles(BRAND_CODE, VIEWS_FILE)} />
export const OwnComponentExample = () => <GridExampleRunner seedCode={OWN_COMPONENT_CODE} />
export const SurfaceExample = () => <GridExampleRunner seedCode={SURFACE_CODE} />
