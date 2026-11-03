import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
Tools for sizing a component to the box it is given, not to the window, so it fits a full page, a side panel or a phone.

The controls already use them, such as the header on [**DatasetControl › Layout**](?path=/docs/controls-datasetcontrol-layout--overview), and they work the same in components of your own.

## Topics

{{block: pages}}
`

const PAGES: IExploreCard[] = [
    { title: 'Compact parts', iconName: 'MiniContract', href: '?path=/docs/concepts-layout-compact-parts--overview', text: 'Let parts shrink when they run out of room or fall below a width, from a labelled button to an icon, or tabs to a dropdown.' },
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
