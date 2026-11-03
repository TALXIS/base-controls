import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
A component rarely knows where it will be shown: the same grid may fill a page, sit in a narrow side panel or open on a phone. The window's width does not tell these apart, since a side panel on a wide screen still sits in a wide window, so the layout tools here size a component to the box it is given instead. The controls already use them, such as the header on [**DatasetControl › Layout**](?path=/docs/controls-datasetcontrol-layout--overview), and they work the same in components of your own.

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
