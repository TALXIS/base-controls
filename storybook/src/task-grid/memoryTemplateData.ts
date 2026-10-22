import type { IMemoryTemplate } from "@talxis/base-controls";
import { SUBJECT_COL } from "./memoryTaskData";

/** The templates the sample tasks can be created from. */
export const TEMPLATES: IMemoryTemplate[] = [
    {
        id: 'tpl00001-0000-0000-0000-000000000000',
        name: 'Bug Fix Template',
        data: { description: 'Standard template for bug fix tasks' },
        children: [
            //a task may set any task column
            { data: { [SUBJECT_COL]: 'Reproduce the issue', priority: 2, estimatedeffort: 2 } },
            { data: { [SUBJECT_COL]: 'Identify root cause', priority: 2, estimatedeffort: 4 } },
            { data: { [SUBJECT_COL]: 'Implement fix', priority: 2, estimatedeffort: 8 } },
            { data: { [SUBJECT_COL]: 'Write regression test', estimatedeffort: 3 } },
            { data: { [SUBJECT_COL]: 'Code review & merge', estimatedeffort: 1 } },
        ],
    },
    {
        id: 'tpl00002-0000-0000-0000-000000000000',
        name: 'Feature Development Template',
        data: { description: 'Template for new feature implementation' },
        children: [
            {
                data: { [SUBJECT_COL]: 'Requirements & design', estimatedeffort: 16 },
                children: [
                    { data: { [SUBJECT_COL]: 'Draft the spec', estimatedeffort: 8 } },
                    { data: { [SUBJECT_COL]: 'Review with stakeholders', estimatedeffort: 8 } },
                ],
            },
            { data: { [SUBJECT_COL]: 'Implementation', estimatedeffort: 40 } },
            { data: { [SUBJECT_COL]: 'Unit tests', estimatedeffort: 8 } },
            { data: { [SUBJECT_COL]: 'Integration tests', estimatedeffort: 8 } },
            { data: { [SUBJECT_COL]: 'Documentation', description: 'Update the public docs and changelog.' } },
            { data: { [SUBJECT_COL]: 'Code review & merge', estimatedeffort: 2 } },
        ],
    },
    {
        id: 'tpl00003-0000-0000-0000-000000000000',
        name: 'Research Spike Template',
        data: { description: 'Time-boxed research and investigation tasks' },
        children: [
            { data: { [SUBJECT_COL]: 'Define research questions' } },
            { data: { [SUBJECT_COL]: 'Literature / prior art review' } },
            { data: { [SUBJECT_COL]: 'Prototype or experiment', estimatedeffort: 16 } },
            { data: { [SUBJECT_COL]: 'Document findings' } },
            { data: { [SUBJECT_COL]: 'Present conclusions' } },
        ],
    },
];
