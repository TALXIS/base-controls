import React from 'react'
import { Icon, mergeStyleSets } from '@fluentui/react'
import { DocsContext } from '@storybook/addon-docs/blocks'
import { NAVIGATE_URL } from 'storybook/internal/core-events'
import { StorybookTheme, useTheme } from 'storybook/theming'
import { ExploreCards, IExploreCard } from './ExploreCards'

export interface IGuideStage<TStage extends string> {
    name: TStage
    iconName: string
    /** What the reader can do once the stage is done. */
    promise: string
}

export interface IGuideStep<TStage extends string> {
    stage: TStage
    /** The page's title, the last segment of its Storybook title. */
    title: string
    text: string
}

export interface IGuideParameters<TStage extends string> {
    /** The guide's accessible name, such as "TaskGrid guide". */
    name: string
    /** The docs id the step pages start with, such as `controls-taskgrid-guide`. */
    idPrefix: string
    stages: IGuideStage<TStage>[]
    steps: IGuideStep<TStage>[]
    /** The card after the last step. */
    reference: IExploreCard
}

export interface IGuideProps {
    /** The title of the step the reader is on. */
    current: string
}

export interface IGuide {
    /** Where the reader is in the guide. */
    GuideProgress: (props: IGuideProps) => React.JSX.Element
    /** The cards to the previous and next steps. */
    GuideNavigation: (props: IGuideProps) => React.JSX.Element
    /** Every stage with its promise and steps. */
    GuideMap: () => React.JSX.Element
}

interface IDocsContext {
    channel: { emit: (event: string, ...args: unknown[]) => void }
}

const toId = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

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

/** Builds the progress strip, the step navigation and the stage map of one guide. */
export const createGuide = <TStage extends string>(parameters: IGuideParameters<TStage>): IGuide => {
    const { name, idPrefix, stages, steps, reference } = parameters

    const getHref = (step: IGuideStep<TStage>) => `?path=/docs/${idPrefix}-${toId(step.stage)}-${toId(step.title)}--overview`
    const getStage = (stageName: TStage) => stages.find(stage => stage.name === stageName)!
    const getIndex = (title: string) => steps.findIndex(step => step.title === title)

    const GuideProgress = (props: IGuideProps) => {
        const theme = useTheme()
        const styles = React.useMemo(() => getProgressStyles(theme), [theme])
        const navigate = useNavigate()
        const index = getIndex(props.current)
        const current = steps[index]
        return <nav className={styles.root} aria-label={name}>
            <span className={styles.caption}>Step {index + 1} of {steps.length} · {current?.stage}</span>
            <div className={styles.stages}>
                {stages.map(stage => <div key={stage.name} className={styles.stage}>
                    <span className={`${styles.stageName} ${stage.name === current?.stage ? styles.currentStageName : ''}`}>
                        <Icon iconName={stage.iconName} />{stage.name}
                    </span>
                    <div className={styles.steps}>
                        {steps.filter(step => step.stage === stage.name).map(step => {
                            const stepIndex = steps.indexOf(step)
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

    const GuideNavigation = (props: IGuideProps) => {
        const index = getIndex(props.current)
        const previous = steps[index - 1]
        const next = steps[index + 1]
        const cards: IExploreCard[] = []
        if (previous) {
            cards.push({ title: `${index}. ${previous.title}`, text: previous.text, iconName: 'Back', href: getHref(previous) })
        }
        if (next) {
            const startsStage = next.stage !== steps[index].stage
            const text = startsStage ? `Next stage, ${next.stage}: ${getStage(next.stage).promise}` : next.text
            cards.push({ title: `${index + 2}. ${next.title}`, text, iconName: 'Forward', href: getHref(next) })
        }
        else {
            cards.push(reference)
        }
        return <ExploreCards cards={cards} />
    }

    const GuideMap = () => {
        const theme = useTheme()
        const styles = React.useMemo(() => getMapStyles(theme), [theme])
        const navigate = useNavigate()
        return <nav className={styles.root} aria-label={name}>
            {stages.map(stage => <section key={stage.name} className={styles.stage}>
                <div className={styles.header}><span className={styles.icon}><Icon iconName={stage.iconName} /></span>{stage.name}</div>
                <span className={styles.promise}>{stage.promise}</span>
                <ol className={styles.steps} start={steps.findIndex(step => step.stage === stage.name) + 1}>
                    {steps.filter(step => step.stage === stage.name).map(step => <li key={step.title}>
                        <a href={getHref(step)} onClick={event => navigate(event, getHref(step))}>{step.title}</a>
                    </li>)}
                </ol>
            </section>)}
        </nav>
    }

    return { GuideProgress, GuideNavigation, GuideMap }
}
