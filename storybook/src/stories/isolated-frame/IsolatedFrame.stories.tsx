import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { IsolationExample } from '../../isolated-frame/isolatedFrameExamples'

const DESCRIPTION = `
A control shares its page with everything else on it, so another app's global CSS can restyle it, and the global styles it adds reach the rest of the page. Control isolation runs the control inside its own iframe instead, where nothing on the page can style it and nothing it injects reaches the page. It is meant for controls that share a page with styles or scripts you do not control. Try it below: the page carries another app's global CSS, which the grid in the page picks up and the same grid in a frame does not. Open **Code** and change that CSS to see it reach only the page.

{{canvas: Overview}}

## Declare a frame

\`createIsolatedComponent\` declares a control that runs in a frame. The frame loads its own copy of your bundle, React and every other library included, and renders the control against the frame's \`window\` and \`document\`.

A frame cannot be handed children: they belong to the page's copy of your code. So declare what runs in it once, at module level, and render it like the component it wraps, as \`IsolatedDealsGrid\` in the example above is declared in the docs' bundle:

- The key, \`'isolatedDealsGrid'\`, is any string unique within your bundle.
- On the page, \`IsolatedDealsGrid\` renders an iframe, loads your script into it, and renders the content there with the props on every render.
- Inside a frame, it renders the content directly.
- The frame starts empty: wrap the content in the root providers it needs, as in [**Quick start**](?path=/docs/concepts-quick-start--overview), and set up any global state a library needs once per frame, such as registered icons or fonts.
- If the frame fails to load, it shows the error in its place, with a Retry button.

## Options

The third argument of \`createIsolatedComponent\` sets up every frame of this kind. Both are read as the frame loads.

| Option | Type | Default | Description |
|---|---|---|---|
| \`scripts\` | \`IsolatedFrameScript[]\` | The script the library was loaded from | What the frame loads, in order: a URL, or \`{ src, type: 'module' }\`. |
| \`onPrepareWindow\` | \`(frameWindow: Window) => void\` | None | Called before the frame's scripts load. What it puts on the window is there while the frame's code evaluates. |

## The frame prop

One frame's own settings go in its \`frame\` prop, so every other prop goes to the content untouched. Both fields update on every render, like the content props.

| Prop | Type | Default | Description |
|---|---|---|---|
| \`frame.className\` | \`string\` | None | Added to the iframe, which fills its parent. |
| \`frame.title\` | \`string\` | None | The frame's accessible name. |

## How the frame gets its code

By default, the frame loads the script \`@talxis/base-controls\` was loaded from: your bundle when everything is one file, as in a PCF. When your code is split into chunks, or served as ES modules in development, pass \`scripts\`, such as \`[{ src: '/src/tasks-entry.ts', type: 'module' }]\`. One module entry that imports the module declaring the frame is enough, since its imports load the rest.

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
`

const meta = {
    title: 'Concepts/Control isolation',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION),
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
