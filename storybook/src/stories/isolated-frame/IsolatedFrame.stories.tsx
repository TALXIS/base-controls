import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { IsolationExample } from '../../isolated-frame/isolatedFrameExamples'
import { ILifecycleStep, Lifecycle } from '../../grid/showcase/Lifecycle'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
A control shares its page with everything else on it, so another app's global CSS can restyle it, and the global styles it adds reach the rest of the page. Control isolation runs the control in its own iframe, where the page's styles do not reach it and its own do not leak out. Try it below: open **Edit columns** on both sides, and the framed panel stays inside its frame.

{{canvas: Overview}}

## The two sides

A frame cannot be handed children: they belong to the page's copy of your code, and the frame runs code of its own. So an isolated component has two sides, tied together by a key:

| Function | Called | Holds |
|---|---|---|
| \`createIsolatedHost<TProps>(key, options)\` | In the page's code | The key, the props type and the frame's \`scripts\` |
| \`registerIsolatedContent(key, Content)\` | In the frame's script | The component the frame renders |
| \`createIsolatedComponent(key, Content, options)\` | Once, when the page and the frame share one bundle | Both |

The key is any string unique within your app. With the two sides in separate bundles, as in the example, pass \`scripts\`: the page then never loads the content. The frame starts empty, so the content brings the root providers it needs, as in [**Quick start**](?path=/docs/concepts-quick-start--overview), and sets up anything a library needs once per window, such as icons.

## Lifecycle

{{block: lifecycle}}

If the frame fails to load, the error shows in its place, with *Try again*, which starts over with a fresh iframe.

## Options

The host takes these in \`createIsolatedHost\`, or as the third argument of \`createIsolatedComponent\`, and reads them as the frame loads:

- **\`scripts\`** (\`IsolatedFrameScript[]\`): what the frame loads, in order, each a URL or \`{ src, type: 'module' }\`. By default, the script the library was loaded from.
- **\`onPrepareWindow\`** (\`(frameWindow: Window) => void\`): called before the frame's scripts load, so what it puts on the window is there while the frame's code evaluates.

## The frame prop

A frame's own settings go in its \`frame\` prop, so every other prop goes to the content untouched. Both fields update on every render, like the content props:

- **\`frame.className\`**: added to the iframe, which fills its parent.
- **\`frame.title\`**: the frame's accessible name.

## How the frame gets its code

The default \`scripts\` works when everything is one bundle, as in a PCF. Pass \`scripts\` when it is not:

- **Your code is split into chunks, or served as ES modules in development:** one module entry that imports the module declaring the frame is enough, such as \`[{ src: '/src/tasks-entry.ts', type: 'module' }]\`.
- **The content is a bundle of its own:** point \`scripts\` at its entry, which calls \`registerIsolatedContent\`.

## What crosses the frame's edge

- **Props and callbacks.** The content gets them as they are, so a callback runs on the page. The framed grid above gets the page's theme this way.
- **What \`onPrepareWindow\` sets**, such as \`Xrm\` or a configuration object.
- **The page's \`lang\` and \`dir\`**, copied as the frame loads.

Everything handed over still belongs to the page's window, so \`instanceof\` checks against the frame's classes are false for it, such as \`instanceof Error\` for an error the page's APIs reject with. Read its fields instead.

## What does not

- **Popups stay inside.** Callouts, menus and dialogs cannot extend past the frame.
- **Size.** The frame fills its parent and does not grow with its content.
- **Events.** Clicks and key presses inside the frame stay inside it, so the page's shortcuts do not see them, and a click on the page does not close the frame's popups.
- **Security.** The frame shares the page's origin: it keeps out global styles and globals, not hostile code.

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Quick start', iconName: 'Rocket', href: '?path=/docs/concepts-quick-start--overview', text: 'The root providers the framed content brings with it.' },
    { title: 'Theming', iconName: 'Color', href: '?path=/docs/concepts-theming--overview', text: 'Build the theme the page hands the frame as a prop.' },
]

const LIFECYCLE: ILifecycleStep[] = [
    { title: 'The page renders the host', hook: 'frame', text: 'On the page, the component draws an empty iframe in its place; `frame` sets its class and title.' },
    { title: 'The frame window is prepared', hook: 'onPrepareWindow', text: 'The window is marked as a frame and takes the page\'s `lang` and `dir`; hand it anything else here.' },
    { title: 'The scripts load', hook: 'registerIsolatedContent', text: 'The frame loads `scripts` in order, and the code in them registers the content under the key.' },
    { title: 'The content renders', hook: 'content props', text: 'The frame renders the content with every prop but `frame`, and again on every render of the host.' },
    { title: 'The host unmounts', text: 'The content unmounts inside the frame, and the iframe goes with the host.' },
]

const meta = {
    title: 'Concepts/Control isolation',
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
