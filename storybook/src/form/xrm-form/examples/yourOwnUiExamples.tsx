import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { accountTab, withAccount } from './shared'

const OWN_CONTROL_CODE = `import { ControlComponents, useField, XrmForm } from '@talxis/base-controls'
import { ChoiceGroup } from '@fluentui/react'
import { loadAccount } from './account'

//a control of your own: reads and writes the field of its cell
const IndustryChoice = (props: { disabled?: boolean }) => {
    const field = useField()!
    const options = field.getColumn().metadata?.OptionSet?.map(option => ({ key: String(option.Value), text: option.Label })) ?? []
    return <ChoiceGroup options={options} selectedKey={String(field.getValue())} disabled={props.disabled} onChange={(_, option) => field.setValue(Number(option?.key))} />
}

const GridExample = () => <XrmForm onLoad={loadAccount} components={{
    control: {
        //props.id is the control's id in the FormXml
        onRenderControl: props => props.id === 'industrycode' ? <IndustryChoice disabled={props.disabled} /> : ControlComponents.onRenderControl(props),
    },
}} />
`

const RIBBON_COMMAND_CODE = `import { CommandBar, XrmForm } from '@talxis/base-controls'
import type { IXrmFormContext } from '@talxis/base-controls'
import { loadAccount } from './account'

const GridExample = () => {
    const [formContext, setFormContext] = React.useState<IXrmFormContext>()
    return <XrmForm onLoad={loadAccount} onFormReady={params => setFormContext(params.formContext)} components={{
        ribbon: {
            //keeps Save and adds a command of your own
            onRenderCommandBar: props => <CommandBar {...props} items={[...props.items, {
                key: 'releaseHold',
                text: 'Release credit hold',
                iconProps: { iconName: 'Unlock' },
                onClick: () => formContext?.getAttribute('creditonhold').setValue(false),
            }]} />,
        },
    }} />
}
`

export const OwnControlExample = () => <GridExampleRunner seedCode={withAccount(OWN_CONTROL_CODE, [accountTab('name', 'industrycode')])} tabs={['preview', 'code']} />

export const RibbonCommandExample = () => <GridExampleRunner seedCode={withAccount(RIBBON_COMMAND_CODE, [accountTab('name', 'creditonhold')])} tabs={['preview', 'code']} />
