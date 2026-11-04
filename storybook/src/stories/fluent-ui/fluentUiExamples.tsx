import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const COMMAND_BARS_CODE = `import { CommandBar as FluentCommandBar } from '@fluentui/react'
import { CommandBar } from '@talxis/base-controls'

const ITEMS: ICommandBarItemProps[] = [
    { key: 'new', text: 'New', iconProps: { iconName: 'Add' } },
    { key: 'edit', text: 'Edit', iconProps: { iconName: 'Edit' } },
    {
        key: 'share', text: 'Share', iconProps: { iconName: 'Share' },
        subMenuProps: {
            items: [
                { key: 'email', text: 'Email a link', iconProps: { iconName: 'Mail' } },
                { key: 'copy', text: 'Copy link', iconProps: { iconName: 'Link' } },
            ],
        },
    },
    { key: 'export', text: 'Export to Excel', iconProps: { iconName: 'ExcelDocument' } },
    { key: 'assign', text: 'Assign', iconProps: { iconName: 'Contact' } },
    { key: 'delete', text: 'Delete', iconProps: { iconName: 'Delete' } },
]

const FAR_ITEMS: ICommandBarItemProps[] = [
    { key: 'filter', text: 'Filter', iconOnly: true, iconProps: { iconName: 'Filter' } },
]

//each bar sits on a strip in TALXIS green, which is a theme of its own
const Bar = (props: { title: string, children: JSX.Element }) => {
    const pageTheme = useTheme()
    const strip = useThemeBuilder({ theme: pageTheme }, { tint: { hue: '#2f9b70', strength: 'solid' } })
    return <Stack>
        <Label>{props.title}</Label>
        <ThemeProvider theme={strip} style={{ borderRadius: 6, overflow: 'hidden', padding: '0 8px' }}>{props.children}</ThemeProvider>
    </Stack>
}

const GridExample = () => {
    const bars = React.useRef<HTMLDivElement>(null)
    //sets the width on the element, so the bars resize without re-rendering, like a splitter would
    const resize = (percent: number) => bars.current!.style.width = \`\${percent}%\`

    return <Stack tokens={{ childrenGap: 12 }}>
        <Slider label='Width' min={30} max={100} defaultValue={100} valueFormat={value => \`\${value}%\`} onChange={resize} styles={{ root: { maxWidth: 320 } }} />
        <div ref={bars}>
            <Stack tokens={{ childrenGap: 16 }}>
                <Bar title="Fluent's CommandBar">
                    {/* folds its commands only when the window resizes */}
                    {/* its menus and tooltips open in the strip's theme */}
                    <FluentCommandBar items={ITEMS} farItems={FAR_ITEMS} />
                </Bar>
                <Bar title="Base Controls' CommandBar">
                    {/* folds its commands whenever its own box resizes */}
                    {/* its menus, submenus and tooltips open in the app theme */}
                    {/* no side padding, so it lines up with what holds it */}
                    <CommandBar items={ITEMS} farItems={FAR_ITEMS} />
                </Bar>
            </Stack>
        </div>
    </Stack>
}
`

export const CommandBarsExample = () => <GridExampleRunner seedCode={COMMAND_BARS_CODE} tabs={['preview', 'code']} />
