import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { withOffice } from '../examples/shared'

/** The five people of the office move, and who works on each task. */
export const PEOPLE_FILE: IGridExampleFile = {
    name: 'people.ts',
    code: `import type { IColumn, IMemoryProviderEntityMetadata, IRawRecord } from '@talxis/client-libraries'

export const PERSON_METADATA: IMemoryProviderEntityMetadata = { PrimaryIdAttribute: 'personid', PrimaryNameAttribute: 'name', LogicalName: 'person', QuickFindColumns: ['name'] }

export const PERSON_COLUMNS: IColumn[] = [
    { name: 'name', displayName: 'Name', dataType: 'SingleLine.Text', isPrimary: true },
    { name: 'initials', displayName: 'Initials', dataType: 'SingleLine.Text' },
]

export const PEOPLE: IRawRecord[] = [
    { personid: 'jana', name: 'Jana Nováková', initials: 'JN' },
    { personid: 'tomas', name: 'Tomáš Dvořák', initials: 'TD' },
    { personid: 'petra', name: 'Petra Svobodová', initials: 'PS' },
    { personid: 'martin', name: 'Martin Černý', initials: 'MČ' },
    { personid: 'lucie', name: 'Lucie Králová', initials: 'LK' },
]

//a reference carries its record as data, as a pick in the cell does
const people = (...personIds: string[]) => personIds.map(personId => {
    const person = PEOPLE.find(row => row.personid === personId)!
    return { id: { guid: personId }, etn: 'person', name: person.name, data: person }
})

//who works on each task, by task id
export const ASSIGNMENTS: { [taskId: string]: ComponentFramework.EntityReference[] } = {
    move: people('jana'),
    lease: people('jana'),
    fitout: people('tomas'),
    desks: people('petra'),
    network: people('martin'),
    paint: people('tomas'),
    movers: people('tomas'),
    movein: people('jana', 'tomas'),
    party: people('lucie'),
    invites: people('lucie'),
    catering: people('lucie', 'petra'),
}
`,
}

/** The four kinds of work in the plan, and the kinds of each task. */
export const TAGS_FILE: IGridExampleFile = {
    name: 'tags.ts',
    code: `import type { IColumn, IMemoryProviderEntityMetadata, IRawRecord } from '@talxis/client-libraries'

export const TAG_METADATA: IMemoryProviderEntityMetadata = { PrimaryIdAttribute: 'tagid', PrimaryNameAttribute: 'name', LogicalName: 'tag', QuickFindColumns: ['name'] }

export const TAG_COLUMNS: IColumn[] = [
    { name: 'name', displayName: 'Name', dataType: 'SingleLine.Text', isPrimary: true },
    { name: 'color', displayName: 'Colour', dataType: 'SingleLine.Text' },
]

export const TAGS: IRawRecord[] = [
    { tagid: 'facilities', name: 'Facilities', color: '#ca5010' },
    { tagid: 'it', name: 'IT', color: '#0078d4' },
    { tagid: 'legal', name: 'Legal', color: '#8764b8' },
    { tagid: 'event', name: 'Event', color: '#107c10' },
]

//a colourful pill takes its colour from the record's color
const tags = (...tagIds: string[]) => tagIds.map(tagId => {
    const tag = TAGS.find(row => row.tagid === tagId)!
    return { id: { guid: tagId }, etn: 'tag', name: tag.name, data: tag }
})

//the kinds of work of each task, by task id
export const TASK_TAGS: { [taskId: string]: ComponentFramework.EntityReference[] } = {
    move: tags('facilities'),
    lease: tags('legal'),
    fitout: tags('facilities'),
    desks: tags('facilities'),
    network: tags('it'),
    paint: tags('facilities'),
    movers: tags('facilities'),
    movein: tags('facilities', 'it'),
    party: tags('event'),
    invites: tags('event'),
    catering: tags('event'),
}
`,
}

/** The checklists of three tasks. */
export const CHECKLISTS_FILE: IGridExampleFile = {
    name: 'checklists.ts',
    code: `import type { IMemoryTaskChecklistItem } from '@talxis/base-controls'

//each item names the task it belongs to
export const CHECKLISTS: IMemoryTaskChecklistItem[] = [
    { id: 'rent', taskId: 'lease', name: 'Agree the rent', isCompleted: true },
    { id: 'lawyer', taskId: 'lease', name: 'Have the lawyer read the contract', isCompleted: true },
    { id: 'sign', taskId: 'lease', name: 'Sign and send the lease back', isCompleted: true },
    { id: 'survey', taskId: 'network', name: 'Survey the cabling', isCompleted: true },
    { id: 'switches', taskId: 'network', name: 'Fit the switches and access points', isCompleted: false },
    { id: 'wifi', taskId: 'network', name: 'Test the Wi-Fi on every floor', isCompleted: false },
    { id: 'printers', taskId: 'network', name: 'Connect the printers', isCompleted: false },
    { id: 'keys', taskId: 'movein', name: 'Hand out the keys', isCompleted: false },
    { id: 'boxes', taskId: 'movein', name: 'Unpack the boxes', isCompleted: false },
    { id: 'laptops', taskId: 'movein', name: 'Check every laptop and phone works', isCompleted: false },
]
`,
}

/** The work that waits on other work. */
export const DEPENDENCIES_FILE: IGridExampleFile = {
    name: 'dependencies.ts',
    code: `import type { ITaskDependency } from '@talxis/base-controls'

//finish to start: the successor starts once the predecessor ends
export const DEPENDENCIES: ITaskDependency[] = [
    { id: 'desks-network', predecessorTaskId: 'desks', successorTaskId: 'network', type: 'finishToStart' },
    { id: 'network-movein', predecessorTaskId: 'network', successorTaskId: 'movein', type: 'finishToStart' },
    { id: 'movers-movein', predecessorTaskId: 'movers', successorTaskId: 'movein', type: 'finishToStart' },
    { id: 'invites-catering', predecessorTaskId: 'invites', successorTaskId: 'catering', type: 'finishToStart' },
]
`,
}

/** The dates the plan is read against: holidays and milestones. */
export const CALENDAR_FILE: IGridExampleFile = {
    name: 'calendar.ts',
    code: `import type { IMemoryMarker, IMemoryNonWorkingDay } from '@talxis/base-controls/gantt'

//the office is closed over Easter
export const HOLIDAYS: IMemoryNonWorkingDay[] = [
    { id: 'goodfriday', date: '2026-04-03', description: 'Good Friday' },
    { id: 'eastermonday', date: '2026-04-06', description: 'Easter Monday' },
]

export const MILESTONES: IMemoryMarker[] = [
    { id: 'moveinday', text: 'Move-in day', date: '2026-03-23' },
    { id: 'openingparty', text: 'Opening party', date: '2026-04-10' },
]
`,
}

/** Work the team plans again and again. */
export const TEMPLATES_FILE: IGridExampleFile = {
    name: 'templates.ts',
    code: `import type { IMemoryTemplate } from '@talxis/base-controls'

//each task under the template sets its column values in data
export const TEMPLATES: IMemoryTemplate[] = [
    {
        id: 'meetingroom',
        name: 'Set up a meeting room',
        children: [
            { data: { subject: 'Fit the screen and camera' } },
            { data: { subject: 'Run the network cables' } },
            { data: { subject: 'Furnish the room' } },
        ],
    },
]
`,
}

/** The project the plan belongs to. */
export const PROJECT_FILE: IGridExampleFile = {
    name: 'project.ts',
    code: `import type { IMemoryProject } from '@talxis/base-controls'

//its dates are ISO strings, handed out as dayjs
export const PROJECT: IMemoryProject = { id: 'officemove', name: 'Office move', startDate: '2026-01-05', endDate: '2026-04-10' }
`,
}

/** The entry, then the office plan, then the plan's data files the example reads. */
export const withOfficePlan = (code: string, ...files: IGridExampleFile[]): IGridExampleFile[] => withOffice(code, ...files)
