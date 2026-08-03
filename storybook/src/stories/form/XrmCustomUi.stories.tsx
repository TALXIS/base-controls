import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { XrmMode } from '../../form/xrm-form/XrmMode'
import { renderStory } from './storyHelpers'

type TXrmCustomComponentsFlavor = 'controls' | 'tabs'
type TCustomTabsOrientation = 'horizontal' | 'vertical'

interface IXrmCustomUiArgs {
    flavor: TXrmCustomComponentsFlavor
    tabsOrientation: TCustomTabsOrientation
    showCode: boolean
    showData: boolean
    showXml: boolean
}

const meta = {
    title: 'Form/Xrm/Advanced/Custom UI',
    tags: ['autodocs'],
    args: {
        flavor: 'controls',
        tabsOrientation: 'horizontal',
        showCode: true,
        showData: false,
        showXml: false,
    },
    argTypes: {
        flavor: {
            control: 'inline-radio',
            options: ['controls', 'tabs'],
        },
        tabsOrientation: {
            control: 'inline-radio',
            options: ['horizontal', 'vertical'],
            if: { arg: 'flavor', eq: 'tabs' },
        },
        showCode: { control: 'boolean' },
        showData: { control: 'boolean' },
        showXml: { control: 'boolean' },
    },
    parameters: {
        docs: {
            description: {
                component: 'Focused Xrm presentation override demo. Keep the code and supporting panels only when you want to study or adapt the override implementation.',
            },
        },
    },
    render: (args: IXrmCustomUiArgs) => renderStory(
        <XrmMode
            initialView="custom-components"
            initialCustomComponentsFlavor={args.flavor}
            initialCustomTabsOrientation={args.tabsOrientation}
            initialShowCustomComponentsCode={args.showCode}
            initialShowCustomComponentsData={args.showData}
            initialShowCustomComponentsXml={args.showXml}
            hideWorkspaceViewPivot
            hideCustomComponentsPivot
            hideCustomTabsOrientationSelector
            hideCustomComponentsEditorToggles
            useStorybookViewport
        />,
    ),
} satisfies Meta<IXrmCustomUiArgs>

export default meta

type Story = StoryObj<typeof meta>

export const CustomUi: Story = {}
