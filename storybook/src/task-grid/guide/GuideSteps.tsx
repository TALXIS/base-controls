import React from 'react'
import { Icon, mergeStyleSets } from '@fluentui/react'
import { DocsContext } from '@storybook/addon-docs/blocks'
import { NAVIGATE_URL } from 'storybook/internal/core-events'
import { StorybookTheme, useTheme } from 'storybook/theming'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

type GuideStage = 'Basics' | 'Features' | 'Your data' | 'Advanced'

interface IGuideStage {
    name: GuideStage
    iconName: string
    /** What the reader can do once the stage is done. */
    promise: string
}

interface IGuideStep {
    stage: GuideStage
    title: string
    text: string
}

const GUIDE_STAGES: IGuideStage[] = [
    { name: 'Basics', iconName: 'Education', promise: 'Put a task grid on a page, let users plan in it, organise it with views, and add the timeline.' },
    { name: 'Features', iconName: 'Puzzle', promise: 'Add what a plan needs beside its tasks: people, dependencies, checklists, templates and the dates that matter.' },
    { name: 'Your data', iconName: 'Database', promise: 'Keep the tasks in Dataverse, in TALXIS or behind your own API.' },
    { name: 'Advanced', iconName: 'Code', promise: 'Draw every part your way, drive the plan from your code and write features of your own.' },
]

const GUIDE_STEPS: IGuideStep[] = [
    { stage: 'Basics', title: 'Your first task grid', text: 'The office move as a tree: your rows, a store and a field mapping.' },
    { stage: 'Basics', title: 'Let users plan', text: 'Create, edit, drag and delete tasks, and keep finished work safe.' },
    { stage: 'Basics', title: 'Views and the tree', text: 'Views, search that keeps its context, the flat list and starting from one task.' },
    { stage: 'Basics', title: 'The timeline', text: 'The same plan on a Gantt chart, moved and drawn with the mouse.' },
    { stage: 'Features', title: 'How modules work', text: 'Where a module goes, which backend it reads and when it loads.' },
    { stage: 'Features', title: 'People and tags', text: 'Who works on each task, and what kind of work it is.' },
    { stage: 'Features', title: 'Dependencies and links', text: 'Work that waits on other work, counted in the grid and drawn on the timeline.' },
    { stage: 'Features', title: 'Checklists and custom columns', text: 'How far each task has got, and columns the team adds itself.' },
    { stage: 'Features', title: 'Templates and the project', text: 'Plan repeated work in one go, and show the project the plan belongs to.' },
    { stage: 'Features', title: 'Dates on the timeline', text: 'Milestones, holidays, today and a tooltip on every bar.' },
    { stage: 'Your data', title: 'Where tasks are kept', text: 'Memory, Dataverse or TALXIS, and exactly what the store is asked.' },
    { stage: 'Your data', title: 'Your own backend', text: 'A store over your own API, stores for the modules, and dates your backend changes.' },
    { stage: 'Advanced', title: 'Make it yours', text: 'Colours by status, people in cells, your own tooltip and content on the bars.' },
    { stage: 'Advanced', title: 'From your code', text: 'The task runtime, the events of every change, and ribbon commands of your own.' },
    { stage: 'Advanced', title: 'Write a module', text: 'Features of your own for the tasks, the grid and the Gantt.' },
]

const toId = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const getHref = (step: IGuideStep) => `?path=/docs/controls-taskgrid-guide-${toId(step.stage)}-${toId(step.title)}--overview`

const getStage = (name: GuideStage) => GUIDE_STAGES.find(stage => stage.name === name)!

interface IDocsContext {
    channel: { emit: (event: string, ...args: unknown[]) => void }
}

//links navigate the manager, not the docs iframe
const useNavigate = () => {
    const context = React.useContext(DocsContext) as IDocsContext
    return (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
            return
        }
        event.preventDefault()
        context.channel.emit(NAVIGATE_URL, href)
    }
}

const getProgressStyles = (theme: StorybookTheme) => mergeStyleSets({
    root: {
        margin: '0 0 24px',
        padding: '12px 16px',
        border: `1px solid ${theme.appBorderColor}`,
        borderRadius: 8,
        background: theme.background.content,
    },
    caption: {
        display: 'block',
        marginBottom: 10,
        color: theme.textMutedColor,
        fontSize: 13,
        fontWeight: 600,
    },
    stages: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 12,
    },
    stage: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        minWidth: 0,
    },
    stageName: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        color: theme.textMutedColor,
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
    },
    currentStageName: {
        color: theme.color.secondary,
    },
    steps: {
        display: 'flex',
        gap: 4,
    },
    step: {
        flex: '1 1 0',
        height: 6,
        borderRadius: 3,
        background: theme.appBorderColor,
        selectors: {
            ':hover': { background: theme.textMutedColor },
            ':focus-visible': { outline: `2px solid ${theme.color.secondary}`, outlineOffset: 2 },
        },
    },
    doneStep: {
        background: `color-mix(in srgb, ${theme.color.secondary} 45%, transparent)`,
    },
    currentStep: {
        background: theme.color.secondary,
    },
})

interface IGuideProps {
    /** The title of the step the reader is on. */
    current: string
}

/** Where the reader is in the guide: every stage and step, with this one marked. */
export const GuideProgress = (props: IGuideProps) => {
    const theme = useTheme()
    const styles = React.useMemo(() => getProgressStyles(theme), [theme])
    const navigate = useNavigate()
    const index = GUIDE_STEPS.findIndex(step => step.title === props.current)
    const current = GUIDE_STEPS[index]
    return <nav className={styles.root} aria-label='Task grid guide'>
        <span className={styles.caption}>Step {index + 1} of {GUIDE_STEPS.length} · {current?.stage}</span>
        <div className={styles.stages}>
            {GUIDE_STAGES.map(stage => <div key={stage.name} className={styles.stage}>
                <span className={`${styles.stageName} ${stage.name === current?.stage ? styles.currentStageName : ''}`}>
                    <Icon iconName={stage.iconName} />{stage.name}
                </span>
                <div className={styles.steps}>
                    {GUIDE_STEPS.filter(step => step.stage === stage.name).map(step => {
                        const stepIndex = GUIDE_STEPS.indexOf(step)
                        const state = stepIndex === index ? styles.currentStep : stepIndex < index ? styles.doneStep : ''
                        const href = getHref(step)
                        return <a key={step.title} href={href} title={`${stepIndex + 1}. ${step.title}`} aria-label={`Step ${stepIndex + 1}: ${step.title}`}
                            aria-current={stepIndex === index ? 'step' : undefined} className={`${styles.step} ${state}`} onClick={event => navigate(event, href)} />
                    })}
                </div>
            </div>)}
        </div>
    </nav>
}

/** The previous and next steps; at the end of a stage, the next card names the stage it starts. */
export const GuideNavigation = (props: IGuideProps) => {
    const index = GUIDE_STEPS.findIndex(step => step.title === props.current)
    const previous = GUIDE_STEPS[index - 1]
    const next = GUIDE_STEPS[index + 1]
    const cards: IExploreCard[] = []
    if (previous) {
        cards.push({ title: `${index}. ${previous.title}`, text: previous.text, iconName: 'Back', href: getHref(previous) })
    }
    if (next) {
        const startsStage = next.stage !== GUIDE_STEPS[index].stage
        const text = startsStage ? `Next stage, ${next.stage}: ${getStage(next.stage).promise}` : next.text
        cards.push({ title: `${index + 2}. ${next.title}`, text, iconName: 'Forward', href: getHref(next) })
    }
    else {
        cards.push({ title: 'Reference', text: 'Every prop, field mapping key, module parameter and runtime member.', iconName: 'Table', href: '?path=/docs/controls-taskgrid-reference--overview' })
    }
    return <ExploreCards cards={cards} />
}

const getMapStyles = (theme: StorybookTheme) => mergeStyleSets({
    root: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 12,
        margin: '16px 0 32px',
    },
    stage: {
        padding: 16,
        border: `1px solid ${theme.appBorderColor}`,
        borderRadius: 8,
        background: theme.background.content,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
        fontSize: 15,
        fontWeight: 600,
    },
    icon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: 8,
        background: `color-mix(in srgb, ${theme.color.secondary} 15%, transparent)`,
        color: theme.color.secondary,
        fontSize: 16,
    },
    promise: {
        display: 'block',
        marginBottom: 10,
        color: theme.textMutedColor,
        fontSize: 13,
        lineHeight: '19px',
    },
    steps: {
        margin: 0,
        paddingLeft: 20,
        fontSize: 13,
        lineHeight: '22px',
    },
})

/** The four stages of the guide, each with its promise and its steps. */
export const GuideMap = () => {
    const theme = useTheme()
    const styles = React.useMemo(() => getMapStyles(theme), [theme])
    const navigate = useNavigate()
    return <nav className={styles.root} aria-label='Task grid guide'>
        {GUIDE_STAGES.map(stage => <section key={stage.name} className={styles.stage}>
            <div className={styles.header}><span className={styles.icon}><Icon iconName={stage.iconName} /></span>{stage.name}</div>
            <span className={styles.promise}>{stage.promise}</span>
            <ol className={styles.steps} start={GUIDE_STEPS.findIndex(step => step.stage === stage.name) + 1}>
                {GUIDE_STEPS.filter(step => step.stage === stage.name).map(step => <li key={step.title}>
                    <a href={getHref(step)} onClick={event => navigate(event, getHref(step))}>{step.title}</a>
                </li>)}
            </ol>
        </section>)}
    </nav>
}
