import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { initializeIcons } from '@fluentui/react'
import { TaskGrid } from '@talxis/base-controls/components/TaskGrid'
import { usePcfContext } from '@talxis/base-controls/utils'
import { createMemoryTaskGridDescriptor } from '../../task-grid/memoryDescriptor'

//the TaskGrid renders Fluent icons but, unlike Form, nothing in its tree registers them
initializeIcons()

const MemoryTaskGrid = () => {
    const pcfContext = usePcfContext()
    //one descriptor per mount - it owns the in-memory task state for the session
    const descriptor = React.useMemo(() => createMemoryTaskGridDescriptor(), [])
    return <TaskGrid pcfContext={pcfContext} taskGridDescriptor={descriptor} />
}

const meta = {
    title: 'Task Grid',
    parameters: {
        layout: 'fullscreen',
        controls: { disable: true },
        docs: {
            disable: true,
        },
        previewTabs: {
            canvas: { hidden: true },
            'storybook/docs/panel': { hidden: true },
        },
        options: {
            showPanel: false,
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
    name: 'Memory strategy',
    render: () => <MemoryTaskGrid />,
}
