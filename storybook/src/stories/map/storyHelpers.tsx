import { ReactNode } from 'react'

/** Everything a story page shares: autodocs, an inline canvas, and no source block cluttering the page. */
export const mapStoryParameters = (description: string) => ({
    layout: 'fullscreen' as const,
    docs: {
        story: { inline: true },
        canvas: { sourceState: 'none' as const, additionalActions: [] },
        description: { component: description }
    }
})

/** A short note under a story's map, for the values a reader should watch change. */
export const StoryNote = ({ children }: { children: ReactNode }) => (
    <p style={{ fontFamily: 'monospace', fontSize: 12, margin: 0, opacity: 0.8 }}>{children}</p>
)
