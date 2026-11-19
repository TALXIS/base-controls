import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { GuideMap } from '../../concepts/guide/startGuide'
import { StoreOpeningsExample } from '../../concepts/guide/overviewExamples'

const DESCRIPTION = `
Base Controls is a React library of controls for business applications: grids, task grids with a Gantt chart, checklists, forms and maps, which show your data, edit it and save it. They are built on Fluent UI v8, run in your own React 16.8 or 17 application, and plug into Power Apps as PCF controls. Try it below: switch the view to *On the map* and open a store from its pin.

{{canvas: Store openings}}

## Why build from parts

Business applications need the same things again and again: lists that sort, filter, edit and save, views of those lists, forms, task plans and maps. Writing them anew for every application leaves many slightly different copies to maintain, each with its own behaviour and its own bugs. An AI agent that generates them from scratch each time does the same, and the code base grows large and inconsistent. Base Controls gives you these as finished, tested parts, and you build the application by putting them together, as the example above does, so the code you own is the code specific to your business. When a part does not fit, you do not start over: you change an option, replace one piece of what it draws with a slot (see [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview)), add behaviour with a hook or a module (see [**Write a module**](?path=/docs/controls-grid-extending-write-a-module--overview)), or write a part of your own on the same runtime (see [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview)). If you work with an AI agent, point it at these parts and their extension points instead of letting it write new ones.

## What you see

| You see | Drawn by | Taught in |
|---|---|---|
| The stores in rows, each status as a tag in its colour | \`ClientSideGrid\` with \`enableOptionSetColors\`, in \`DatasetControl.Body\` | [**Your first list**](?path=/docs/concepts-guide-basics-your-first-list--overview) |
| The checkboxes, a cell edited on a double-click, the column menus, the total *Sum 1,005.00* under *Floor area (m²)*, and **Save** and **Discard changes** once a value is changed | The grid's modules, and \`DatasetControl.Ribbon\` in \`StoresRibbon\` | [**Edit and save**](?path=/docs/concepts-guide-basics-edit-and-save--overview) |
| The views *All stores*, *Not open yet* and *On the map*, **Mark N as open** for ticked stores still to open, **Edit columns** and the search field | \`DatasetControl.ViewSwitcher\`, the ribbon's \`onLoad\` in \`StoresRibbon\`, \`DatasetControl.EditColumns\` and \`DatasetControl.QuickFind\` | [**Views and commands**](?path=/docs/concepts-guide-basics-views-and-commands--overview) |
| A store's form in a panel, after a click on its name | \`Form\` in a \`Panel\`, opened by a \`hooks.openRecord\` hook | [**Open a store in a form**](?path=/docs/concepts-guide-basics-open-a-store-in-a-form--overview) |
| The stores as pins, in the view *On the map* | \`LeafletMap\`, picked by the view's \`data\` | [**On the map**](?path=/docs/concepts-guide-more-controls-on-the-map--overview) |
| *Opening plan* in a store's form: its tasks as a tree beside a timeline | \`TaskDatasetControl\`, with \`TaskGrid\` and \`TaskGantt\` | [**The opening plan**](?path=/docs/concepts-guide-more-controls-the-opening-plan--overview) |
| Pins in the colour of each store's status, and a popup with **Open the store** | Slots of the map's \`marker.pin\` and \`marker.popup\` | [**Change what a part draws**](?path=/docs/concepts-guide-make-it-yours-change-what-a-part-draws--overview) |

## How it fits together

An application sets up its host and its look once, at the root, as [**Your first list**](?path=/docs/concepts-guide-basics-your-first-list--overview) shows: the PCF context gives every control the same user, formatting and dialogs, and the app theme the same colours. Records go into a data provider, and controls show them:

| To show | Use |
|---|---|
| A list of records | A data provider, loaded by a [**DatasetControl**](?path=/docs/controls-datasetcontrol-overview--overview) and drawn by a [**Grid**](?path=/docs/controls-grid-get-started--overview), [**TaskGrid**](?path=/docs/controls-taskgrid-overview--overview) or [**Checklist**](?path=/docs/controls-checklist-get-started--overview) |
| A single record | A [**Form**](?path=/docs/controls-form-get-started--overview) |
| Records with a position | A [**Map**](?path=/docs/controls-map-get-started--overview) |

Sorting, filtering, paging, selection and saving work the same in every list, whether the records come from memory, Dataverse or your own API: see [**Data providers**](?path=/docs/concepts-data-providers--overview).

DatasetControl, the grids, the map and the ribbon keep their state and their work in a *runtime*, a new one for every mount, which \`onSetup\` hands to you. How a mount loads, fails and is replaced: [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). A Form does not run on a runtime: it hands you its API through \`onFormReady\` and \`useForm()\`, as [**Talking to the form**](?path=/docs/controls-form-talking-to-the-form--overview) describes.

You customise a control from a single option down to what each part draws:

| To | Use |
|---|---|
| Change what a control does | Its props, and for the grid its modules, column definitions and hooks: see [**Modules**](?path=/docs/controls-grid-modules--overview) |
| Change how a part looks | Its \`components\`, which replace what the part draws: see [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview) |
| Add a part of your own | A component placed among the built-in parts: see DatasetControl's [**Your own UI**](?path=/docs/controls-datasetcontrol-guide-advanced-your-own-ui--overview) |
| Draw a field yourself | A control of your own inside \`Form.Field\`: see the form's [**Your own UI**](?path=/docs/controls-form-your-own-ui--overview) |
| Write a control of your own | A runtime in a \`RuntimeHost\`, which loads, fails and tries again as the library's controls do: see [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview) |

## The guide

The guide builds the app above one step at a time.

{{block: guide}}

Basics and More controls build the app; each step after them changes one thing in it. In Power Apps? Do *Basics*, then [**In Power Apps**](?path=/docs/concepts-guide-your-data-in-power-apps--overview).

## Words you will meet

| Word | Means | Explained in |
|---|---|---|
| Root providers | The providers that go once around the whole application, \`PcfContextProvider\` and \`AppThemeProvider\` among them. | [**Your first list**](?path=/docs/concepts-guide-basics-your-first-list--overview) |
| Record | One row of a list, with a value in each column, such as the store *Lyon Part-Dieu*. | [**Your first list**](?path=/docs/concepts-guide-basics-your-first-list--overview) |
| Data provider | What holds the records, with their columns, sorting, filters, selection and unsaved changes, such as a \`MemoryDataProvider\`. | [**Your first list**](?path=/docs/concepts-guide-basics-your-first-list--overview) |
| \`onLoad\` | Your function that returns the provider, and the views, every time the DatasetControl loads. | [**Your first list**](?path=/docs/concepts-guide-basics-your-first-list--overview) |
| Module | A feature you add by listing it in a control's \`modules\`; a feature you leave out is not there. | [**Edit and save**](?path=/docs/concepts-guide-basics-edit-and-save--overview) |
| Unsaved change | An edited value that stays on its record until it is saved. | [**Edit and save**](?path=/docs/concepts-guide-basics-edit-and-save--overview) |
| View | A named way to look at the records: its \`resolve\` sets the provider up as it opens, and names its columns. | [**Views and commands**](?path=/docs/concepts-guide-basics-views-and-commands--overview) |
| Hook | A function you add where a control asks for one, which changes one thing the control does, such as what opening a record does. | [**Open a store in a form**](?path=/docs/concepts-guide-basics-open-a-store-in-a-form--overview) |
| PCF context | What only the host knows: the user, their culture, the host's dialogs and its data. | [**In Power Apps**](?path=/docs/concepts-guide-your-data-in-power-apps--overview) |
| State key | A control's \`stateKey\`: the entry it keeps its state under, so it comes back as the user left it. | [**Back where you left off**](?path=/docs/concepts-guide-your-data-back-where-you-left-off--overview) |
| Theme | The colours, fonts and effects the controls draw in, which \`useThemeBuilder\` generates from three colours. | [**Your brand**](?path=/docs/concepts-guide-make-it-yours-your-brand--overview) |
| Label | A string a control draws, with an English default that \`LabelsProvider\` replaces. | [**Your language**](?path=/docs/concepts-guide-make-it-yours-your-language--overview) |
| Slot | A function, named \`onRender…\`, that draws one thing of a part. | [**Change what a part draws**](?path=/docs/concepts-guide-make-it-yours-change-what-a-part-draws--overview) |
| Piece | A key of a part's \`components\` that names something inside the part and holds its slots. | [**Change what a part draws**](?path=/docs/concepts-guide-make-it-yours-change-what-a-part-draws--overview) |
| Runtime | The object behind one mount of a control, which loads what the control needs before it draws. | [**A control of your own**](?path=/docs/concepts-guide-make-it-yours-a-control-of-your-own--overview) |

## Concept pages

{{block: concepts}}

## Pick a control

{{block: controls}}

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Your first list', iconName: 'Education', href: '?path=/docs/concepts-guide-basics-your-first-list--overview', text: 'Start the guide: install the packages, set up the root and show the stores in a grid.' },
    { title: 'Data providers', iconName: 'Database', href: '?path=/docs/concepts-data-providers--overview', text: 'Put your records in a provider, from memory, Dataverse or your own API.' },
    { title: 'DatasetControl', iconName: 'ViewDashboard', href: '?path=/docs/controls-datasetcontrol-overview--overview', text: 'The frame around a list of records: loading, views, a ribbon, quick find, column editing and paging.' },
]

const CONCEPTS: IExploreCard[] = [
    { title: 'Data providers', iconName: 'Database', href: '?path=/docs/concepts-data-providers--overview', text: 'The records a list shows, with their sorting, filters, paging, selection and saving.' },
    { title: 'PCF context', iconName: 'PlugConnected', href: '?path=/docs/concepts-pcf-context--overview', text: 'Connect the controls to their host: the user, formatting, dialogs and data access.' },
    { title: 'State persistence', iconName: 'History', href: '?path=/docs/concepts-state-persistence--overview', text: 'Let users come back where they left off, within a session or across sessions.' },
    { title: 'Theming', iconName: 'Color', href: '?path=/docs/concepts-theming--overview', text: 'Build a theme from your brand colours and give parts of the application their own.' },
    { title: 'Localization', iconName: 'LocaleLanguage', href: '?path=/docs/concepts-localization--overview', text: 'Translate every label, change the wording, and add languages of your own.' },
    { title: 'Pieces and slots', iconName: 'Edit', href: '?path=/docs/concepts-pieces-and-slots--overview', text: 'Replace one button or one text a control draws, and keep the rest.' },
    { title: 'Fluent UI', iconName: 'Design', href: '?path=/docs/concepts-fluent-ui--overview', text: 'How the controls build on Fluent UI, and which of its components to use beside them.' },
    { title: 'Layout', iconName: 'Devices3', href: '?path=/docs/concepts-layout--overview', text: 'Fit controls and your own components to the space they are given, from a full page to a phone.' },
]

const CONTROLS: IExploreCard[] = [
    { title: 'DatasetControl', iconName: 'ViewDashboard', href: '?path=/docs/controls-datasetcontrol-overview--overview', text: 'The frame around a list of records: loading, views, a ribbon, quick find, column editing and paging.' },
    { title: 'Grid', iconName: 'Table', href: '?path=/docs/controls-grid-get-started--overview', text: 'An editable table on AG Grid: sorting, filtering, grouping, totals and more, module by module.' },
    { title: 'TaskGrid', iconName: 'Timeline', href: '?path=/docs/controls-taskgrid-overview--overview', text: 'Tasks as a tree, with commands to build the plan and an optional Gantt chart.' },
    { title: 'Checklist', iconName: 'CheckList', href: '?path=/docs/controls-checklist-get-started--overview', text: 'A to-do list over a provider: tick items off, rename, reorder, add and delete them.' },
    { title: 'Form', iconName: 'Questionnaire', href: '?path=/docs/controls-form-get-started--overview', text: 'A record laid out in tabs and sections, with validation, change tracking and saving.' },
    { title: 'Map', iconName: 'MapPin', href: '?path=/docs/controls-map-get-started--overview', text: 'Records with a latitude and a longitude as pins on a map.' },
    { title: 'Ribbon', iconName: 'Ribbon', href: '?path=/docs/controls-ribbon-get-started--overview', text: 'A bar of commands and menus, loaded again when what they act on changes.' },
    { title: 'RuntimeHost', iconName: 'Processing', href: '?path=/docs/controls-runtimehost-get-started--overview', text: 'Run a control of your own as the others run: loading, a failed load with a retry, and a remount.' },
    { title: 'IsolatedFrame', iconName: 'Package', href: '?path=/docs/controls-isolatedframe-get-started--overview', text: 'Run a control in its own frame, kept apart from the global styles and globals of the page around it.' },
]

const meta = {
    title: 'Concepts/Introduction',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { guide: () => <GuideMap />, concepts: () => <ExploreCards cards={CONCEPTS} />, controls: () => <ExploreCards cards={CONTROLS} />, explore: () => <ExploreCards cards={EXPLORE} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const StoreOpenings: Story = {
    name: 'Store openings',
    render: () => renderStory(<StoreOpeningsExample />),
}
