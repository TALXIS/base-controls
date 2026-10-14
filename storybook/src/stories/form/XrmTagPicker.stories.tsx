import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ExampleRunner } from './storyHelpers'
import { TagPickerSample } from './pcf-usage/TagPickerSample'
import { PcfSource } from './pcf-usage/PcfSource'
import formXml from './pcf-usage/TagPicker.form.xml?raw'
import sampleSource from './pcf-usage/TagPickerSample.tsx?raw'

const meta = {
    title: 'Form/Xrm/PCF Usage',
    component: TagPickerSample,
    tags: ['!autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
            description: {
                component: 'Published TagPicker (pulled from the TALXIS NuGet feed) selected through formXML. Selected tags are written as JSON to the bound text field. Tag APIs are emulated locally.',
            },
        },
    },
} satisfies Meta<typeof TagPickerSample>
export default meta
type Story = StoryObj<typeof meta>

export const Tags: Story = {
    name: 'TagPicker',
    render: () => <ExampleRunner
        previewMinHeight={0}
        renderPreview={() => <TagPickerSample />}
        renderCode={() => <PcfSource sample={sampleSource} xml={formXml} />}
    />,
}
