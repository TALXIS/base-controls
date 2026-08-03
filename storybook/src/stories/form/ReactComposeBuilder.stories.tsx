import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ReactComposeMode } from '../../form/react-form/ReactComposeMode'
import { renderStory } from './storyHelpers'

type TComposeWorkspaceView = 'preview' | 'data' | 'model'
type TComposeTabsFlavor = 'pivot' | 'stepper'
type TComposeStepperOrientation = 'horizontal' | 'vertical'

interface IReactComposeStoryArgs {
    view: TComposeWorkspaceView
    tabsFlavor: TComposeTabsFlavor
    stepperOrientation: TComposeStepperOrientation
    showCode: boolean
}

const meta = {
    title: 'Form/React compose/Playground',
    tags: ['autodocs'],
    args: {
        view: 'preview',
        tabsFlavor: 'pivot',
        stepperOrientation: 'horizontal',
        showCode: false,
    },
    argTypes: {
        view: {
            control: 'inline-radio',
            options: ['preview', 'data', 'model'],
        },
        tabsFlavor: {
            control: 'inline-radio',
            options: ['pivot', 'stepper'],
        },
        stepperOrientation: {
            control: 'inline-radio',
            options: ['horizontal', 'vertical'],
            if: { arg: 'tabsFlavor', eq: 'stepper' },
        },
        showCode: {
            control: 'boolean',
            if: { arg: 'view', eq: 'preview' },
        },
    },
    parameters: {
        docs: {
            description: {
                component: 'One Storybook-native playground for React-authored forms. Use controls to switch between preview, data, and model instead of browsing multiple near-identical stories.',
            },
        },
    },
    render: (args: IReactComposeStoryArgs) => renderStory(
        <ReactComposeMode
            initialView={args.view}
            initialTabsFlavor={args.tabsFlavor}
            initialStepperOrientation={args.stepperOrientation}
            initialShowPreviewCode={args.showCode}
            hideTabsFlavorPivot
            hideWorkspaceViewPivot
            hidePreviewCodeToggle
            useStorybookViewport
        />,
    ),
} satisfies Meta<IReactComposeStoryArgs>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const StepperExample: Story = {
    args: {
        view: 'preview',
        tabsFlavor: 'stepper',
        stepperOrientation: 'horizontal',
        showCode: true,
    },
}
