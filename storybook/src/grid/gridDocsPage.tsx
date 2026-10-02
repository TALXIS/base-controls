import React from 'react'
import { Canvas, DocsContext, DocsStory, Markdown, Title } from '@storybook/addon-docs/blocks'

const MARKER = /^\{\{\s*(story|canvas|block):\s*(.+?)\s*\}\}\s*$/gm

type IPageToken = { kind: 'markdown'; text: string } | { kind: 'story' | 'canvas' | 'block'; name: string }

const tokenize = (markdown: string): IPageToken[] => {
    const tokens: IPageToken[] = []
    let last = 0
    for (const match of markdown.matchAll(MARKER)) {
        tokens.push({ kind: 'markdown', text: markdown.slice(last, match.index) })
        tokens.push({ kind: match[1] as 'story' | 'canvas' | 'block', name: match[2] })
        last = match.index! + match[0].length
    }
    tokens.push({ kind: 'markdown', text: markdown.slice(last) })
    return tokens.filter(token => token.kind !== 'markdown' || token.text.trim().length > 0)
}

interface IDocsStory {
    id: string
    name: string
    moduleExport: unknown
}

interface IDocsContext {
    componentStories: () => IDocsStory[]
}

interface IGridDocsPageProps {
    markdown: string
    blocks: { [name: string]: () => React.ReactNode }
}

const GridDocsPage = (props: IGridDocsPageProps) => {
    const context = React.useContext(DocsContext) as IDocsContext
    const stories = context.componentStories()
    const tokens = React.useMemo(() => tokenize(props.markdown), [props.markdown])
    const placed = new Set(tokens.flatMap(token => token.kind === 'story' || token.kind === 'canvas' ? [token.name] : []))

    const findStory = (name: string) => {
        const story = stories.find(candidate => candidate.name === name)
        if (!story) {
            throw new Error(`The docs page places a story named "${name}", and the file has none.`)
        }
        return story
    }

    const renderToken = (token: IPageToken, index: number) => {
        switch (token.kind) {
            case 'markdown':
                return <Markdown key={index}>{token.text}</Markdown>
            case 'canvas':
                return <Canvas key={index} of={findStory(token.name).moduleExport} />
            case 'story':
                return <DocsStory key={index} of={findStory(token.name).moduleExport} expanded />
            case 'block':
                return <React.Fragment key={index}>{props.blocks[token.name]?.()}</React.Fragment>
        }
    }

    return <>
        <Title />
        {tokens.map(renderToken)}
        {/* an Overview story belongs to the page itself */}
        {stories.filter(story => !placed.has(story.name) && story.name !== 'Overview').map(story => <DocsStory key={story.id} of={story.moduleExport} expanded />)}
    </>
}

/** A docs page whose `{{story: Name}}`, `{{canvas: Name}}` and `{{block: name}}` lines place what they name. */
export const gridDocsPage = (markdown: string, blocks: IGridDocsPageProps['blocks'] = {}) => () => <GridDocsPage markdown={markdown.trim()} blocks={blocks} />
