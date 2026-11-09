import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { IsolationExample } from '../../isolated-frame/isolatedFrameExamples'
import { ILifecycleStep, Lifecycle } from '../../grid/showcase/Lifecycle'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
A control shares its page with everything else on it, so another app's global CSS can restyle it, and the global styles it adds reach the rest of the page. An isolated component runs the control in its own iframe, where the page's styles do not reach it and its own do not leak out. Try it below: open **Edit columns** on both sides, and the framed panel stays inside its frame.

{{canvas: Overview}}

## The two sides

A frame cannot be handed children: they belong to the page's copy of your code, and the frame runs code of its own. So an isolated component has two sides, tied together by a key:

| Function | Called | Holds |
|---|---|---|
| \`createIsolatedHost<TProps>(key, parameters)\` | In the page's code | The key, the props type and the frame's \`scripts\` |
| \`defineIsolatedContent(key, Content)\` | In the frame's script | The component the frame renders |
| \`createIsolatedComponent(key, Content, parameters)\` | Once, when the page and the frame share one bundle | Both |

The key is any string unique within your app. With the two sides in separate bundles, as in the example, pass \`scripts\`: the page then never loads the content. The frame starts empty, so the content brings the root providers it needs, as in [**Quick start**](?path=/docs/concepts-quick-start--overview), and sets up anything a library needs once per window, such as icons.

## Lifecycle

{{block: lifecycle}}

If the frame fails to load, the error shows in its place, with **Try again**, which starts over with a fresh iframe.

## Parameters

The host takes these, typed \`IIsolatedComponentParameters\`, in \`createIsolatedHost\` or as the third argument of \`createIsolatedComponent\`, and reads them as the frame loads.

| Parameter | Type | Default | Description |
|---|---|---|---|
| \`scripts\` | \`IsolatedFrameScript[]\` | The script the library was loaded from | What the frame loads, in order, each a URL or \`{ src, type: 'module' }\`. |
| \`prepareWindow\` | \`(frameWindow: Window) => void\` | None | Called before the frame's scripts load, so what it puts on the window is there while the frame's code evaluates. |

The default \`scripts\` works when everything is one bundle, as in a PCF. When your code is split into chunks, or served as ES modules in development, one module entry that imports the module declaring the frame is enough, such as \`[{ src: '/src/tasks-entry.ts', type: 'module' }]\`. When the content is a bundle of its own, point \`scripts\` at its entry, which calls \`defineIsolatedContent\`.

## The frame prop

A frame's own settings go in its \`frame\` prop, so every other prop goes to the content untouched. Both fields are Live, like the content props.

| Field | Description |
|---|---|
| \`className\` | Added to the iframe, which fills its parent. |
| \`title\` | The frame's accessible name. |

## What crosses the frame's edge

The content gets its props and callbacks as they are, so a callback runs on the page; the framed grid above gets the page's theme this way. What \`prepareWindow\` sets, such as \`Xrm\` or a configuration object, and the page's \`lang\` and \`dir\` are there too. Everything handed over still belongs to the page's window, so \`instanceof\` checks against the frame's classes are false for it, such as \`instanceof Error\` for an error the page's APIs reject with: read its fields instead.

Some things stay on their own side:

| What | Inside the frame |
|---|---|
| Popups | Callouts, menus and dialogs cannot extend past the frame. |
| Size | The frame fills its parent and does not grow with its content. |
| Events | Clicks and key presses stay inside, so the page's shortcuts do not see them, and a click on the page does not close the frame's popups. |
| Security | The frame shares the page's origin: it keeps out global styles and globals, not hostile code. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Quick start', iconName: 'Rocket', href: '?path=/docs/concepts-quick-start--overview', text: 'The root providers the framed content brings with it.' },
    { title: 'Theming', iconName: 'Color', href: '?path=/docs/concepts-theming--overview', text: 'Build the theme the page hands the frame as a prop.' },
    { title: 'PCF context', iconName: 'PlugConnected', href: '?path=/docs/concepts-pcf-context--overview', text: 'The context the framed content builds, or takes from Xrm set by prepareWindow.' },
]

const LIFECYCLE: ILifecycleStep[] = [
    { title: 'The page renders the host', hook: 'frame', text: 'On the page, the component draws an empty iframe in its place; `frame` sets its class and title.' },
    { title: 'The frame window is prepared', hook: 'prepareWindow', text: 'The window is marked as a frame and takes the page\'s `lang` and `dir`; hand it anything else here.' },
    { title: 'The scripts load', hook: 'defineIsolatedContent', text: 'The frame loads `scripts` in order, and the code in them registers the content under the key.' },
    { title: 'The content renders', hook: 'content props', text: 'The frame renders the content with every prop but `frame`, and again on every render of the host.' },
    { title: 'The host unmounts', text: 'The content unmounts inside the frame, and the iframe goes with the host.' },
]

const meta = {
    title: 'Controls/IsolatedFrame/Get started',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { lifecycle: () => <Lifecycle steps={LIFECYCLE} />, explore: () => <ExploreCards cards={EXPLORE} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
    name: 'Overview',
    render: () => renderStory(<IsolationExample />),
}
