import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
A control should fit wherever it is put: a full page, a side panel, a dialog or a phone. The layout tools are what the controls are built with to get there, and they work just as well in components of your own.

{{block: pages}}
`

const PAGES: IExploreCard[] = [
    { title: 'Compact parts', iconName: 'Devices3', href: '?path=/docs/concepts-layout-compact-parts--overview', text: 'Let parts shrink when they run out of room or fall below a width, from a labelled button to an icon, or tabs to a dropdown.' },
]

const meta = {
    title: 'Concepts/Layout',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { pages: () => <ExploreCards cards={PAGES} /> }),
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
    name: 'Overview',
    render: () => <></>,
}
