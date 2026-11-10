import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { accountRecord } from './shared'

const FLUENT_V9_CODE = `import { V9, V9Provider } from './v9'

const account = ${accountRecord(['name', 'industrycode', 'description'])}

const V9Field = (props: { name: string }) => <Form.Field name={props.name}>
    <Form.Cell>
        <Form.Control components={V9.control} />
    </Form.Cell>
</Form.Field>

const GridExample = () => {
    const [tab, setTab] = React.useState('general')

    return <V9Provider>
        <Form.Root onLoad={async () => ({ record: account })}>
            <Form.Ribbon components={V9.ribbon} />
            {/* clear the account name and save to see an error beside this message */}
            <Form.Notifications messages={[{ text: 'Contoso is a key account.', level: 'INFO' }]} components={V9.notifications} />
            <Form.Tabs expandedTab={tab} onTabChange={setTab} components={V9.tabs}>
                <Form.Tab id='general' label='General'>
                    <Form.Column>
                        <Form.Section label='Account'>
                            <V9Field name='name' />
                            <V9Field name='industrycode' />
                        </Form.Section>
                    </Form.Column>
                </Form.Tab>
                <Form.Tab id='notes' label='Notes'>
                    <Form.Column>
                        <Form.Section label='About'>
                            <V9Field name='description' />
                        </Form.Section>
                    </Form.Column>
                </Form.Tab>
            </Form.Tabs>
        </Form.Root>
    </V9Provider>
}
`

const V9_FILE = `import { Dropdown, FluentProvider, Input, MessageBar, MessageBarBody, MessageBarGroup, Option, Tab, TabList, Textarea, Toolbar, ToolbarButton, webDarkTheme, webLightTheme } from '@fluentui/react-components'
import { SaveRegular, WarningRegular } from '@fluentui/react-icons'

//v9 components need a FluentProvider, light or dark to match the Fluent v8 theme
export const V9Provider = (props: { children: React.ReactNode }) => <FluentProvider theme={useTheme().isInverted ? webDarkTheme : webLightTheme} style={{ background: 'transparent' }}>
    {props.children}
</FluentProvider>

//an input for the field it sits in, picked by the column's data type
const V9Control = (props: { disabled?: boolean }) => {
    const field = useField()!
    const column = field.getColumn()
    const value = field.getValue()
    switch (column.dataType) {
        case DataTypes.OptionSet: {
            const options: { Value: number; Label: string }[] = column.metadata?.OptionSet ?? []
            const selected = options.find(option => String(option.Value) === String(value))
            return <Dropdown value={selected?.Label ?? ''} selectedOptions={selected ? [String(selected.Value)] : []} disabled={props.disabled} onOptionSelect={(_, data) => field.setValue(Number(data.optionValue))}>
                {options.map(option => <Option key={option.Value} value={String(option.Value)}>{option.Label}</Option>)}
            </Dropdown>
        }
        case DataTypes.Multiple:
            return <Textarea value={value ?? ''} disabled={props.disabled} onChange={(_, data) => field.setValue(data.value || null)} />
        default:
            return <Input value={value ?? ''} disabled={props.disabled} onChange={(_, data) => field.setValue(data.value || null)} />
    }
}

//its own Save in place of the Fluent v8 one in props.items, and Unsaved changes from props.farItems
const V9Ribbon = (props: ICommandBarProps) => {
    const form = useForm()
    return <Toolbar>
        <ToolbarButton icon={<SaveRegular />} onClick={() => form.save()}>Save</ToolbarButton>
        {props.farItems?.map(item => <ToolbarButton key={item.key} icon={<WarningRegular />} disabled>{item.text}</ToolbarButton>)}
    </Toolbar>
}

const V9Tabs = (props: ITabsComponentProps) => {
    const tabs = React.Children.toArray(props.children) as React.ReactElement<{ id: string; label?: string }>[]
    return <div>
        <TabList selectedValue={props.expandedTab} onTabSelect={(_, data) => props.onTabChange(String(data.value))}>
            {tabs.map(tab => <Tab key={tab.props.id} value={tab.props.id}>{tab.props.label ?? tab.props.id}</Tab>)}
        </TabList>
        {tabs.find(tab => tab.props.id === props.expandedTab)}
    </div>
}

const INTENTS = { ERROR: 'error', WARNING: 'warning', INFO: 'info' } as const

/** The components of each part, drawn with Fluent UI v9. */
export const V9 = {
    control: { onRenderControl: (props: { disabled?: boolean }) => <V9Control disabled={props.disabled} /> },
    ribbon: { onRenderCommandBar: (props: ICommandBarProps) => <V9Ribbon {...props} /> },
    tabs: { onRenderTabs: (props: ITabsComponentProps) => <V9Tabs {...props} /> },
    //a field's message names the field in <strong>
    notifications: { onRenderNotifications: (props: { messages?: { text: string; level: 'ERROR' | 'WARNING' | 'INFO' }[] }) => <MessageBarGroup>
        {props.messages?.map((message, index) => <MessageBar key={index} intent={INTENTS[message.level]}>
            <MessageBarBody>
                <span dangerouslySetInnerHTML={{ __html: message.text }} />
            </MessageBarBody>
        </MessageBar>)}
    </MessageBarGroup> },
}
`

export const FluentV9Example = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: FLUENT_V9_CODE }, { name: 'v9.tsx', code: V9_FILE }]} tabs={['preview', 'code']} />
