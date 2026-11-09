import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { accountRecord } from './shared'

const ACCOUNT_FORM_CODE = `//one account held in memory
const account = ${accountRecord(['name', 'telephone1', 'industrycode', 'description'])}

const GridExample = () => {
    //your state holds the open tab
    const [tab, setTab] = React.useState('general')

    //onLoad hands the form the record it edits
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
                    </Form.Section>
                </Form.Column>
                <Form.Column>
                    <Form.Section label='Company'>
                        <Form.Field name='industrycode'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
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
