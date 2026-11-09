import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const TOOLBAR_CODE = `import { TooltipHost, useCompact, WrapCompactProvider } from '@talxis/base-controls'
import { DefaultButton, IconButton, SearchBox, Slider, Stack } from '@fluentui/react'

const ACTIONS = [
    { key: 'new', text: 'New deal', iconName: 'Add' },
    { key: 'export', text: 'Export to Excel', iconName: 'ExcelDocument' },
    { key: 'share', text: 'Share', iconName: 'Share' },
]

//a labelled button while the row fits, an icon with a tooltip once it would wrap
const Action = (props: { text: string; iconName: string }) => {
    const isCompact = useCompact()
    if (isCompact) {
        return <TooltipHost content={props.text}>
            <IconButton iconProps={{ iconName: props.iconName }} ariaLabel={props.text} />
        </TooltipHost>
    }
    return <DefaultButton text={props.text} iconProps={{ iconName: props.iconName }} />
}

const Search = () => {
    const isCompact = useCompact()
    return <SearchBox placeholder='Search deals' styles={{ root: { width: isCompact ? 140 : 240 } }} />
}

const GridExample = () => {
    const [width, setWidth] = React.useState(100)
    return <Stack tokens={{ childrenGap: 12 }}>
        <Slider label='Width (%)' min={25} max={100} value={width} onChange={setWidth} />
        <div style={{ width: \`\${width}%\` }}>
            <WrapCompactProvider style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                {ACTIONS.map(action => <Action key={action.key} text={action.text} iconName={action.iconName} />)}
                <Search />
            </WrapCompactProvider>
        </div>
    </Stack>
}
`

const FILTER_CHIPS_CODE = `import { useCompact, useCompactItem, useTheme, WrapCompactProvider } from '@talxis/base-controls'
import { IconButton, Stack, Text } from '@fluentui/react'

const FILTERS = [
    { key: 'stage', label: 'Stage', value: 'Won' },
    { key: 'owner', label: 'Account manager', value: 'Anna Novak' },
    { key: 'region', label: 'Region', value: 'Europe' },
    { key: 'value', label: 'Value', value: 'Over $10,000' },
]

//the label and the value while the row fits, only the value once it would wrap
const Chip = (props: { label: string, value: string, onRemove: () => void }) => {
    //tells the provider when the chip goes, so the rest try full size again
    useCompactItem()
    const isCompact = useCompact()
    const theme = useTheme()
    return <Stack horizontal verticalAlign='center' style={{ padding: '2px 4px 2px 10px', borderRadius: 16, background: theme.palette.themeLighter }}>
        <Text>{isCompact ? props.value : \`\${props.label}: \${props.value}\`}</Text>
        <IconButton iconProps={{ iconName: 'Cancel' }} ariaLabel={\`Remove \${props.label}\`} onClick={props.onRemove} styles={{ root: { width: 24, height: 24 } }} />
    </Stack>
}

const GridExample = () => {
    const [filters, setFilters] = React.useState(FILTERS)
    return <WrapCompactProvider style={{ display: 'flex', flexWrap: 'wrap', gap: 6, width: 420 }}>
        {filters.map(filter => <Chip key={filter.key} label={filter.label} value={filter.value} onRemove={() => setFilters(rest => rest.filter(other => other.key !== filter.key))} />)}
    </WrapCompactProvider>
}
`

const SECTION_TABS_CODE = `import { BreakpointCompactProvider, useCompact } from '@talxis/base-controls'
import { Dropdown, Pivot, PivotItem, Slider, Stack, Text } from '@fluentui/react'

const SECTIONS = [
    { key: 'summary', text: 'Summary', content: 'Contoso renewal: $412,500, closing on 30 June.' },
    { key: 'contacts', text: 'Contacts', content: 'Anna Novak, account manager. Ben Carter, procurement.' },
    { key: 'activities', text: 'Activities', content: 'Call with procurement on Tuesday, proposal sent on Friday.' },
]

//tabs while there is room, a dropdown on a phone
const Sections = (props: { selectedKey: string; onChange: (key: string) => void }) => {
    const isCompact = useCompact()
    if (isCompact) {
        return <Dropdown ariaLabel='Section' options={SECTIONS} selectedKey={props.selectedKey} onChange={(_, option) => props.onChange(String(option!.key))} />
    }
    return <Pivot selectedKey={props.selectedKey} onLinkClick={item => props.onChange(item!.props.itemKey!)}>
        {SECTIONS.map(section => <PivotItem key={section.key} itemKey={section.key} headerText={section.text} />)}
    </Pivot>
}

const GridExample = () => {
    const [width, setWidth] = React.useState(640)
    const [selectedKey, setSelectedKey] = React.useState('summary')
    return <Stack tokens={{ childrenGap: 12 }}>
        <Slider label='Width (px)' min={280} max={800} step={20} value={width} onChange={setWidth} />
        {/* the slider sets the width the provider compares with 479px */}
        <BreakpointCompactProvider style={{ width }}>
            <Sections selectedKey={selectedKey} onChange={setSelectedKey} />
            <Text>{SECTIONS.find(section => section.key === selectedKey)!.content}</Text>
        </BreakpointCompactProvider>
    </Stack>
}
`

export const ToolbarExample = () => <GridExampleRunner seedCode={TOOLBAR_CODE} tabs={['preview', 'code']} />
export const FilterChipsExample = () => <GridExampleRunner seedCode={FILTER_CHIPS_CODE} tabs={['preview', 'code']} />
export const SectionTabsExample = () => <GridExampleRunner seedCode={SECTION_TABS_CODE} tabs={['preview', 'code']} />
