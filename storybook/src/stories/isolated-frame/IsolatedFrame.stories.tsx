import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { IsolationShowcase } from '../../isolated-frame/isolatedFrameExamples'

const DESCRIPTION = `
An isolated frame runs a component inside its own iframe. Its own copy of React, Fluent, AG Grid and your code renders it there, against the frame's \`window\` and \`document\`. Nothing on the page can style it, and nothing it injects reaches the page.

Use one when your component shares a page with styles you do not control, such as another app's AG Grid.

Below, the page carries another app's global \`.ag-*\` rules. The grid in the page picks them up; the same grid in a frame does not. The frame's grid adds a global \`.ag-row\` rule of its own that tints its rows, and the grid in the page stays white.

{{canvas: Overview}}

## Declare a frame

A frame cannot be handed children: they belong to the page's copy of your code. Declare what runs in it once, at module level, so the frame finds it in its own copy:

\`\`\`tsx
import { createIsolatedComponent } from '@talxis/base-controls'

export const IsolatedTasks = createIsolatedComponent('tasks', (props: ITasksProps) => <Tasks {...props} />, {
    onPrepareWindow: frameWindow => {
        frameWindow.Xrm = window.Xrm
    },
})
\`\`\`

Then render it like the component it wraps:

\`\`\`tsx
<IsolatedTasks frame={{ className: styles.tasks, title: 'Tasks' }} {...tasksProps} />
\`\`\`

- The key, \`'tasks'\`, is any string unique within your bundle.
- On the page, \`IsolatedTasks\` renders an iframe, loads your script into it, and renders the content there with the props on every render.
- Inside a frame, \`IsolatedTasks\` renders the content directly.
- The frame starts empty: wrap the content in the providers it needs, such as \`PcfContextProvider\` and \`ThemeProvider\`, and register the icons it uses, such as with \`initializeIcons()\`.

## Options

The third argument of \`createIsolatedComponent\` sets up every frame of this kind. Both are read once, as the frame starts.

| Option | Type | Default | Description |
|---|---|---|---|
| \`scripts\` | \`IsolatedFrameScript[]\` | The script your bundle was loaded from | What the frame loads, in order: a URL, or \`{ src, type: 'module' }\`. |
| \`onPrepareWindow\` | \`(frameWindow: Window) => void\` | None | Called before the frame's scripts load. What it puts on the window is there while the frame's code evaluates. |

## Props

One frame's own settings go in its \`frame\` prop, so every other prop goes to the content untouched. Values that change between renders are content props.

| Prop | Type | Default | Description |
|---|---|---|---|
| \`className\` | \`string\` | None | Added to the iframe, which fills its parent. |
| \`title\` | \`string\` | None | The frame's accessible name. |

## How the frame gets its code

By default, the frame loads the script your bundle was loaded from, as a single-file bundle such as a PCF is. A development server that serves ES modules has no such script: pass the \`scripts\` option with an entry that imports the module declaring the frame. This page passes its own entry, served as a module in development and emitted as one file on build.

## What crosses the frame's edge

- **Props and callbacks.** The content gets them as they are, so a callback runs on the page.
- **What \`onPrepareWindow\` sets**, such as \`Xrm\` or a configuration object.

Everything handed over still belongs to the page's window, so \`instanceof\` checks against the frame's classes are false for it, such as \`instanceof Error\` for an error the page's APIs reject with. Read its fields instead.

## What does not

- **Popups stay inside.** Callouts, menus and dialogs cannot extend past the frame.
- **Size.** The frame fills its parent and does not grow with its content.
- **Events.** Clicks and key presses inside the frame stay inside it, so the page's shortcuts do not see them, and a click on the page does not close the frame's popups.
`

const meta = {
    title: 'Isolated frame',
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
    render: () => renderStory(<IsolationShowcase />),
}
