import React from 'react'
import { Icon, mergeStyleSets } from '@fluentui/react'
import { DocsContext } from '@storybook/addon-docs/blocks'
import { NAVIGATE_URL } from 'storybook/internal/core-events'

const styles = mergeStyleSets({
    root: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 12,
        margin: '16px 0 32px',
    },
    card: {
        display: 'flex',
        gap: 12,
        padding: 16,
        border: '1px solid #edebe9',
        borderRadius: 8,
        background: '#ffffff',
        color: 'inherit',
        textDecoration: 'none',
        transition: 'border-color 120ms, box-shadow 120ms',
        selectors: {
            ':hover': { borderColor: '#5B5FC7', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' },
            ':focus-visible': { outline: '2px solid #5B5FC7', outlineOffset: 2 },
        },
    },
    icon: {
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 8,
        background: '#e8ebfa',
        color: '#5B5FC7',
        fontSize: 18,
    },
    title: {
        display: 'block',
        marginBottom: 4,
        fontSize: 15,
        fontWeight: 600,
    },
    text: {
        display: 'block',
        color: '#605e5c',
        fontSize: 13,
        lineHeight: '19px',
    },
})

export interface IExploreCard {
    title: string
    text: string
    iconName: string
    /** A Storybook path, such as `?path=/docs/grid-editing--overview`. */
    href: string
}

interface IDocsContext {
    channel: { emit: (event: string, ...args: unknown[]) => void }
}

interface IExploreCardsProps {
    cards: IExploreCard[]
}

/** Cards that open other docs pages. */
export const ExploreCards = (props: IExploreCardsProps) => {
    const context = React.useContext(DocsContext) as IDocsContext

    //links navigate the manager, not the docs iframe
    const onClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
            return
        }
        event.preventDefault()
        context.channel.emit(NAVIGATE_URL, href)
    }

    return <nav className={styles.root}>
        {props.cards.map(card => <a key={card.href} href={card.href} className={styles.card} onClick={event => onClick(event, card.href)}>
            <span className={styles.icon}><Icon iconName={card.iconName} /></span>
            <span>
                <span className={styles.title}>{card.title}</span>
                <span className={styles.text}>{card.text}</span>
            </span>
        </a>)}
    </nav>
}
