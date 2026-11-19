import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const RECORD_FILE = `const OPTIONS = [
    { Value: 1, Label: 'Low', Color: '#107c10' },
    { Value: 2, Label: 'Medium', Color: '#c19c00' },
    { Value: 3, Label: 'High', Color: '#a4262c' },
]

/** One account held in memory. */
export const createRecord = () => createMemoryRecord({
    columns: [
        { name: 'name', displayName: 'Name', dataType: DataTypes.SingleLineText, metadata: { RequiredLevel: 2 } },
        { name: 'email', displayName: 'Email', dataType: DataTypes.SingleLineEmail },
        { name: 'phone', displayName: 'Phone', dataType: DataTypes.SingleLinePhone },
        { name: 'website', displayName: 'Website', dataType: DataTypes.SingleLineUrl },
        { name: 'revenue', displayName: 'Revenue', dataType: DataTypes.Currency },
        { name: 'employees', displayName: 'Employees', dataType: DataTypes.WholeNone },
        { name: 'priority', displayName: 'Priority', dataType: DataTypes.OptionSet, metadata: { OptionSet: OPTIONS } },
        { name: 'since', displayName: 'Customer since', dataType: DataTypes.DateAndTimeDateOnly },
        { name: 'notes', displayName: 'Notes', dataType: DataTypes.Multiple },
    ],
    data: {
        id: '1',
        name: 'Contoso Ltd.',
        email: 'info@contoso.com',
        phone: '+420 123 456 789',
        website: 'https://contoso.com',
        revenue: 450000,
        employees: 120,
        priority: 2,
        since: '2019-03-01',
        notes: 'Makes office furniture and sells it through regional dealers.',
    },
    metadata: { PrimaryIdAttribute: 'id', PrimaryNameAttribute: 'name' },
})
`

const PLAYGROUND_CODE = `import { createRecord } from './record'

//a header in a theme of its own, drawn through its slot
const TintedHeader = (props: React.HTMLAttributes<HTMLDivElement>) => {
    const tinted = useThemeBuilder({ theme: useTheme() }, { tint: { hue: '#2f9b70', strength: 'solid' } })
    return <ThemeProvider {...props} theme={tinted} />
}

//every part is found through the form, also on tabs not opened yet
const Toolbar = (props: { form: IForm; log: (line: string) => void }) => {
    const { form, log } = props
    return <Stack horizontal wrap tokens={{ childrenGap: 8 }}>
        <DefaultButton text='Disable "notes" (closed tab)' onClick={() => {
            const notes = form.controls.get('notes')
            notes.setDisabled(!notes.isDisabled())
            log(\`notes disabled: \${notes.isDisabled()}, its tab loaded: \${notes.getTab()?.isLoaded()}\`)
        }} />
        <DefaultButton text='Hide "finance" section' onClick={() => {
            const finance = form.sections.get('finance')
            finance.setVisible(!finance.isVisible())
        }} />
        <DefaultButton text='Rename "contact" section' onClick={() => {
            const contact = form.sections.get('contact')
            contact.setLabel(contact.getLabel() === 'Contact' ? 'Who to call' : 'Contact')
        }} />
        <DefaultButton text='Hide "details" tab' onClick={() => {
            const details = form.tabs.get('details')
            details.setVisible(!details.isVisible())
        }} />
        <DefaultButton text='Rename "other" tab' onClick={() => {
            const other = form.tabs.get('other')
            other.setLabel(other.getLabel() === 'Other' ? 'Notes and more' : 'Other')
        }} />
        <DefaultButton text='Hide "phone" control' onClick={() => {
            const phone = form.controls.get('phone')
            phone.setVisible(!phone.isVisible())
        }} />
        <DefaultButton text='Open "other" tab' onClick={() => form.tabs.get('other').setActive()} />
        <DefaultButton text='List parts' onClick={() => {
            for (const tab of form.tabs.getAll()) {
                const sections = tab.getSections().map(section => \`\${section.getName()} [\${section.getControls().map(control => control.getName()).join(', ')}]\`)
                log(\`\${tab.getName()} (loaded: \${tab.isLoaded()}): \${sections.join('; ')}\`)
            }
        }} />
        <PrimaryButton text='Save' onClick={() => form.save()} />
        <DefaultButton text='Reload' onClick={() => form.reload()} />
    </Stack>
}

const GridExample = () => {
    const [form, setForm] = React.useState<IForm>()
    const [lines, setLines] = React.useState<string[]>([])
    const log = (line: string) => setLines(current => [line, ...current].slice(0, 12))

    return <Stack tokens={{ childrenGap: 12 }}>
        {form && <Toolbar form={form} log={log} />}
        <FormV2
            onLoad={() => ({ record: createRecord() })}
            onSetup={form => {
                form.tabs.events.addEventListener('onActiveTabChanged', tab => log(\`opened tab \${tab.getName()}\`))
                form.events.addEventListener('onAfterSave', success => log(\`saved: \${success}\`))
                form.events.addEventListener('onDirtyStateChanged', isDirty => log(\`dirty: \${isDirty}\`))
            }}
            onReady={form => {
                setForm(form)
                log(\`ready: \${form.tabs.getAll().length} tabs, \${form.sections.getAll().length} sections, \${form.controls.getAll().length} controls\`)
            }}>
            <FormV2.Notifications />
            <FormV2.Tabs>
                <FormV2.Tab name='general' label='General'>
                    <FormV2.Column>
                        {/* an icon beside the title, and a tag at the header's end */}
                        <FormV2.Section name='contact' label='Contact'>
                            <FormV2.Section.Header>
                                <FormV2.Section.Header.Start>
                                    <Icon iconName='Contact' />
                                    <FormV2.Section.Title />
                                </FormV2.Section.Header.Start>
                                <FormV2.Section.Header.End>
                                    <Field.OptionSet label='Primary' color='#0078d4' />
                                </FormV2.Section.Header.End>
                            </FormV2.Section.Header>
                            <FormV2.Section.Body layout={{ lg: 1 }}>
                                <FormV2.Control field='name' />
                                <FormV2.Control field='email' />
                                <FormV2.Control field='phone' />
                            </FormV2.Section.Body>
                            <FormV2.Section.Footer>
                                <FormV2.Section.Footer.End>
                                    <ActionButton iconProps={{ iconName: 'Mail' }} text='Send an email' />
                                    <ActionButton iconProps={{ iconName: 'Phone' }} text='Call' />
                                </FormV2.Section.Footer.End>
                            </FormV2.Section.Footer>
                        </FormV2.Section>
                    </FormV2.Column>
                    <FormV2.Column>
                        {/* no header: only the body */}
                        <FormV2.Section name='web' label='Web'>
                            <FormV2.Section.Body layout={{ lg: 1 }} cellLabelPosition='Top'>
                                <FormV2.Control field='website' />
                            </FormV2.Section.Body>
                        </FormV2.Section>
                        {/* the header drawn through its slot, in a theme of its own */}
                        <FormV2.Section name='health' label='Account health'>
                            <FormV2.Section.Header components={{ onRender: props => <TintedHeader {...props} /> }}>
                                <FormV2.Section.Header.Start>
                                    <Icon iconName='Heart' />
                                    <FormV2.Section.Title />
                                </FormV2.Section.Header.Start>
                                <FormV2.Section.Header.End>
                                    <IconButton iconProps={{ iconName: 'More' }} />
                                </FormV2.Section.Header.End>
                            </FormV2.Section.Header>
                            <FormV2.Section.Body>
                                <Field.List>
                                    <Field.Progress percent={72} text='72%' />
                                    <Field.Value label='Open cases' iconName='Warning'>3</Field.Value>
                                    <Field.Value label='Segment' iconName='Tag'>
                                        <Field.OptionSet label='Enterprise' color='#8764b8' />
                                        <Field.OptionSet label='Renewal' color='#038387' />
                                    </Field.Value>
                                </Field.List>
                            </FormV2.Section.Body>
                        </FormV2.Section>
                    </FormV2.Column>
                </FormV2.Tab>
                <FormV2.Tab name='details' label='Details'>
                    <FormV2.Column>
                        {/* a button in the header and a status with an action in the footer */}
                        <FormV2.Section name='finance' label='Finance'>
                            <FormV2.Section.Header>
                                <FormV2.Section.Header.Start>
                                    <FormV2.Section.Title />
                                </FormV2.Section.Header.Start>
                                <FormV2.Section.Header.End>
                                    <IconButton iconProps={{ iconName: 'Refresh' }} title='Refresh' />
                                </FormV2.Section.Header.End>
                            </FormV2.Section.Header>
                            <FormV2.Section.Body layout={{ lg: 2 }}>
                                <FormV2.Control field='revenue' />
                                <FormV2.Control field='employees' />
                            </FormV2.Section.Body>
                            <FormV2.Section.Footer>
                                <FormV2.Section.Footer.Start>
                                    <Text variant='small'>From the last import, 2 hours ago</Text>
                                </FormV2.Section.Footer.Start>
                                <FormV2.Section.Footer.End>
                                    <PrimaryButton text='Recalculate' />
                                </FormV2.Section.Footer.End>
                            </FormV2.Section.Footer>
                        </FormV2.Section>
                        {/* a long title cut off on one line */}
                        <FormV2.Section name='classification' label='Classification, priority and the date the account became a customer'>
                            <FormV2.Section.Header>
                                <FormV2.Section.Header.Start>
                                    <FormV2.Section.Title nowrap />
                                </FormV2.Section.Header.Start>
                            </FormV2.Section.Header>
                            <FormV2.Section.Body layout={{ lg: 2 }}>
                                <FormV2.Control field='priority' />
                                <FormV2.Control field='since' />
                            </FormV2.Section.Body>
                        </FormV2.Section>
                    </FormV2.Column>
                </FormV2.Tab>
                <FormV2.Tab name='other' label='Other'>
                    <FormV2.Column>
                        {/* a title of your own instead of Section.Title, and a footer of text only */}
                        <FormV2.Section name='notes' label='Notes'>
                            <FormV2.Section.Header>
                                <FormV2.Section.Header.Start>
                                    <Icon iconName='EditNote' />
                                    <Text variant='mediumPlus'>What we know about them</Text>
                                </FormV2.Section.Header.Start>
                            </FormV2.Section.Header>
                            <FormV2.Section.Body>
                                <FormV2.Control field='notes' label='' />
                            </FormV2.Section.Body>
                            <FormV2.Section.Footer>
                                <FormV2.Section.Footer.Start>
                                    <Text variant='small'>Only your team sees these notes.</Text>
                                </FormV2.Section.Footer.Start>
                            </FormV2.Section.Footer>
                        </FormV2.Section>
                    </FormV2.Column>
                </FormV2.Tab>
            </FormV2.Tabs>
        </FormV2>
        <Stack>
            {lines.map((line, index) => <Text key={index} variant='small'>{line}</Text>)}
        </Stack>
    </Stack>
}
`

/** A form with three tabs, driven through the runtime's lookups before the tabs are opened. */
export const FormV2Playground = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: PLAYGROUND_CODE }, { name: 'record.ts', code: RECORD_FILE }]} tabs={['preview', 'code']} />
