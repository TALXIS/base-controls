import React from 'react'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

interface IGuidePage {
    title: string
    text: string
}

const GUIDE_PAGES: IGuidePage[] = [
    { title: 'Your first task grid', text: 'The smallest task grid: your rows, a store and a field mapping.' },
    { title: 'Your data', text: 'Keep the tasks in memory, in Dataverse, in TALXIS or behind your own API.' },
    { title: 'Planning', text: 'Views, the flat list, and what the user may create, edit, move and delete.' },
    { title: 'Task modules', text: 'Projects, custom columns, lookup many, templates, checklists and dependencies.' },
    { title: 'The Gantt', text: 'The same tasks on a timeline, with editing, tooltips, markers and links.' },
    { title: 'Make it yours', text: 'Colours by status, people in cells, your own tooltip and content on the bars.' },
    { title: 'From your code', text: 'The task runtime, ribbon commands and modules of your own.' },
]

const toCard = (page: IGuidePage, iconName: string): IExploreCard => ({
    ...page,
    iconName,
    href: `?path=/docs/controls-taskgrid-guide-${page.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}--overview`,
})

interface IGuideNavigationProps {
    /** The title of the page the reader is on. */
    current: string
}

/** The guide's previous and next pages. */
export const GuideNavigation = (props: IGuideNavigationProps) => {
    const index = GUIDE_PAGES.findIndex(page => page.title === props.current)
    const previous = GUIDE_PAGES[index - 1]
    const next = GUIDE_PAGES[index + 1]
    const cards = [previous && toCard(previous, 'Back'), next && toCard(next, 'Forward')].filter((card): card is IExploreCard => !!card)
    return <ExploreCards cards={cards} />
}
