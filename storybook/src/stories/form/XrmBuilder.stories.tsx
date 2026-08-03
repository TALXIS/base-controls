import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { XrmMode } from '../../form/xrm-form/XrmMode'
import { renderStory } from './storyHelpers'

type TXrmWorkspaceView = 'preview' | 'builder' | 'data' | 'model'

type TBuilderEditorMode = 'ui' | 'xml'
type TDataEditorMode = 'ui' | 'json'
type TModelEditorMode = 'ui' | 'json'

interface IXrmPlaygroundArgs {
    view: TXrmWorkspaceView
    builderEditorMode: TBuilderEditorMode
    dataEditorMode: TDataEditorMode
    modelEditorMode: TModelEditorMode
    showPreviewXml: boolean
}

const meta = {
    title: 'Form/Xrm/Playground',
    tags: ['autodocs'],
    args: {
        view: 'preview',
        builderEditorMode: 'ui',
        dataEditorMode: 'json',
        modelEditorMode: 'ui',
        showPreviewXml: false,
    },
    argTypes: {
        view: {
            control: 'inline-radio',
            options: ['preview', 'builder', 'data', 'model'],
        },
        builderEditorMode: {
            control: 'inline-radio',
            options: ['ui', 'xml'],
            if: { arg: 'view', eq: 'builder' },
        },
        dataEditorMode: {
            control: 'inline-radio',
            options: ['ui', 'json'],
            if: { arg: 'view', eq: 'data' },
        },
        modelEditorMode: {
            control: 'inline-radio',
            options: ['ui', 'json'],
            if: { arg: 'view', eq: 'model' },
        },
        showPreviewXml: {
            control: 'boolean',
            if: { arg: 'view', eq: 'preview' },
        },
    },
    parameters: {
        docs: {
            description: {
                component: 'Unified Xrm playground for previewing the FormXml runtime and switching into builder, data, or model authoring through Storybook controls.',
            },
        },
    },
    render: (args: IXrmPlaygroundArgs) => renderStory(
        <XrmMode
            initialView={args.view}
            initialBuilderEditorMode={args.builderEditorMode}
            initialDataEditorMode={args.dataEditorMode}
            initialModelEditorMode={args.modelEditorMode}
            hideWorkspaceViewPivot
            hideBuilderEditorModeToggle
            hideDataEditorModeToggle
            hideModelEditorModeToggle
            useStorybookViewport
        />,
    ),
} satisfies Meta<IXrmPlaygroundArgs>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const FormXmlAuthoring: Story = {
    args: {
        view: 'builder',
        builderEditorMode: 'xml',
    },
}
