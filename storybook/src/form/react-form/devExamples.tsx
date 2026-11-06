import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const DEMO_RECORD_FILE = `const OPTIONS = [
    { Value: 1, Label: 'Low', Color: '#107c10' },
    { Value: 2, Label: 'Medium', Color: '#c19c00' },
    { Value: 3, Label: 'High', Color: '#a4262c' },
]

/** Set by the ribbon; every save waits 3 seconds, then fails while it is on. */
export const saves = { fail: true }

/** One record with a field of every data type the form draws. */
export const createDemoRecord = () => createMemoryRecord({
    columns: [
        { name: 'text', displayName: 'Text', dataType: DataTypes.SingleLineText, metadata: { RequiredLevel: 2 } },
        { name: 'multiline', displayName: 'Multiline text', dataType: DataTypes.Multiple },
        { name: 'email', displayName: 'Email', dataType: DataTypes.SingleLineEmail },
        { name: 'phone', displayName: 'Phone', dataType: DataTypes.SingleLinePhone },
        { name: 'url', displayName: 'URL', dataType: DataTypes.SingleLineUrl },
        { name: 'whole', displayName: 'Whole number', dataType: DataTypes.WholeNone },
        { name: 'decimal', displayName: 'Decimal', dataType: DataTypes.Decimal },
        { name: 'currency', displayName: 'Currency', dataType: DataTypes.Currency },
        { name: 'duration', displayName: 'Duration', dataType: DataTypes.WholeDuration },
        { name: 'dateonly', displayName: 'Date only', dataType: DataTypes.DateAndTimeDateOnly },
        { name: 'datetime', displayName: 'Date and time', dataType: DataTypes.DateAndTimeDateAndTime },
        { name: 'optionset', displayName: 'Option set', dataType: DataTypes.OptionSet, metadata: { OptionSet: OPTIONS } },
        { name: 'multiselect', displayName: 'Multi-select option set', dataType: DataTypes.MultiSelectOptionSet, metadata: { OptionSet: OPTIONS } },
        { name: 'twooptions', displayName: 'Two options', dataType: DataTypes.TwoOptions, metadata: { OptionSet: [{ Value: 1, Label: 'Yes', Color: '' }, { Value: 0, Label: 'No', Color: '' }] } },
    ],
    data: {
        id: '1',
        text: 'Alice',
        multiline: 'Senior project manager with a background in delivery.',
        email: 'alice@contoso.com',
        phone: '+420 720 453 674',
        url: 'https://contoso.com',
        whole: 42,
        decimal: 54321.123,
        currency: 450000,
        duration: 480,
        dateonly: '2024-10-05',
        datetime: '2023-01-15T08:45:30',
        optionset: 2,
        multiselect: '1,3',
        twooptions: true,
    },
    metadata: { PrimaryIdAttribute: 'id', PrimaryNameAttribute: 'text' },
    save: async record => {
        await new Promise(resolve => setTimeout(resolve, 3000))
        const fields = record.getFields().filter(field => field.isDirty()).map(field => field.getColumn().name)
        if (saves.fail) {
            return { recordId: record.getRecordId(), success: false, fields, errors: [{ message: 'The server refused the save.' }] }
        }
        return { recordId: record.getRecordId(), success: true, fields }
    },
})
`

const SCRATCH_CODE = `import { createDemoRecord, saves } from './record'

const record = createDemoRecord()

const DemoRibbon = (props: ICommandBarProps) => {
    const form = useForm()
    const [isFailing, setIsFailing] = React.useState(saves.fail)
    const commands: ICommandBarItemProps[] = [
        { key: 'refresh', text: 'Refresh', iconProps: { iconName: 'Refresh' }, onClick: () => form.reload() },
        { key: 'fail', text: 'Saves fail', canCheck: true, checked: isFailing, iconProps: { iconName: 'Warning' }, onClick: () => {
            saves.fail = !saves.fail
            setIsFailing(saves.fail)
        } },
    ]
    return <CommandBar {...props} items={[...(props.items ?? []), ...commands]} />
}

const field = (name: string) => <Form.Field key={name} name={name}><Form.Cell><Form.Control /></Form.Cell></Form.Field>

const GridExample = () => {
    const [tab, setTab] = React.useState('general')

    return <Form.Root onLoad={async () => ({ record })} enableAutoSave>
        <Form.Ribbon components={{ onRenderCommandBar: props => <DemoRibbon {...props} /> }} />
        <Form.Notifications />
        <Form.Tabs expandedTab={tab} onTabChange={setTab}>
            <Form.Tab id='general' label='General'>
                <Form.Column>
                    <Form.Section label='Text' layout={{ lg: 1 }}>{['text', 'email', 'phone', 'url'].map(field)}</Form.Section>
                </Form.Column>
                <Form.Column>
                    <Form.Section label='Numbers' layout={{ lg: 1 }}>{['whole', 'decimal', 'currency', 'duration'].map(field)}</Form.Section>
                </Form.Column>
            </Form.Tab>
            <Form.Tab id='choices' label='Choices and dates'>
                <Form.Column>
                    <Form.Section label='Choices' layout={{ lg: 1 }}>{['optionset', 'multiselect', 'twooptions'].map(field)}</Form.Section>
                </Form.Column>
                <Form.Column>
                    <Form.Section label='Dates' layout={{ lg: 1 }}>{['dateonly', 'datetime'].map(field)}</Form.Section>
                </Form.Column>
            </Form.Tab>
            <Form.Tab id='notes' label='Notes'>
                <Form.Column>
                    <Form.Section label='Notes'>{field('multiline')}</Form.Section>
                </Form.Column>
            </Form.Tab>
        </Form.Tabs>
    </Form.Root>
}
`

const HIDDEN_TAB_VALIDATION_CODE = `const record = createMemoryRecord({
    columns: [
        { name: 'text', displayName: 'Text', dataType: DataTypes.SingleLineText },
        { name: 'phone', displayName: 'Phone', dataType: DataTypes.SingleLinePhone },
    ],
    data: { id: '1', text: 'Alice', phone: '+420 720 453 674' },
    metadata: { PrimaryIdAttribute: 'id', PrimaryNameAttribute: 'text' },
})

const HIDDEN_FIELD_VALIDATION = { error: true, errorMessage: 'Hidden validation should block save before the hidden tab is opened.' }

const GridExample = () => {
    const [tab, setTab] = React.useState('main')
    const [summary, setSummary] = React.useState<{ fieldName?: string; errorMessage?: string }[]>([])

    return <Form.Root onLoad={async () => ({ record })} onValidationSummaryChanged={setSummary}>
        <Stack tokens={{ childrenGap: 12 }}>
            <MessageBar messageBarType={MessageBarType.info} isMultiline>
                Scenario: hidden-tab validation registration. Start on <strong>Main</strong> and save without opening <strong>Hidden validation</strong>.
                The save should be blocked at once, because Form.Root registers the hidden field's config.
            </MessageBar>
            {summary.length > 0 && <MessageBar messageBarType={MessageBarType.warning} isMultiline>
                {summary.map((validation, index) => <div key={index}>{validation.fieldName ?? 'form'}: {validation.errorMessage}</div>)}
            </MessageBar>}
            <Form.Notifications />
            <Form.Ribbon />
            <Form.Tabs expandedTab={tab} onTabChange={setTab}>
                <Form.Tab id='main' label='Main'>
                    <Form.Column>
                        <Form.Section label='Visible fields' layout={{ lg: 1 }}>
                            <Form.Field name='text'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                        </Form.Section>
                    </Form.Column>
                </Form.Tab>
                <Form.Tab id='hidden' label='Hidden validation'>
                    <Form.Column>
                        <Form.Section label='Hidden field config' layout={{ lg: 1 }}>
                            <Form.Field name='phone' requiredLevel={2} validation={HIDDEN_FIELD_VALIDATION}>
                                <Form.Cell><Form.Control /></Form.Cell>
                            </Form.Field>
                        </Form.Section>
                    </Form.Column>
                </Form.Tab>
            </Form.Tabs>
        </Stack>
    </Form.Root>
}
`

export const ScratchExample = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: SCRATCH_CODE }, { name: 'record.ts', code: DEMO_RECORD_FILE }]} tabs={['preview', 'code']} />

export const HiddenTabValidationExample = () => <GridExampleRunner seedCode={HIDDEN_TAB_VALIDATION_CODE} tabs={['preview', 'code']} />
