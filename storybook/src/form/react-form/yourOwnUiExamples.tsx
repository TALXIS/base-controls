import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { withRecord } from './shared'

const OWN_CONTROL_CODE = `import { Rating } from '@fluentui/react'
import { createAccount } from './record'

const account = createAccount()

//reads and writes the field it sits in
const RatingControl = (props: { disabled?: boolean }) => {
    const field = useField()!
    return <Rating max={5} rating={field.getValue() ?? 0} disabled={props.disabled} onChange={(_, rating) => field.setValue(rating ?? null)} />
}

const GridExample = () => <Form.Root onLoad={async () => ({ record: account })}>
    <Form.Ribbon />
    <Form.Section label='Account' layout={{ lg: 2 }}>
        <Form.Field name='name'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
        <Form.Field name='rating'>
            <Form.Cell>
                {/* Form.Control still shows the error under it and the lock by the label */}
                <Form.Control components={{ onRenderControl: props => <RatingControl disabled={props.disabled} /> }} />
            </Form.Cell>
        </Form.Field>
        {/* a cell outside a field holds anything */}
        <Form.Cell label='Last contact'>
            <Text>Called by Anna Novak on 2 November</Text>
        </Form.Cell>
    </Form.Section>
</Form.Root>
`

const STEP_TABS_CODE = `import { createAccount } from './record'

const account = createAccount()

//the tabs as numbered steps, with Back and Next under the open one
const StepTabs = (props: ITabsComponentProps) => {
    const steps = React.Children.toArray(props.children) as React.ReactElement<{ id: string; label?: string }>[]
    const index = steps.findIndex(step => step.props.id === props.expandedTab)

    return <Stack tokens={{ childrenGap: 12 }}>
        <Stack horizontal tokens={{ childrenGap: 8 }}>
            {steps.map((step, stepIndex) => {
                const StepButton = stepIndex === index ? PrimaryButton : DefaultButton
                return <StepButton key={step.props.id} text={\`\${stepIndex + 1}. \${step.props.label}\`} onClick={() => props.onTabChange(step.props.id)} />
            })}
        </Stack>
        {steps[index]}
        <Stack horizontal tokens={{ childrenGap: 8 }}>
            <DefaultButton text='Back' disabled={index === 0} onClick={() => props.onTabChange(steps[index - 1].props.id)} />
            <DefaultButton text='Next' disabled={index === steps.length - 1} onClick={() => props.onTabChange(steps[index + 1].props.id)} />
        </Stack>
    </Stack>
}

const GridExample = () => {
    const [tab, setTab] = React.useState('company')

    return <Form.Root onLoad={async () => ({ record: account })}>
        <Form.Ribbon />
        <Form.Tabs expandedTab={tab} onTabChange={setTab} components={{ onRenderTabs: props => <StepTabs {...props} /> }}>
            <Form.Tab id='company' label='Company'>
                <Form.Column>
                    <Form.Section label='Company'>
                        <Form.Field name='name'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                        <Form.Field name='industrycode'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                    </Form.Section>
                </Form.Column>
            </Form.Tab>
            <Form.Tab id='contact' label='Contact'>
                <Form.Column>
                    <Form.Section label='Contact'>
                        <Form.Field name='telephone1'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                        <Form.Field name='emailaddress1'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                    </Form.Section>
                </Form.Column>
            </Form.Tab>
            <Form.Tab id='terms' label='Terms'>
                <Form.Column>
                    <Form.Section label='Terms'>
                        <Form.Field name='creditlimit'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                        <Form.Field name='customersince'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                    </Form.Section>
                </Form.Column>
            </Form.Tab>
        </Form.Tabs>
    </Form.Root>
}
`

const RIBBON_AND_NOTIFICATIONS_CODE = `import { createAccount } from './record'

const account = createAccount()

//props.items holds Save, and props.farItems Unsaved changes
const AccountRibbon = (props: ICommandBarProps) => {
    const form = useForm()
    const deactivate: ICommandBarItemProps = {
        key: 'deactivate',
        text: 'Deactivate',
        iconProps: { iconName: 'Blocked' },
        onClick: () => {
            form.getField('active').setValue(false)
            form.save()
        },
    }
    return <CommandBar {...props} items={[...(props.items ?? []), deactivate]} />
}

const LEVELS = { ERROR: MessageBarType.error, WARNING: MessageBarType.warning, INFO: MessageBarType.info }

//each message in a bar of its own
const MessageList = (props: { messages?: { text: string; level: 'ERROR' | 'WARNING' | 'INFO' }[] }) => <Stack tokens={{ childrenGap: 4 }}>
    {props.messages?.map((message, index) => <MessageBar key={index} messageBarType={LEVELS[message.level]}>
        <span dangerouslySetInnerHTML={{ __html: message.text }} />
    </MessageBar>)}
</Stack>

const GridExample = () => <Form.Root onLoad={async () => ({ record: account })}>
    {/* a component of yours holds the hooks a slot needs */}
    <Form.Ribbon components={{ onRenderCommandBar: props => <AccountRibbon {...props} /> }} />
    <Form.Notifications messages={[{ text: 'Contoso is a key account.', level: 'INFO' }]} components={{ onRenderNotifications: props => <MessageList messages={props.messages} /> }} />
    <Form.Section label='Account' layout={{ lg: 2 }}>
        <Form.Field name='name'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
        <Form.Field name='active'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
    </Form.Section>
</Form.Root>
`

export const OwnControlExample = () => <GridExampleRunner seedCode={withRecord(OWN_CONTROL_CODE)} tabs={['preview', 'code']} />

export const StepTabsExample = () => <GridExampleRunner seedCode={withRecord(STEP_TABS_CODE)} tabs={['preview', 'code']} />

export const RibbonAndNotificationsExample = () => <GridExampleRunner seedCode={withRecord(RIBBON_AND_NOTIFICATIONS_CODE)} tabs={['preview', 'code']} />
