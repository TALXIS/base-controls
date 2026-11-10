import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { accountRecord } from './shared'

const FROM_OUTSIDE_CODE = `const account = ${accountRecord(['name', 'telephone1'])}

const GridExample = () => {
    const apiRef = React.useRef<IFormApi>()
    const [log, setLog] = React.useState<string[]>([])
    const write = (line: string) => setLog(current => [line, ...current].slice(0, 8))

    //again after every load, with a new api
    const onFormReady = (api: IFormApi) => {
        apiRef.current = api
        write('onFormReady')
    }

    return <>
        <Stack horizontal tokens={{ childrenGap: 8 }}>
            <DefaultButton text='Set the phone' onClick={() => apiRef.current?.getField('telephone1').setValue('+420 800 123 456')} />
            <DefaultButton text='Show the data' onClick={() => write(JSON.stringify(apiRef.current?.getData()))} />
            <DefaultButton text='Load again' onClick={() => apiRef.current?.reload()} />
        </Stack>
        {/* every event of Form.Root, written to the log */}
        <Form.Root
            onLoad={async () => ({ record: account })}
            onFormReady={onFormReady}
            onFieldValueChanged={(fieldName, value) => write(\`onFieldValueChanged: \${fieldName} is \${value}\`)}
            onDirtyStateChanged={isDirty => write(\`onDirtyStateChanged: \${isDirty}\`)}
            onBeforeSave={() => write('onBeforeSave')}
            onAfterSave={({ success }) => write(\`onAfterSave: \${success ? 'saved' : 'not saved'}\`)}
            onValidationSummaryChanged={summary => write(\`onValidationSummaryChanged: [\${summary.map(item => item.fieldName).join(', ')}]\`)}
            onError={message => write(\`onError: \${message}\`)}>
            <Form.Ribbon />
            <Form.Section label='Account'>
                <Form.Field name='name'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                <Form.Field name='telephone1'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
        </Form.Root>
        <Text style={{ whiteSpace: 'pre-line', wordBreak: 'break-all' }}>{log.join('\\n')}</Text>
    </>
}
`

const FROM_INSIDE_CODE = `const account = ${accountRecord(['name', 'telephone1'])}

//inside Form.Root, useForm returns the form and useField one of its fields
const SaveBar = () => {
    const form = useForm()
    const name = useField('name')
    const { navigation } = usePcfContext()
    const [isDirty, setIsDirty] = React.useState(form.isDirty())

    //addEventListener returns what removes the listener again
    React.useEffect(() => form.events.addEventListener('onDirtyStateChanged', setIsDirty), [form])

    //asks before every save
    React.useEffect(() => form.addSaveBlocker(async request => {
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
    <Form.Section label='Account'>
        <Form.Field name='name'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
        <Form.Field name='telephone1'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
    </Form.Section>
</Form.Root>
`

export const FromOutsideExample = () => <GridExampleRunner seedCode={FROM_OUTSIDE_CODE} tabs={['preview', 'code']} />

export const FromInsideExample = () => <GridExampleRunner seedCode={FROM_INSIDE_CODE} tabs={['preview', 'code']} />
