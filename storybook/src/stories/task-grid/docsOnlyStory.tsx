import React from 'react'
import { renderStory } from '../form/storyHelpers'

//docs-only pages have nothing to render: the placeholder draws nothing and the className hides the
//canvas block through the .docs-hidden-preview rule injected in .storybook/preview.tsx
const DocsPlaceholder = () => <div style={{ display: 'none' }} />

/**
 * The `Overview` export for a TaskGrid page that is prose only. All three parts have to travel
 * together — the empty render, the canvas className, and the CSS rule in preview.tsx — so they live
 * here rather than being copied per page.
 */
export const docsOnlyStory = {
    name: 'Overview',
    render: () => renderStory(<DocsPlaceholder />),
    parameters: {
        docs: {
            canvas: {
                className: 'docs-hidden-preview',
            },
        },
    },
}
