import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { XrmMode } from '../../form/xrm-form/XrmMode'
import { xrmBusinessFlowScenarios } from '../../form/xrm-form/xrmBusinessFlows'
import { renderStory } from './storyHelpers'

interface IXrmFormContextArgs {
    scenarioId: string
    showCodePanel: boolean
    showConsole: boolean
}

const scenarioOptions = xrmBusinessFlowScenarios.map((scenario) => scenario.id)
const scenarioLabels = Object.fromEntries(xrmBusinessFlowScenarios.map((scenario) => [scenario.id, scenario.title]))

const meta = {
    title: 'Form/Xrm/Form context',
    tags: ['autodocs'],
    args: {
        scenarioId: scenarioOptions[0],
        showCodePanel: true,
        showConsole: false,
    },
    argTypes: {
        scenarioId: {
            control: 'select',
            options: scenarioOptions,
            mapping: undefined,
            labels: scenarioLabels,
        },
        showCodePanel: {
            control: 'boolean',
        },
        showConsole: {
            control: 'boolean',
        },
    },
    parameters: {
        docs: {
            description: {
                component: `
Runtime-focused Xrm \`formContext\` workflows. Pick a scenario with controls instead of navigating across many nearly identical stories.

\`XrmForm\` builds on top of the base Form runtime, keeps the layout FormXml-driven, and exposes a Microsoft form-context-compatible \`formContext\` surface while persistence still comes from the base Form strategy contract.

Use \`XrmForm\` when you want:

- FormXml-driven layout authoring.
- Dataverse-shaped record payloads and metadata.
- Xrm-style runtime interaction through \`formContext\`.
- The base Form React lifecycle events such as \`onBeforeSave\`, \`onAfterSave\`, \`onFieldValueChanged\`, \`onValidationSummaryChanged\`, \`onDirtyStateChanged\`, and \`onError\`.

## Host setup

\`XrmForm\` relies on the shared PCF-context abstraction.

- In **non-PCF hosts**, wrap usage in \`PcfContextProvider\`.
- In **PCF hosts**, pass the host \`context\` into \`PcfContextProvider\`.

Lookup fields currently only work where \`window.Xrm\` is available, for example when the form is hosted as a PCF inside a model-driven app.

## Data contract

The runtime is still driven by:

- \`columns\` using the standard Base Controls \`IColumn[]\` shape
- \`metadata\` with at least \`PrimaryIdAttribute\` and \`PrimaryNameAttribute\`
- \`data\` shaped like a Dataverse record payload

That means lookup values should stay in their Dataverse-style form, for example \`_ownerid_value\`, \`_ownerid_value@OData.Community.Display.V1.FormattedValue\`, and \`_ownerid_value@Microsoft.Dynamics.CRM.lookuplogicalname\`.

## Lifecycle and public surface

When \`onFormReady({ formContext, api })\` fires, the form is already loaded together with its data, so the exposed \`formContext\` is ready for attribute access, UI interactions, and event subscription immediately.

The main public handle is \`IXrmFormContext\`. It exposes the expected top-level entry points such as \`data\`, \`ui\`, \`getAttribute(...)\`, and \`getControl(...)\`. Execution-context support is currently limited; the main meaningful support today is in entity save handlers, where \`executionContext.getEventArgs().preventDefault()\` can stop the save.

For the official Client API model, see Microsoft Learn:

- [formContext](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/clientapi-form-context)
- [formContext.data](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/formcontext-data)
- [formContext.ui](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/formcontext-ui)
- [attribute methods](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/attributes)
- [control methods](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/controls)
                `.trim(),
            },
        },
    },
    render: (args: IXrmFormContextArgs) => renderStory(
        <XrmMode
            initialView="form-context"
            initialFormContextScenarioId={args.scenarioId}
            formContextScenarioIds={[args.scenarioId]}
            hideWorkspaceViewPivot
            useStorybookViewport
            showFormContextCodePanel={args.showCodePanel}
            hideFormContextConsole={!args.showConsole}
        />,
    ),
} satisfies Meta<IXrmFormContextArgs>

export default meta

type Story = StoryObj<typeof meta>

export const FormContextScenarios: Story = {}
