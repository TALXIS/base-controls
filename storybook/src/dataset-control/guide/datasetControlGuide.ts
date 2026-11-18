import { createGuide } from '../../grid/showcase/Guide'

type DatasetControlStage = 'Basics' | 'Features' | 'Your data' | 'Advanced'

export const { GuideProgress, GuideNavigation, GuideMap } = createGuide<DatasetControlStage>({
    name: 'DatasetControl guide',
    idPrefix: 'controls-datasetcontrol-guide',
    stages: [
        { name: 'Basics', iconName: 'Education', promise: 'Put a deal list on a page that loads, switches views and recovers from a failure.' },
        { name: 'Features', iconName: 'Puzzle', promise: 'Add the tools around the list: search, paging, commands, columns and messages, laid out to fit.' },
        { name: 'Your data', iconName: 'Database', promise: 'Keep the views users save and the state they leave where your app keeps them.' },
        { name: 'Advanced', iconName: 'Code', promise: 'Drive the list from your code, add parts of your own and draw every part your way.' },
    ],
    steps: [
        { stage: 'Basics', title: 'Your first deal list', text: 'The deals in a grid: an onLoad that returns a provider, and a body that draws it.' },
        { stage: 'Basics', title: 'Views', text: 'Named views of the same deals, each with its own columns, filter or sorting.' },
        { stage: 'Basics', title: 'Load the deals', text: 'What runs on every load, what to load first, and the placeholder meanwhile.' },
        { stage: 'Basics', title: 'When loading fails', text: 'The error in place of the list, its details, and Try again.' },
        { stage: 'Features', title: 'Search and page', text: 'Quick find, the page size and the pages.' },
        { stage: 'Features', title: 'Act on deals', text: 'Commands for the selected deals, editing, saving and unsaved changes.' },
        { stage: 'Features', title: 'Choose the columns', text: 'Users pick each view\'s columns with Edit columns.' },
        { stage: 'Features', title: 'Messages and nothing to show', text: 'Your messages, later load errors, and the empty state.' },
        { stage: 'Features', title: 'Lay it out', text: 'Regions, height and the compact header.' },
        { stage: 'Your data', title: 'Views of their own', text: 'Save as new view, Save changes and Manage views.' },
        { stage: 'Your data', title: 'Back where they left off', text: 'What each view keeps, and a stateKey to keep it longer.' },
        { stage: 'Your data', title: 'Where views are kept', text: 'Users\' views in Dataverse, TALXIS or a store of your own.' },
        { stage: 'Advanced', title: 'From your code', text: 'The control of each load, its parts, events and modules of your own.' },
        { stage: 'Advanced', title: 'Your own UI', text: 'Replace pieces, add parts and draw a view your way.' },
        { stage: 'Advanced', title: 'Fluent UI v9', text: 'Every part drawn in another design system.' },
    ],
    reference: { title: 'Reference', text: 'Every prop, member, part key and slot of the DatasetControl.', iconName: 'Table', href: '?path=/docs/controls-datasetcontrol-reference--overview' },
})
