import React from 'react'
import { Markdown, Primary, Title } from '@storybook/addon-docs/blocks'

/**
 * A docs page that puts the live example between the lead-in and the first section, rather than after all
 * of the prose the way the default page does. A reader meets the thing itself before reading about it.
 *
 * The split is the first `## ` heading: everything above it is the lead-in.
 *
 * Pass the page's markdown instead of setting `parameters.docs.description.component` — a custom page
 * replaces the default one, so the description is only rendered because this renders it.
 */
export const docsPageWithExample = (description: string) => {
    const [lead, ...sections] = description.trim().split(/\n(?=## )/)
    const body = sections.join('\n')
    return () => <>
        <Title />
        <Markdown>{lead}</Markdown>
        <Primary />
        {body.length > 0 && <Markdown>{body}</Markdown>}
    </>
}
