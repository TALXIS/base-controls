import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const ACCOUNT_FORM_CODE = `//one account held in memory
const account = createMemoryRecord({
    columns: [
        //RequiredLevel 2 makes the column required
        { name: 'name', displayName: 'Account name', dataType: DataTypes.SingleLineText, metadata: { RequiredLevel: 2 } },
        { name: 'telephone1', displayName: 'Phone', dataType: DataTypes.SingleLinePhone },
        { name: 'emailaddress1', displayName: 'Email', dataType: DataTypes.SingleLineEmail },
        { name: 'industrycode', displayName: 'Industry', dataType: DataTypes.OptionSet, metadata: { OptionSet: [
            { Value: 1, Label: 'Consulting', Color: '#0078d4' },
            { Value: 2, Label: 'Manufacturing', Color: '#8764b8' },
        ] } },
        { name: 'numberofemployees', displayName: 'Employees', dataType: DataTypes.WholeNone },
        { name: 'description', displayName: 'Description', dataType: DataTypes.Multiple },
    ],
    data: { accountid: '1', name: 'Contoso Ltd.', telephone1: '+420 123 456 789', emailaddress1: 'info@contoso.com', industrycode: 2, numberofemployees: 250, description: 'Makes office furniture.' },
    metadata: { PrimaryIdAttribute: 'accountid', PrimaryNameAttribute: 'name' },
})

const GridExample = () => {
    //the open tab is yours to keep
    const [tab, setTab] = React.useState('general')

    return <Form.Root onLoad={async () => ({ record: account })}>
        {/* Save, and Unsaved changes while there are any */}
        <Form.Ribbon />
        {/* your messages, and what stopped the last save */}
        <Form.Notifications messages={[{ text: 'Contoso is a key account.', level: 'INFO' }]} />
        <Form.Tabs expandedTab={tab} onTabChange={setTab}>
            <Form.Tab id='general' label='General'>
                <Form.Column>
                    <Form.Section label='Contact'>
                        {/* binds to the column of that name */}
                        <Form.Field name='name'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                        <Form.Field name='telephone1'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                        <Form.Field name='emailaddress1'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                    </Form.Section>
                </Form.Column>
                <Form.Column>
                    <Form.Section label='Company'>
                        <Form.Field name='industrycode'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                        <Form.Field name='numberofemployees'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                    </Form.Section>
                </Form.Column>
            </Form.Tab>
            <Form.Tab id='notes' label='Notes'>
                <Form.Column>
                    <Form.Section label='About'>
                        <Form.Field name='description'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                    </Form.Section>
                </Form.Column>
            </Form.Tab>
        </Form.Tabs>
    </Form.Root>
}
`

export const AccountFormExample = () => <GridExampleRunner seedCode={ACCOUNT_FORM_CODE} tabs={['preview', 'code']} />
