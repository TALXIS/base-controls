import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { withRecord } from './shared'

const FROM_OUTSIDE_CODE = `import { createAccount } from './record'

const account = createAccount()

const GridExample = () => {
    const apiRef = React.useRef<IFormApi>()
    const [log, setLog] = React.useState<string[]>([])
    const write = (line: string) => setLog(current => [line, ...current].slice(0, 8))

    //again after every load, with a new api
    const onFormReady = (api: IFormApi) => {
        apiRef.current = api
        write('onFormReady')
    }

    return <Stack tokens={{ childrenGap: 12 }}>
        <Stack horizontal tokens={{ childrenGap: 8 }}>
            <DefaultButton text='Set the phone' onClick={() => apiRef.current?.getField('telephone1').setValue('+420 800 123 456')} />
            <DefaultButton text='Show the data' onClick={() => write(JSON.stringify(apiRef.current?.getData()))} />
            <DefaultButton text='Load again' onClick={() => apiRef.current?.refresh()} />
        </Stack>
        <Form.Root
            onLoad={async () => ({ record: account })}
            onFormReady={onFormReady}
            onFieldValueChanged={(fieldName, value) => write(\`onFieldValueChanged: \${fieldName} is \${value}\`)}
            onDirtyStateChanged={isDirty => write(\`onDirtyStateChanged: \${isDirty}\`)}
            onBeforeSave={() => write('onBeforeSave')}
            onAfterSave={({ success }) => write(\`onAfterSave: \${success ? 'saved' : 'not saved'}\`)}
            onValidationSummaryChanged={summary => write(\`onValidationSummaryChanged: \${summary.length} errors\`)}
            onError={(_, message) => write(\`onError: \${message}\`)}>
            <Form.Ribbon />
            <Form.Notifications />
            <Form.Section label='Account' layout={{ lg: 2 }}>
                <Form.Field name='name'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                <Form.Field name='telephone1'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
        </Form.Root>
        <Text variant='small' style={{ fontFamily: 'monospace', whiteSpace: 'pre-line', wordBreak: 'break-all' }}>{log.join('\\n')}</Text>
    </Stack>
}
`

const FROM_INSIDE_CODE = `import { createAccount } from './record'

const account = createAccount()

//inside Form.Root, useForm returns the form and useField one of its fields
const SaveBar = () => {
    const form = useForm()
    const name = useField('name')
    const { navigation } = usePcfContext()
    const [isDirty, setIsDirty] = React.useState(form.isDirty())

    //addEventListener returns what removes the listener again
    React.useEffect(() => form.events.addEventListener('onDirtyStateChanged', setIsDirty), [form])

    //asks before every save
    React.useEffect(() => form.registerSaveBlocker(async request => {
        const { confirmed } = await navigation.openConfirmDialog({ text: \`Save the changes to \${form.getRecord().getValue('name')}?\` })
        request.isBlocked = !confirmed
    }), [form])

    return <Stack horizontal verticalAlign='center' horizontalAlign='space-between'>
        {/* drawn again on each change of the name */}
        <Text variant='large'>{name?.getValue()}</Text>
        <PrimaryButton text='Save' disabled={!isDirty} onClick={() => form.save()} />
    </Stack>
}

const GridExample = () => <Form.Root onLoad={async () => ({ record: account })}>
    <SaveBar />
    <Form.Notifications />
    <Form.Section label='Account' layout={{ lg: 2 }}>
        <Form.Field name='name'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
        <Form.Field name='telephone1'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
    </Form.Section>
</Form.Root>
`

export const FromOutsideExample = () => <GridExampleRunner seedCode={withRecord(FROM_OUTSIDE_CODE)} tabs={['preview', 'code']} />

export const FromInsideExample = () => <GridExampleRunner seedCode={withRecord(FROM_INSIDE_CODE)} tabs={['preview', 'code']} />
