import { createGuide } from '../showcase/Guide'

type GridStage = 'Basics' | 'Features' | 'Make it yours' | 'Advanced'

export const { GuideProgress, GuideNavigation, GuideMap } = createGuide<GridStage>({
    name: 'Grid guide',
    idPrefix: 'controls-grid-guide',
    stages: [
        { name: 'Basics', iconName: 'Education', promise: 'Put a grid of deals on a page that users read, edit, check and save, sorted and filtered.' },
        { name: 'Features', iconName: 'Puzzle', promise: 'Add the tools a sales team works with: selection and copying, groups and totals, locks, a remembered place, and groups that load on demand.' },
        { name: 'Make it yours', iconName: 'Color', promise: 'Shape the columns and draw the grid, its cells, headers and empty state as your app looks.' },
        { name: 'Advanced', iconName: 'Code', promise: 'Drive the grid from your code, change what it decides with hooks, and package a feature as a module.' },
    ],
    steps: [
        { stage: 'Basics', title: 'Your first deal grid', text: 'The deals in a grid inside a DatasetControl, each value drawn for its data type.' },
        { stage: 'Basics', title: 'Edit and save', text: 'The editing module: change a value in its cell and save it, at once or from the ribbon.' },
        { stage: 'Basics', title: 'Check what users enter', text: 'Required and read-only columns, values out of range, and a save the CRM refuses.' },
        { stage: 'Basics', title: 'Sort and filter', text: 'Sorting and filtering from each column\'s menu.' },
        { stage: 'Features', title: 'Select and copy', text: 'Tick deals to act on, highlight blocks of cells and copy them out.' },
        { stage: 'Features', title: 'Group and total', text: 'The pipeline grouped by account manager, with totals per group and overall.' },
        { stage: 'Features', title: 'Lock closed deals', text: 'Hooks lock won and lost deals, and leave their stage open.' },
        { stage: 'Features', title: 'Back where they left off', text: 'A stateKey brings back the scroll, the focused cell and the open groups.' },
        { stage: 'Features', title: 'Open groups on demand', text: 'ServerSideGrid fetches an account manager\'s deals as the group opens.' },
        { stage: 'Make it yours', title: 'Shape the columns', text: 'Pin, size and link columns, switch values in place and wrap long notes.' },
        { stage: 'Make it yours', title: 'Colours and density', text: 'Row height, tags in colour, cells and headers coloured by their data, and the grid\'s size.' },
        { stage: 'Make it yours', title: 'Cells and headers of your own', text: 'Draw a column\'s cells and headers your way, and add columns, commands and menu sections.' },
        { stage: 'Make it yours', title: 'Loading and nothing to show', text: 'The grid\'s own empty state and loading overlay, drawn your way.' },
        { stage: 'Advanced', title: 'From your code', text: 'The grid of each mount, its services, modules and events, and when each runs.' },
        { stage: 'Advanced', title: 'Hooks', text: 'Every hook not met yet, when hooks run, and how to make the grid draw again.' },
        { stage: 'Advanced', title: 'Write a module', text: 'Package hooks, state and a part of your own as a module.' },
    ],
    reference: { title: 'Reference', text: 'Every prop, event, module, hook, service and slot of the Grid.', iconName: 'Table', href: '?path=/docs/controls-grid-reference--overview' },
})
