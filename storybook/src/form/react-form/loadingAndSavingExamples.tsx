import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { withRecord } from './shared'

const SAVE_CODE = `import { ACCOUNT_COLUMNS, ACCOUNT_DATA, ACCOUNT_METADATA } from './record'

const account = createMemoryRecord({
    columns: ACCOUNT_COLUMNS,
    data: ACCOUNT_DATA,
    metadata: ACCOUNT_METADATA,
    //runs on every save, before the change is committed in memory
    onSave: async record => {
        //stands in for a call to your API
        await new Promise(resolve => setTimeout(resolve, 800))
        const fields = record.getFields().filter(field => field.isDirty()).map(field => field.getColumn().name)
        if (record.getValue('creditlimit') > 50000) {
            //Form.Notifications shows these errors
            return { recordId: record.getRecordId(), success: false, fields, errors: [{ fieldName: 'creditlimit', message: 'Over 50,000 needs a manager to approve it.' }] }
        }
        return { recordId: record.getRecordId(), success: true, fields }
    },
})

//onLoad runs as the form mounts, behind a placeholder
const GridExample = () => <Form.Root onLoad={async () => ({ record: account })}>
    <Form.Ribbon />
    <Form.Notifications />
    <Form.Section label='Account'>
        <Form.Field name='name'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
        <Form.Field name='creditlimit'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
    </Form.Section>
</Form.Root>
`

const AUTO_SAVE_CODE = `import { ACCOUNT_COLUMNS, ACCOUNT_DATA, ACCOUNT_METADATA } from './record'

const account = createMemoryRecord({
    columns: ACCOUNT_COLUMNS,
    data: ACCOUNT_DATA,
    metadata: ACCOUNT_METADATA,
    //slow enough to see the ribbon say Saving
    onSave: async record => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        return { recordId: record.getRecordId(), success: true, fields: record.getFields().filter(field => field.isDirty()).map(field => field.getColumn().name) }
    },
})

//saves each change the user commits
const GridExample = () => <Form.Root onLoad={async () => ({ record: account })} autoSave>
    <Form.Ribbon />
    <Form.Notifications />
    <Form.Section label='Account'>
        <Form.Field name='name'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
        <Form.Field name='telephone1'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
        <Form.Field name='emailaddress1'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
    </Form.Section>
</Form.Root>
`

const SWITCH_RECORDS_CODE = `//a provider you already have, such as the one a grid shows
const accounts = new MemoryDataProvider({
    dataSource: [
        { accountid: '1', name: 'Contoso Ltd.', telephone1: '+420 123 456 789' },
        { accountid: '2', name: 'Fabrikam Inc.', telephone1: '+44 20 7946 0958' },
        { accountid: '3', name: 'Northwind Traders', telephone1: '+1 206 555 0100' },
    ],
    metadata: { PrimaryIdAttribute: 'accountid', PrimaryNameAttribute: 'name' },
    columns: [
        { name: 'name', displayName: 'Account name', dataType: DataTypes.SingleLineText },
        { name: 'telephone1', displayName: 'Phone', dataType: DataTypes.SingleLinePhone },
    ],
})
const records = accounts.refreshSync()

const GridExample = () => {
    const [recordId, setRecordId] = React.useState(records[0].getRecordId())
    const record = accounts.getRecordsMap()[recordId]

    return <Stack tokens={{ childrenGap: 12 }}>
        <Dropdown label='Account' selectedKey={recordId} options={records.map(item => ({ key: item.getRecordId(), text: item.getValue('name') }))} onChange={(_, option) => setRecordId(String(option!.key))} />
        {/* a new key mounts a new form for the other record */}
        <Form.Root key={recordId} onLoad={async () => ({ record })}>
            <Form.Ribbon />
            <Form.Section label='Account'>
                <Form.Field name='name'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                <Form.Field name='telephone1'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
        </Form.Root>
    </Stack>
}
`

export const SaveExample = () => <GridExampleRunner seedCode={withRecord(SAVE_CODE)} tabs={['preview', 'code']} />

export const AutoSaveExample = () => <GridExampleRunner seedCode={withRecord(AUTO_SAVE_CODE)} tabs={['preview', 'code']} />

export const SwitchRecordsExample = () => <GridExampleRunner seedCode={SWITCH_RECORDS_CODE} tabs={['preview', 'code']} />
