import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ReactComposeMode } from '../../form/react-form/ReactComposeMode'
import { renderStory } from './storyHelpers'

type TComposeStepperOrientation = 'horizontal' | 'vertical'

interface IReactComposeCustomUiArgs {
    stepperOrientation: TComposeStepperOrientation
}

const meta = {
    title: 'Form/React compose/Custom UI',
    tags: ['autodocs'],
    args: {
        stepperOrientation: 'horizontal',
    },
    argTypes: {
        stepperOrientation: {
            control: 'inline-radio',
            options: ['horizontal', 'vertical'],
        },
    },
    parameters: {
        docs: {
            description: {
                component: 'Focused demo for swapping the default React compose tabs for a Stepper-based presentation. The code panel stays because authoring the override is the point here.',
            },
        },
    },
    render: (args: IReactComposeCustomUiArgs) => renderStory(
        <ReactComposeMode
            initialTabsFlavor="stepper"
            initialStepperOrientation={args.stepperOrientation}
            initialView="preview"
            hideTabsFlavorPivot
            hideWorkspaceViewPivot
            hidePreviewCodeToggle
            useStorybookViewport
            initialShowPreviewCode
        />,
    ),
} satisfies Meta<IReactComposeCustomUiArgs>

export default meta

type Story = StoryObj<typeof meta>

export const CustomUi: Story = {}
