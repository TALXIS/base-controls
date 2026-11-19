import { createGuide } from '../../grid/showcase/Guide'

type GettingStartedStage = 'Basics' | 'More controls' | 'Your data' | 'Make it yours'

export const { GuideProgress, GuideNavigation, GuideMap } = createGuide<GettingStartedStage>({
    name: 'Getting started guide',
    idPrefix: 'concepts-guide',
    stages: [
        { name: 'Basics', iconName: 'Education', promise: 'Put a list of stores on a page, edit and save it, give it views and commands, and open a store in a form.' },
        { name: 'More controls', iconName: 'Org', promise: 'Show the same stores on a map, and plan each opening on a timeline.' },
        { name: 'Your data', iconName: 'Database', promise: 'Save the stores where you keep them, run the app in Power Apps, and bring users back where they left off.' },
        { name: 'Make it yours', iconName: 'Color', promise: 'Draw the app in your brand and language, change what a part draws, and add a control of your own.' },
    ],
    steps: [
        { stage: 'Basics', title: 'Your first list', text: 'Install the packages, set up the root, and show the stores in a grid.' },
        { stage: 'Basics', title: 'Edit and save', text: 'Modules that edit, sort, filter and total the list, and a ribbon that saves it.' },
        { stage: 'Basics', title: 'Views and commands', text: 'Views to switch between, search, Edit columns and a command of your own.' },
        { stage: 'Basics', title: 'Open a store in a form', text: 'A click on a store\'s name opens it in a form that edits the same record.' },
        { stage: 'More controls', title: 'On the map', text: 'A view that draws the same stores as pins.' },
        { stage: 'More controls', title: 'The opening plan', text: 'Each store\'s tasks as a tree and a timeline, inside its form.' },
        { stage: 'Your data', title: 'Where stores come from', text: 'Save the stores through your own API, or load them from Dataverse.' },
        { stage: 'Your data', title: 'In Power Apps', text: 'Run the app as a PCF control, with the host\'s user, culture and dialogs.' },
        { stage: 'Your data', title: 'Back where you left off', text: 'A stateKey brings users back to the view and sorting they left.' },
        { stage: 'Make it yours', title: 'Your brand', text: 'Every control in your colours, from a theme at the root.' },
        { stage: 'Make it yours', title: 'Your language', text: 'Every label in Czech, from one provider at the root.' },
        { stage: 'Make it yours', title: 'Change what a part draws', text: 'Pins in each store\'s status colour, and a popup that opens the store.' },
        { stage: 'Make it yours', title: 'A control of your own', text: 'A forecast that loads, fails and retries as the controls do.' },
    ],
    reference: { title: 'Introduction', text: 'Every concept page and control, from the front page.', iconName: 'Home', href: '?path=/docs/concepts-introduction--overview' },
})
