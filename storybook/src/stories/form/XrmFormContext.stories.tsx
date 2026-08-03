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
                component: 'Runtime-focused Xrm formContext workflows. Pick a scenario with controls instead of navigating across many nearly identical stories.',
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
