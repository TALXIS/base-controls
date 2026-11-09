import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const BRAND_CODE = `import { AppThemeProvider, createClientSideRowModelModule, createSortingModule, DatasetControl, Grid, IRibbonCommand, useTheme, useThemeBuilder } from '@talxis/base-controls'
import { Dropdown, Label, Stack } from '@fluentui/react'

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
    {
        id: 'share', label: 'Share', iconName: 'Share', commands: [
            { id: 'email', label: 'Email a link', iconName: 'Mail', onExecute: () => {} },
            { id: 'copy', label: 'Copy link', iconName: 'Link', onExecute: () => {} },
        ],
    },
]

const modules = [createClientSideRowModelModule(), createSortingModule()]

const GridExample = () => {
    const isLightPage = !useTheme().isInverted
    const [colors, setColors] = React.useState(BRANDS[isLightPage ? 0 : 1].colors)
    //a new theme whenever a colour changes
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
        <AppThemeProvider theme={theme} style={{ padding: 12 }}>
            {/* a control reads the theme only as it mounts */}
            <DatasetControl key={theme.id} onLoad={async () => ({ provider })} height='400px'>
                <DatasetControl.Header>
                    <DatasetControl.Header.Start>
                        <DatasetControl.Ribbon onLoad={loadCommands} />
                    </DatasetControl.Header.Start>
                </DatasetControl.Header>
                <DatasetControl.Body>
                    <Grid modules={modules} />
                </DatasetControl.Body>
            </DatasetControl>
        </AppThemeProvider>
    </Stack>
}
`

const READABLE_TAGS_CODE = `import { getTintColors, ITintStrength, ThemeProvider, useTheme, useThemeBuilder } from '@talxis/base-controls'
import { Stack, Text } from '@fluentui/react'

const STAGES = [
    { name: 'Lead', hue: '#c19c00' },
    { name: 'Proposal', hue: '#0078d4' },
    { name: 'Won', hue: '#107c10', strength: 'strong' as const },
]

//one hue per stage, tinted for the theme the tag is drawn in
const StageTag = (props: { name: string; hue: string; strength?: ITintStrength }) => {
    const colors = getTintColors(props.hue, useTheme(), props.strength)
    return <span style={{ padding: '2px 8px', borderRadius: 4, background: colors.background, color: colors.text, border: \`1px solid \${colors.border}\` }}>
        {props.name}
    </span>
}

//takes its colours from whatever theme it is drawn in
const Total = (props: { label: string; value: string }) => {
    const { palette, semanticColors } = useTheme()
    return <Stack tokens={{ childrenGap: 8 }} style={{ padding: 12, borderLeft: \`4px solid \${palette.themePrimary}\`, background: semanticColors.bodyStandoutBackground }}>
        <Text style={{ color: semanticColors.bodySubtext }}>{props.label}</Text>
        <Text variant='xLarge' style={{ color: semanticColors.bodyText }}>{props.value}</Text>
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

const RED_ROWS_CODE = `import { createClientSideRowModelModule, createEditingModule, DatasetControl, Grid, IGridModule } from '@talxis/base-controls'

const ESCALATED = '#a4262c'

const escalatedTicketsModule: IGridModule = {
    name: 'escalatedTickets',
    onLoad: grid => {
        grid.services.get('cells').hooks.theme.add((builder, { record }) => {
            //a two-options value reads as '1' or '0'
            if (record.getValue('escalated') === '1') {
                builder.tint(ESCALATED, 'strong')
            }
        })
    },
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider })}>
    <DatasetControl.Body>
        <Grid modules={[createClientSideRowModelModule(), createEditingModule(), escalatedTicketsModule]} height='440px' />
    </DatasetControl.Body>
</DatasetControl>
`

const DERIVED_CODE = `import { createThemeBuilder, ITheme, ThemeProvider, useTheme, useThemeBuilder } from '@talxis/base-controls'
import { PrimaryButton, Stack, Text } from '@fluentui/react'

const HUE = '#d13438'

//outside React, tint and edit the builder, then call getTheme
const createAlertTheme = (theme: ITheme) => {
    const builder = createThemeBuilder({ theme })
    //'subtle' by default, or 'strong' or 'solid'
    builder.tint(HUE, 'strong')
    builder.edit('bold', theme => { theme.fonts.medium.fontWeight = 600 })
    return builder.getTheme()
}

const Card = (props: { title: string }) => {
    const { semanticColors } = useTheme()
    return <Stack tokens={{ childrenGap: 8 }} style={{ padding: 12, border: \`1px solid \${semanticColors.bodyDivider}\`, borderRadius: 4 }}>
        <Text variant='mediumPlus'>{props.title}</Text>
        <Text style={{ color: semanticColors.bodySubtext }}>The licence renews in 3 days.</Text>
        <PrimaryButton text='Renew' styles={{ root: { alignSelf: 'flex-start' } }} />
    </Stack>
}

const GridExample = () => {
    const pageTheme = useTheme()
    //three colours, or { fluentDesignLanguage } from a PCF host
    const ocean = useThemeBuilder({ colors: { primary: '#0f7b8a', background: '#f4fafb', text: '#12313a' } })
    //or an existing theme, here tinted by a hue
    const tinted = useThemeBuilder({ theme: pageTheme }, { tint: { hue: HUE } })
    //the edited theme is cached by key: a different edit needs a different key
    const compact = useThemeBuilder({ theme: pageTheme }, { edit: { key: 'compact-12', edit: theme => { theme.fonts.medium.fontSize = 12 } } })
    const alert = React.useMemo(() => createAlertTheme(pageTheme), [pageTheme])
    const cards = [{ title: 'colors', theme: ocean }, { title: 'tint', theme: tinted }, { title: 'edit', theme: compact }, { title: 'createThemeBuilder', theme: alert }]
    return <Stack horizontal wrap tokens={{ childrenGap: 12 }}>
        {cards.map(card => <ThemeProvider key={card.title} theme={card.theme} style={{ padding: 12 }}>
            <Card title={card.title} />
        </ThemeProvider>)}
    </Stack>
}
`

export const BrandExample = () => <GridExampleRunner seedCode={BRAND_CODE} />
export const RedRowsExample = () => <GridExampleRunner seedCode={RED_ROWS_CODE} dataset='tickets' />
export const ReadableTagsExample = () => <GridExampleRunner seedCode={READABLE_TAGS_CODE} tabs={['preview', 'code']} />
export const DerivedThemesExample = () => <GridExampleRunner seedCode={DERIVED_CODE} tabs={['preview', 'code']} />
