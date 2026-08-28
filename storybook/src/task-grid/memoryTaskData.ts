import { IColumn, IMemoryProviderEntityMetadata, IRawRecord } from "@talxis/client-libraries";
import { LexoRank } from "lexorank";
import { CHECKLIST_COLUMN_NAME, PREDECESSORS_COLUMN_NAME, SUCCESSORS_COLUMN_NAME } from "@talxis/base-controls";
import type { IChecklistItem, IMemoryEntitySource, IMemoryTaskTemplateNode, IMemoryTemplateSource, ITaskDependency } from "@talxis/base-controls";
import { personRef, tagRef } from "./memoryLookupManyData";

// ─── Column names ─────────────────────────────────────────────────────────────

export const ENTITY_NAME = 'mem_task';
export const PRIMARY_ID = 'mem_taskid';
export const SUBJECT_COL = 'subject';
export const PARENT_ID_COL = 'parentid';
export const STACK_RANK_COL = 'stackrank';
export const STATE_CODE_COL = 'statecode';
export const PERCENT_COMPLETE_COL = 'percentcomplete';
/** The grid's own dependency columns. Declared here so the demo's views show them out of the box. */
export const PREDECESSORS_COL = PREDECESSORS_COLUMN_NAME;
export const SUCCESSORS_COL = SUCCESSORS_COLUMN_NAME;
/** The grid's own checklist column. Declared here so the demo's views show it out of the box. */
export const CHECKLIST_COL = CHECKLIST_COLUMN_NAME;

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const ENTITY_METADATA: IMemoryProviderEntityMetadata = {
    PrimaryIdAttribute: PRIMARY_ID,
    LogicalName: ENTITY_NAME,
};

// ─── Column definitions ───────────────────────────────────────────────────────

export const COLUMNS: IColumn[] = [
    {
        name: SUBJECT_COL,
        dataType: 'SingleLine.Text',
        displayName: 'Subject',
        isPrimary: true,
        visualSizeFactor: 300,
    },
    {
        name: 'description',
        dataType: 'Multiple',
        displayName: 'Description',
        visualSizeFactor: 300,
    },
    {
        name: 'statuscode',
        dataType: 'OptionSet',
        displayName: 'Status',
        visualSizeFactor: 145,
        metadata: {
            OptionSet: [
                { Value: 1, Label: 'Not Started', Color: '#808080' },
                { Value: 2, Label: 'In Progress', Color: '#0078d4' },
                { Value: 3, Label: 'Waiting', Color: '#f7a947' },
                { Value: 4, Label: 'Deferred', Color: '#8764b8' },
                { Value: 5, Label: 'Completed', Color: '#107c10' },
                { Value: 6, Label: 'Cancelled', Color: '#d13438' },
            ],
        },
    },
    {
        name: 'priority',
        dataType: 'OptionSet',
        displayName: 'Priority',
        visualSizeFactor: 120,
        metadata: {
            OptionSet: [
                { Value: 0, Label: 'Low', Color: '#69797e' },
                { Value: 1, Label: 'Normal', Color: '#0078d4' },
                { Value: 2, Label: 'High', Color: '#ff8c00' },
                { Value: 3, Label: 'Critical', Color: '#d13438' },
            ],
        },
    },
    {
        name: 'scheduledstart',
        dataType: 'DateAndTime.DateOnly',
        displayName: 'Start Date',
        visualSizeFactor: 130,
    },
    {
        name: 'scheduledend',
        dataType: 'DateAndTime.DateOnly',
        displayName: 'Due Date',
        visualSizeFactor: 130,
    },
    {
        name: 'estimatedeffort',
        dataType: 'Decimal',
        displayName: 'Est. Effort (h)',
        visualSizeFactor: 130,
    },
    {
        name: 'actualeffort',
        dataType: 'Decimal',
        displayName: 'Actual Effort (h)',
        visualSizeFactor: 130,
    },
    {
        name: PERCENT_COMPLETE_COL,
        dataType: 'Whole.None',
        displayName: '% Complete',
        visualSizeFactor: 160,
        controls: [{
            appliesTo: 'both',
            name: 'PercentComplete',
        }]
    },
    {
        name: 'assignedto',
        dataType: 'Lookup.Simple',
        displayName: 'Assigned To',
        visualSizeFactor: 150,
        metadata: {
            LookupMany: true,
            //declared empty on purpose: a lookup can only be filtered when it is bound to an actual
            //Dataverse entity, and these candidates are local fixtures
            SupportedFilterConditionOperators: [],
        },
        controls: [{
            name: 'PeopleLookupMany',
            appliesTo: 'both' as const,
            bindings: {
                ImageUrlPropertyName: { value: 'imageurl', type: 'SingleLine.Text' as const },
            },
        }],
    },
    {
        name: 'tags',
        dataType: 'Lookup.Simple',
        displayName: 'Tags',
        visualSizeFactor: 200,
        metadata: {
            LookupMany: true,
            //declared empty on purpose: a lookup can only be filtered when it is bound to an actual
            //Dataverse entity, and these candidates are local fixtures
            SupportedFilterConditionOperators: [],
        },
        controls: [{
            name: 'ColorfulLookupMany',
            appliesTo: 'both' as const,
            bindings: {
                ColorPropertyName: { value: 'color', type: 'SingleLine.Text' as const },
            },
        }],
    },
    //the grid injects both of these itself when the dependencies module is registered - declared here
    //only so the demo's views show them without a trip through Edit columns
    {
        name: PREDECESSORS_COL,
        dataType: 'SingleLine.Text',
        displayName: 'Predecessors',
        isVirtual: true,
        visualSizeFactor: 200,
    },
    {
        name: SUCCESSORS_COL,
        dataType: 'SingleLine.Text',
        displayName: 'Successors',
        isVirtual: true,
        visualSizeFactor: 200,
    },
    {
        name: CHECKLIST_COL,
        dataType: 'SingleLine.Text',
        displayName: 'Checklist',
        isVirtual: true,
        visualSizeFactor: 200,
    },
    // ── Native (hidden) columns ──────────────────────────────────────────────
    { name: PRIMARY_ID, dataType: 'SingleLine.Text', displayName: 'ID', visualSizeFactor: 280, isHidden: true },
    {
        name: PARENT_ID_COL,
        dataType: 'Lookup.Simple',
        displayName: 'Parent',
        visualSizeFactor: 200,
        isHidden: true,
        //same as the lookup-many columns: filtering a lookup needs an actual Dataverse binding
        metadata: { SupportedFilterConditionOperators: [] },
    },
    { name: STACK_RANK_COL, dataType: 'SingleLine.Text', displayName: 'Stack Rank', visualSizeFactor: 140, isHidden: true },
    { name: STATE_CODE_COL, dataType: 'Whole.None', displayName: 'State', visualSizeFactor: 100, isHidden: true },
];

/**
 * Returns the hidden (native) columns plus the named visible ones, in the order they appear in
 * {@link COLUMNS}. Used to build each saved view's column set.
 */
/**
 * Builds a view's column list: every entity column is included, and the ones the view does not name
 * arrive hidden — the same shape a Dataverse saved-query layout produces, which is what keeps them
 * available in the *Edit columns* panel.
 */
export const getQueryColumns = (...visibleColumnNames: string[]): IColumn[] =>
    COLUMNS.map(column => ({
        ...column,
        isHidden: column.isHidden || !visibleColumnNames.includes(column.name),
    }));

// ─── LexoRank seed values ─────────────────────────────────────────────────────

/** 20 evenly-spaced seed ranks — used for initial task data ordering. */
export const SEED_RANKS: string[] = (() => {
    const ranks: string[] = [];
    let rank = LexoRank.middle();
    for (let i = 0; i < 20; i++) {
        ranks.push(rank.format());
        rank = rank.genNext();
    }
    return ranks;
})();

// ─── Templates ────────────────────────────────────────────────────────────────

export const TEMPLATE_ENTITY_NAME = 'mem_template';
export const TEMPLATE_METADATA: IMemoryProviderEntityMetadata = {
    PrimaryIdAttribute: 'mem_templateid',
    PrimaryNameAttribute: 'subject',
    LogicalName: TEMPLATE_ENTITY_NAME,
    QuickFindColumns: ['subject']
};

export const SAMPLE_TEMPLATES: IRawRecord[] = [
    {
        mem_templateid: 'tpl00001-0000-0000-0000-000000000000',
        subject: 'Bug Fix Template',
        description: 'Standard template for bug fix tasks',
    },
    {
        mem_templateid: 'tpl00002-0000-0000-0000-000000000000',
        subject: 'Feature Development Template',
        description: 'Template for new feature implementation',
    },
    {
        mem_templateid: 'tpl00003-0000-0000-0000-000000000000',
        subject: 'Research Spike Template',
        description: 'Time-boxed research and investigation tasks',
    },
];

export const TEMPLATE_COLUMNS: IColumn[] = [
    { name: 'mem_templateid', dataType: 'SingleLine.Text', displayName: 'ID', visualSizeFactor: 280, isHidden: true },
    { name: 'subject', dataType: 'SingleLine.Text', displayName: 'Subject', visualSizeFactor: 200 },
    { name: 'description', dataType: 'Multiple', displayName: 'Description', visualSizeFactor: 300 },
];

/** Child task hierarchy created per template when expanding from a template. */
export const TEMPLATE_CHILDREN: Record<string, IMemoryTaskTemplateNode[]> = {
    'tpl00001-0000-0000-0000-000000000000': [
        //a node may set any task column, not just the subject
        { values: { [SUBJECT_COL]: 'Reproduce the issue', priority: 2, estimatedeffort: 2 } },
        { values: { [SUBJECT_COL]: 'Identify root cause', priority: 2, estimatedeffort: 4 } },
        { values: { [SUBJECT_COL]: 'Implement fix', priority: 2, estimatedeffort: 8 } },
        { values: { [SUBJECT_COL]: 'Write regression test', estimatedeffort: 3 } },
        { values: { [SUBJECT_COL]: 'Code review & merge', estimatedeffort: 1 } },
    ],
    'tpl00002-0000-0000-0000-000000000000': [
        {
            values: { [SUBJECT_COL]: 'Requirements & design', estimatedeffort: 16 },
            children: [
                { values: { [SUBJECT_COL]: 'Draft the spec', estimatedeffort: 8 } },
                { values: { [SUBJECT_COL]: 'Review with stakeholders', estimatedeffort: 8 } },
            ],
        },
        { values: { [SUBJECT_COL]: 'Implementation', estimatedeffort: 40 } },
        { values: { [SUBJECT_COL]: 'Unit tests', estimatedeffort: 8 } },
        { values: { [SUBJECT_COL]: 'Integration tests', estimatedeffort: 8 } },
        { values: { [SUBJECT_COL]: 'Documentation', description: 'Update the public docs and changelog.' } },
        { values: { [SUBJECT_COL]: 'Code review & merge', estimatedeffort: 2 } },
    ],
    'tpl00003-0000-0000-0000-000000000000': [
        { values: { [SUBJECT_COL]: 'Define research questions' } },
        { values: { [SUBJECT_COL]: 'Literature / prior art review' } },
        { values: { [SUBJECT_COL]: 'Prototype or experiment', estimatedeffort: 16 } },
        { values: { [SUBJECT_COL]: 'Document findings' } },
        { values: { [SUBJECT_COL]: 'Present conclusions' } },
    ],
};

// ─── Task data helpers ────────────────────────────────────────────────────────

/** The parent lookup value: an entity-reference array stored under the plain column name. `name` is what the grid renders when the column is shown. */
function parentRef(taskId: string, name: string) {
    return [{ id: { guid: taskId }, etn: ENTITY_NAME, name: name }];
}

/** Generates a deterministic UUID from a compact numeric key. */
function tid(epic: number, l1 = 0, l2 = 0): string {
    return [
        epic.toString().padStart(2, '0') +
        l1.toString().padStart(3, '0') +
        l2.toString().padStart(3, '0'),
        '0000',
        '0000',
        '0000',
        '000000000000',
    ].join('-');
}

// ─── Raw task records (108 tasks) ─────────────────────────────────────────────

export const TASKS: IRawRecord[] = [
    // ═════════════════════════════════════════════════════════════════════════
    // EPIC 1 — Website Redesign
    // ═════════════════════════════════════════════════════════════════════════
    {
        [PRIMARY_ID]: tid(1), subject: 'Website Redesign', [PARENT_ID_COL]: null,
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 2, percentcomplete: 60,
        scheduledstart: '2025-10-01', scheduledend: '2026-01-31',
        estimatedeffort: 480, actualeffort: 290,
        assignedto: [personRef('Alex Chen')], tags: [tagRef('design'), tagRef('frontend'), tagRef('backend')],
        description: 'Complete overhaul of the public-facing website including UX redesign, content migration and performance improvements.',
    },
    // L1 tasks
    {
        [PRIMARY_ID]: tid(1, 1), subject: 'Discovery & Planning', [PARENT_ID_COL]: parentRef(tid(1), 'Website Redesign'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 2, percentcomplete: 100,
        scheduledstart: '2025-10-01', scheduledend: '2025-10-31',
        estimatedeffort: 40, actualeffort: 42,
        assignedto: [personRef('Sam Rivera')], tags: [tagRef('requirements'), tagRef('planning')],
        description: 'Gather requirements, conduct stakeholder interviews and perform competitive analysis.',
    },
    {
        [PRIMARY_ID]: tid(1, 2), subject: 'UX/UI Design', [PARENT_ID_COL]: parentRef(tid(1), 'Website Redesign'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 2, percentcomplete: 100,
        scheduledstart: '2025-11-01', scheduledend: '2025-11-28',
        estimatedeffort: 80, actualeffort: 76,
        assignedto: [personRef('Sam Rivera')], tags: [tagRef('design'), tagRef('ux')],
        description: 'User journey mapping, wireframing, and high-fidelity mockup creation.',
    },
    {
        [PRIMARY_ID]: tid(1, 3), subject: 'Frontend Development', [PARENT_ID_COL]: parentRef(tid(1), 'Website Redesign'),
        [STACK_RANK_COL]: SEED_RANKS[2], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 2, percentcomplete: 55,
        scheduledstart: '2025-12-01', scheduledend: '2026-01-15',
        estimatedeffort: 200, actualeffort: 110,
        assignedto: [personRef('Alex Chen')], tags: [tagRef('frontend'), tagRef('react')],
        description: 'Build the new component library and implement all page templates.',
    },
    {
        [PRIMARY_ID]: tid(1, 4), subject: 'Content Migration', [PARENT_ID_COL]: parentRef(tid(1), 'Website Redesign'),
        [STACK_RANK_COL]: SEED_RANKS[3], [STATE_CODE_COL]: 1,
        statuscode: 3, priority: 1, percentcomplete: 30,
        scheduledstart: '2026-01-01', scheduledend: '2026-01-20',
        estimatedeffort: 60, actualeffort: 18,
        assignedto: [personRef('Jamie Walsh')], tags: [tagRef('content'), tagRef('seo')],
        description: 'Migrate all existing content to the new CMS, set up URL redirects.',
    },
    {
        [PRIMARY_ID]: tid(1, 5), subject: 'Launch & QA', [PARENT_ID_COL]: parentRef(tid(1), 'Website Redesign'),
        [STACK_RANK_COL]: SEED_RANKS[4], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 2, percentcomplete: 0,
        scheduledstart: '2026-01-16', scheduledend: '2026-01-31',
        estimatedeffort: 60, actualeffort: 0,
        assignedto: [personRef('Chris Kim')], tags: [tagRef('testing'), tagRef('qa'), tagRef('performance')],
        description: 'Cross-browser testing, accessibility audit and final performance optimisation.',
    },
    // L2 subtasks under Discovery & Planning
    {
        [PRIMARY_ID]: tid(1, 1, 1), subject: 'Stakeholder interviews', [PARENT_ID_COL]: parentRef(tid(1, 1), 'Discovery & Planning'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 2, percentcomplete: 100,
        scheduledstart: '2025-10-01', scheduledend: '2025-10-10',
        estimatedeffort: 16, actualeffort: 18,
        assignedto: [personRef('Sam Rivera')], tags: [tagRef('requirements')],
        description: 'Interview key stakeholders to capture business goals and pain points.',
    },
    {
        [PRIMARY_ID]: tid(1, 1, 2), subject: 'Market & competitor research', [PARENT_ID_COL]: parentRef(tid(1, 1), 'Discovery & Planning'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 1, percentcomplete: 100,
        scheduledstart: '2025-10-11', scheduledend: '2025-10-31',
        estimatedeffort: 24, actualeffort: 24,
        assignedto: [personRef('Alex Chen')], tags: [tagRef('research')],
        description: 'Analyse top competitors, identify design trends and benchmark site performance.',
    },
    // L2 subtasks under UX/UI Design
    {
        [PRIMARY_ID]: tid(1, 2, 1), subject: 'User journey mapping', [PARENT_ID_COL]: parentRef(tid(1, 2), 'UX/UI Design'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 2, percentcomplete: 100,
        scheduledstart: '2025-11-01', scheduledend: '2025-11-07',
        estimatedeffort: 16, actualeffort: 14,
        assignedto: [personRef('Sam Rivera')], tags: [tagRef('ux'), tagRef('design')],
        description: 'Map out all primary user flows to identify friction points.',
    },
    {
        [PRIMARY_ID]: tid(1, 2, 2), subject: 'Wireframing', [PARENT_ID_COL]: parentRef(tid(1, 2), 'UX/UI Design'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 2, percentcomplete: 100,
        scheduledstart: '2025-11-08', scheduledend: '2025-11-18',
        estimatedeffort: 30, actualeffort: 28,
        assignedto: [personRef('Sam Rivera')], tags: [tagRef('ux'), tagRef('wireframe')],
        description: 'Create low-fidelity wireframes for all key pages.',
    },
    {
        [PRIMARY_ID]: tid(1, 2, 3), subject: 'High-fidelity mockups', [PARENT_ID_COL]: parentRef(tid(1, 2), 'UX/UI Design'),
        [STACK_RANK_COL]: SEED_RANKS[2], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 2, percentcomplete: 100,
        scheduledstart: '2025-11-19', scheduledend: '2025-11-28',
        estimatedeffort: 34, actualeffort: 34,
        assignedto: [personRef('Sam Rivera')], tags: [tagRef('design'), tagRef('ui')],
        description: 'Produce pixel-perfect mockups and an interactive prototype.',
    },
    // L2 subtasks under Frontend Development
    {
        [PRIMARY_ID]: tid(1, 3, 1), subject: 'Design system setup', [PARENT_ID_COL]: parentRef(tid(1, 3), 'Frontend Development'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 2, percentcomplete: 100,
        scheduledstart: '2025-12-01', scheduledend: '2025-12-10',
        estimatedeffort: 32, actualeffort: 30,
        assignedto: [personRef('Alex Chen')], tags: [tagRef('frontend'), tagRef('design-system')],
        description: 'Establish a shared component library with tokens, typography, and colours.',
    },
    {
        [PRIMARY_ID]: tid(1, 3, 2), subject: 'Homepage & hero section', [PARENT_ID_COL]: parentRef(tid(1, 3), 'Frontend Development'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 2, percentcomplete: 100,
        scheduledstart: '2025-12-11', scheduledend: '2025-12-20',
        estimatedeffort: 40, actualeffort: 38,
        assignedto: [personRef('Alex Chen')], tags: [tagRef('frontend')],
        description: 'Implement the homepage with animated hero, feature highlights, and CTA sections.',
    },
    {
        [PRIMARY_ID]: tid(1, 3, 3), subject: 'Product catalog pages', [PARENT_ID_COL]: parentRef(tid(1, 3), 'Frontend Development'),
        [STACK_RANK_COL]: SEED_RANKS[2], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 2, percentcomplete: 60,
        scheduledstart: '2025-12-21', scheduledend: '2026-01-07',
        estimatedeffort: 60, actualeffort: 36,
        assignedto: [personRef('Alex Chen')], tags: [tagRef('frontend')],
        description: 'Build filterable product listing with lazy-load, quick-view, and sorting.',
    },
    {
        [PRIMARY_ID]: tid(1, 3, 4), subject: 'Checkout flow', [PARENT_ID_COL]: parentRef(tid(1, 3), 'Frontend Development'),
        [STACK_RANK_COL]: SEED_RANKS[3], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 3, percentcomplete: 0,
        scheduledstart: '2026-01-08', scheduledend: '2026-01-15',
        estimatedeffort: 50, actualeffort: 0,
        assignedto: [personRef('Alex Chen')], tags: [tagRef('frontend'), tagRef('payments')],
        description: 'Multi-step checkout with address, payment, and order-confirmation screens.',
    },
    // L2 subtasks under Content Migration
    {
        [PRIMARY_ID]: tid(1, 4, 1), subject: 'Content inventory', [PARENT_ID_COL]: parentRef(tid(1, 4), 'Content Migration'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 1, percentcomplete: 100,
        scheduledstart: '2026-01-01', scheduledend: '2026-01-08',
        estimatedeffort: 16, actualeffort: 15,
        assignedto: [personRef('Jamie Walsh')], tags: [tagRef('content')],
        description: 'Audit all existing pages and assets; classify for keep / update / retire.',
    },
    {
        [PRIMARY_ID]: tid(1, 4, 2), subject: 'SEO redirect mapping', [PARENT_ID_COL]: parentRef(tid(1, 4), 'Content Migration'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 1,
        statuscode: 3, priority: 1, percentcomplete: 20,
        scheduledstart: '2026-01-09', scheduledend: '2026-01-20',
        estimatedeffort: 24, actualeffort: 5,
        assignedto: [personRef('Jamie Walsh')], tags: [tagRef('seo'), tagRef('content')],
        description: 'Map all old URLs to new slugs and configure 301 redirects.',
    },
    // L2 subtasks under Launch & QA
    {
        [PRIMARY_ID]: tid(1, 5, 1), subject: 'Cross-browser testing', [PARENT_ID_COL]: parentRef(tid(1, 5), 'Launch & QA'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 2, percentcomplete: 0,
        scheduledstart: '2026-01-16', scheduledend: '2026-01-22',
        estimatedeffort: 20, actualeffort: 0,
        assignedto: [personRef('Chris Kim')], tags: [tagRef('testing'), tagRef('qa')],
        description: 'Verify layout and functionality on Chrome, Firefox, Safari, Edge, and iOS/Android.',
    },
    {
        [PRIMARY_ID]: tid(1, 5, 2), subject: 'Performance optimisation', [PARENT_ID_COL]: parentRef(tid(1, 5), 'Launch & QA'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 2, percentcomplete: 0,
        scheduledstart: '2026-01-23', scheduledend: '2026-01-27',
        estimatedeffort: 16, actualeffort: 0,
        assignedto: [personRef('Alex Chen')], tags: [tagRef('performance'), tagRef('frontend')],
        description: 'Achieve Core Web Vitals score ≥ 90 on mobile and desktop.',
    },
    {
        [PRIMARY_ID]: tid(1, 5, 3), subject: 'Accessibility audit', [PARENT_ID_COL]: parentRef(tid(1, 5), 'Launch & QA'),
        [STACK_RANK_COL]: SEED_RANKS[2], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 2, percentcomplete: 0,
        scheduledstart: '2026-01-28', scheduledend: '2026-01-31',
        estimatedeffort: 12, actualeffort: 0,
        assignedto: [personRef('Chris Kim')], tags: [tagRef('a11y'), tagRef('testing')],
        description: 'Ensure WCAG 2.1 AA compliance; fix all critical and major issues.',
    },

    // ═════════════════════════════════════════════════════════════════════════
    // EPIC 2 — API Platform v2
    // ═════════════════════════════════════════════════════════════════════════
    {
        [PRIMARY_ID]: tid(2), subject: 'API Platform v2', [PARENT_ID_COL]: null,
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 3, percentcomplete: 45,
        scheduledstart: '2025-09-01', scheduledend: '2026-03-31',
        estimatedeffort: 600, actualeffort: 270,
        assignedto: [personRef('Maya Patel')], tags: [tagRef('api'), tagRef('backend'), tagRef('architecture')],
        description: 'Ground-up rewrite of the REST API with versioning, improved auth, and a public developer portal.',
    },
    {
        [PRIMARY_ID]: tid(2, 1), subject: 'Architecture Planning', [PARENT_ID_COL]: parentRef(tid(2), 'API Platform v2'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 3, percentcomplete: 100,
        scheduledstart: '2025-09-01', scheduledend: '2025-09-30',
        estimatedeffort: 40, actualeffort: 48,
        assignedto: [personRef('Maya Patel')], tags: [tagRef('architecture'), tagRef('api')],
        description: 'Define API versioning strategy, contract-first design and technology stack.',
    },
    {
        [PRIMARY_ID]: tid(2, 1, 1), subject: 'API design review board', [PARENT_ID_COL]: parentRef(tid(2, 1), 'Architecture Planning'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 3, percentcomplete: 100,
        scheduledstart: '2025-09-15', scheduledend: '2025-09-30',
        estimatedeffort: 16, actualeffort: 20,
        assignedto: [personRef('Maya Patel')], tags: [tagRef('architecture')],
        description: 'Establish a cross-team review board and sign off on the final spec.',
    },
    {
        [PRIMARY_ID]: tid(2, 2), subject: 'Authentication & Authorisation', [PARENT_ID_COL]: parentRef(tid(2), 'API Platform v2'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 3, percentcomplete: 100,
        scheduledstart: '2025-10-01', scheduledend: '2025-11-15',
        estimatedeffort: 80, actualeffort: 90,
        assignedto: [personRef('Taylor Morgan')], tags: [tagRef('security'), tagRef('auth'), tagRef('oauth')],
        description: 'Implement OAuth 2.0 with PKCE, JWT short-lived tokens, and API key management.',
    },
    {
        [PRIMARY_ID]: tid(2, 2, 1), subject: 'OAuth 2.0 implementation', [PARENT_ID_COL]: parentRef(tid(2, 2), 'Authentication & Authorisation'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 3, percentcomplete: 100,
        scheduledstart: '2025-10-01', scheduledend: '2025-10-31',
        estimatedeffort: 48, actualeffort: 55,
        assignedto: [personRef('Taylor Morgan')], tags: [tagRef('auth'), tagRef('oauth'), tagRef('security')],
        description: 'Integrate an OAuth 2.0 provider with PKCE flow and token refresh logic.',
    },
    {
        [PRIMARY_ID]: tid(2, 2, 2), subject: 'API key management', [PARENT_ID_COL]: parentRef(tid(2, 2), 'Authentication & Authorisation'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 2, percentcomplete: 100,
        scheduledstart: '2025-11-01', scheduledend: '2025-11-15',
        estimatedeffort: 24, actualeffort: 24,
        assignedto: [personRef('Taylor Morgan')], tags: [tagRef('auth'), tagRef('api')],
        description: 'Self-service portal for generating, rotating and revoking API keys.',
    },
    {
        [PRIMARY_ID]: tid(2, 3), subject: 'Core API Endpoints', [PARENT_ID_COL]: parentRef(tid(2), 'API Platform v2'),
        [STACK_RANK_COL]: SEED_RANKS[2], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 3, percentcomplete: 60,
        scheduledstart: '2025-11-16', scheduledend: '2026-01-31',
        estimatedeffort: 200, actualeffort: 120,
        assignedto: [personRef('Maya Patel')], tags: [tagRef('backend'), tagRef('api')],
        description: 'Build and document all v2 CRUD endpoints for core resources.',
    },
    {
        [PRIMARY_ID]: tid(2, 3, 1), subject: 'Users & accounts endpoints', [PARENT_ID_COL]: parentRef(tid(2, 3), 'Core API Endpoints'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 3, percentcomplete: 100,
        scheduledstart: '2025-11-16', scheduledend: '2025-12-15',
        estimatedeffort: 60, actualeffort: 62,
        assignedto: [personRef('Maya Patel')], tags: [tagRef('backend'), tagRef('api')],
        description: 'Full CRUD for user profiles, organisation membership, and preferences.',
    },
    {
        [PRIMARY_ID]: tid(2, 3, 2), subject: 'Products & catalog endpoints', [PARENT_ID_COL]: parentRef(tid(2, 3), 'Core API Endpoints'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 2, percentcomplete: 70,
        scheduledstart: '2025-12-16', scheduledend: '2026-01-15',
        estimatedeffort: 70, actualeffort: 49,
        assignedto: [personRef('Maya Patel')], tags: [tagRef('backend'), tagRef('catalog')],
        description: 'Endpoints for product listings, variants, pricing, and inventory.',
    },
    {
        [PRIMARY_ID]: tid(2, 3, 3), subject: 'Orders & billing endpoints', [PARENT_ID_COL]: parentRef(tid(2, 3), 'Core API Endpoints'),
        [STACK_RANK_COL]: SEED_RANKS[2], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 3, percentcomplete: 0,
        scheduledstart: '2026-01-16', scheduledend: '2026-01-31',
        estimatedeffort: 70, actualeffort: 0,
        assignedto: [personRef('Maya Patel')], tags: [tagRef('backend'), tagRef('billing')],
        description: 'Order lifecycle management including placement, fulfilment, and refunds.',
    },
    {
        [PRIMARY_ID]: tid(2, 4), subject: 'Rate Limiting & Caching', [PARENT_ID_COL]: parentRef(tid(2), 'API Platform v2'),
        [STACK_RANK_COL]: SEED_RANKS[3], [STATE_CODE_COL]: 1,
        statuscode: 3, priority: 2, percentcomplete: 15,
        scheduledstart: '2026-02-01', scheduledend: '2026-02-28',
        estimatedeffort: 40, actualeffort: 6,
        assignedto: [personRef('Jordan Lee')], tags: [tagRef('backend'), tagRef('performance')],
        description: 'Implement per-tier rate limiting with Redis-backed sliding-window counters and response caching.',
    },
    {
        [PRIMARY_ID]: tid(2, 5), subject: 'Developer Documentation', [PARENT_ID_COL]: parentRef(tid(2), 'API Platform v2'),
        [STACK_RANK_COL]: SEED_RANKS[4], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 2, percentcomplete: 0,
        scheduledstart: '2026-03-01', scheduledend: '2026-03-31',
        estimatedeffort: 60, actualeffort: 0,
        assignedto: [personRef('Jamie Walsh')], tags: [tagRef('docs'), tagRef('api')],
        description: 'Interactive developer portal with guides, changelogs, and a request playground.',
    },
    {
        [PRIMARY_ID]: tid(2, 5, 1), subject: 'OpenAPI spec', [PARENT_ID_COL]: parentRef(tid(2, 5), 'Developer Documentation'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 2, percentcomplete: 0,
        scheduledstart: '2026-03-01', scheduledend: '2026-03-15',
        estimatedeffort: 24, actualeffort: 0,
        assignedto: [personRef('Maya Patel')], tags: [tagRef('api'), tagRef('docs')],
        description: 'Maintain a single source-of-truth OpenAPI 3.1 specification for all endpoints.',
    },
    {
        [PRIMARY_ID]: tid(2, 5, 2), subject: 'SDK code samples', [PARENT_ID_COL]: parentRef(tid(2, 5), 'Developer Documentation'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 1, percentcomplete: 0,
        scheduledstart: '2026-03-16', scheduledend: '2026-03-31',
        estimatedeffort: 24, actualeffort: 0,
        assignedto: [personRef('Jamie Walsh')], tags: [tagRef('docs'), tagRef('sdk')],
        description: 'Provide idiomatic code samples in Python, TypeScript, and Go.',
    },

    // ═════════════════════════════════════════════════════════════════════════
    // EPIC 3 — Mobile App (iOS + Android)
    // ═════════════════════════════════════════════════════════════════════════
    {
        [PRIMARY_ID]: tid(3), subject: 'Mobile App (iOS + Android)', [PARENT_ID_COL]: null,
        [STACK_RANK_COL]: SEED_RANKS[2], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 3, percentcomplete: 40,
        scheduledstart: '2025-11-01', scheduledend: '2026-04-30',
        estimatedeffort: 700, actualeffort: 280,
        assignedto: [personRef('Alex Chen')], tags: [tagRef('mobile'), tagRef('react-native')],
        description: 'Cross-platform mobile app using React Native targeting iOS 16+ and Android 12+.',
    },
    {
        [PRIMARY_ID]: tid(3, 1), subject: 'Project Setup', [PARENT_ID_COL]: parentRef(tid(3), 'Mobile App (iOS + Android)'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 2, percentcomplete: 100,
        scheduledstart: '2025-11-01', scheduledend: '2025-11-15',
        estimatedeffort: 40, actualeffort: 38,
        assignedto: [personRef('Jordan Lee')], tags: [tagRef('mobile'), tagRef('ci-cd')],
        description: 'Repository, monorepo tooling, CI/CD, code signing, and store accounts.',
    },
    {
        [PRIMARY_ID]: tid(3, 1, 1), subject: 'Architecture & tech stack decisions', [PARENT_ID_COL]: parentRef(tid(3, 1), 'Project Setup'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 2, percentcomplete: 100,
        scheduledstart: '2025-11-01', scheduledend: '2025-11-05',
        estimatedeffort: 16, actualeffort: 14,
        assignedto: [personRef('Alex Chen')], tags: [tagRef('architecture'), tagRef('mobile')],
        description: 'Decide navigation library, state management, and offline-first strategy.',
    },
    {
        [PRIMARY_ID]: tid(3, 1, 2), subject: 'CI/CD pipeline for mobile', [PARENT_ID_COL]: parentRef(tid(3, 1), 'Project Setup'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 2, percentcomplete: 100,
        scheduledstart: '2025-11-06', scheduledend: '2025-11-15',
        estimatedeffort: 24, actualeffort: 24,
        assignedto: [personRef('Jordan Lee')], tags: [tagRef('ci-cd'), tagRef('mobile')],
        description: 'Automated test runs, code signing, and OTA deployment via Expo EAS.',
    },
    {
        [PRIMARY_ID]: tid(3, 2), subject: 'Core Screens', [PARENT_ID_COL]: parentRef(tid(3), 'Mobile App (iOS + Android)'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 3, percentcomplete: 50,
        scheduledstart: '2025-11-16', scheduledend: '2026-02-28',
        estimatedeffort: 300, actualeffort: 150,
        assignedto: [personRef('Alex Chen')], tags: [tagRef('mobile'), tagRef('frontend')],
        description: 'Build all primary screens following the approved design system.',
    },
    {
        [PRIMARY_ID]: tid(3, 2, 1), subject: 'Onboarding flow', [PARENT_ID_COL]: parentRef(tid(3, 2), 'Core Screens'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 3, percentcomplete: 100,
        scheduledstart: '2025-11-16', scheduledend: '2025-12-05',
        estimatedeffort: 60, actualeffort: 65,
        assignedto: [personRef('Alex Chen')], tags: [tagRef('mobile'), tagRef('ux')],
        description: 'Welcome screens, permissions, account creation, and biometric set-up.',
    },
    {
        [PRIMARY_ID]: tid(3, 2, 2), subject: 'Home dashboard', [PARENT_ID_COL]: parentRef(tid(3, 2), 'Core Screens'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 3, percentcomplete: 100,
        scheduledstart: '2025-12-06', scheduledend: '2025-12-31',
        estimatedeffort: 60, actualeffort: 60,
        assignedto: [personRef('Alex Chen')], tags: [tagRef('mobile'), tagRef('dashboard')],
        description: 'Personalised dashboard with activity feed, quick actions, and KPI tiles.',
    },
    {
        [PRIMARY_ID]: tid(3, 2, 3), subject: 'Product listing screen', [PARENT_ID_COL]: parentRef(tid(3, 2), 'Core Screens'),
        [STACK_RANK_COL]: SEED_RANKS[2], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 2, percentcomplete: 40,
        scheduledstart: '2026-01-01', scheduledend: '2026-01-31',
        estimatedeffort: 80, actualeffort: 32,
        assignedto: [personRef('Alex Chen')], tags: [tagRef('mobile'), tagRef('catalog')],
        description: 'Infinite scroll product grid with search filters and swipe gestures.',
    },
    {
        [PRIMARY_ID]: tid(3, 2, 4), subject: 'User profile screen', [PARENT_ID_COL]: parentRef(tid(3, 2), 'Core Screens'),
        [STACK_RANK_COL]: SEED_RANKS[3], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 1, percentcomplete: 0,
        scheduledstart: '2026-02-01', scheduledend: '2026-02-28',
        estimatedeffort: 40, actualeffort: 0,
        assignedto: [personRef('Alex Chen')], tags: [tagRef('mobile'), tagRef('profile')],
        description: 'Settings, notification preferences, order history, and account deletion.',
    },
    {
        [PRIMARY_ID]: tid(3, 3), subject: 'API Integration', [PARENT_ID_COL]: parentRef(tid(3), 'Mobile App (iOS + Android)'),
        [STACK_RANK_COL]: SEED_RANKS[2], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 3, percentcomplete: 40,
        scheduledstart: '2025-12-01', scheduledend: '2026-03-31',
        estimatedeffort: 160, actualeffort: 64,
        assignedto: [personRef('Maya Patel')], tags: [tagRef('mobile'), tagRef('api'), tagRef('backend')],
        description: 'Integrate mobile client with Platform v2 APIs including auth, catalog, and orders.',
    },
    {
        [PRIMARY_ID]: tid(3, 3, 1), subject: 'Authentication flows', [PARENT_ID_COL]: parentRef(tid(3, 3), 'API Integration'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 3, percentcomplete: 100,
        scheduledstart: '2025-12-01', scheduledend: '2025-12-31',
        estimatedeffort: 40, actualeffort: 38,
        assignedto: [personRef('Taylor Morgan')], tags: [tagRef('auth'), tagRef('mobile')],
        description: 'OAuth PKCE flow, biometric token storage, and session refresh logic.',
    },
    {
        [PRIMARY_ID]: tid(3, 3, 2), subject: 'Data synchronisation', [PARENT_ID_COL]: parentRef(tid(3, 3), 'API Integration'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 2, percentcomplete: 25,
        scheduledstart: '2026-01-01', scheduledend: '2026-03-31',
        estimatedeffort: 80, actualeffort: 20,
        assignedto: [personRef('Maya Patel')], tags: [tagRef('mobile'), tagRef('sync')],
        description: 'Background sync of catalog and order data with conflict resolution.',
    },
    {
        [PRIMARY_ID]: tid(3, 4), subject: 'Offline Support', [PARENT_ID_COL]: parentRef(tid(3), 'Mobile App (iOS + Android)'),
        [STACK_RANK_COL]: SEED_RANKS[3], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 2, percentcomplete: 0,
        scheduledstart: '2026-03-01', scheduledend: '2026-04-15',
        estimatedeffort: 80, actualeffort: 0,
        assignedto: [personRef('Maya Patel')], tags: [tagRef('mobile'), tagRef('offline')],
        description: 'Allow browsing and adding to cart while offline; queue mutations for replay.',
    },
    {
        [PRIMARY_ID]: tid(3, 4, 1), subject: 'Local SQLite database setup', [PARENT_ID_COL]: parentRef(tid(3, 4), 'Offline Support'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 2, percentcomplete: 0,
        scheduledstart: '2026-03-01', scheduledend: '2026-03-20',
        estimatedeffort: 40, actualeffort: 0,
        assignedto: [personRef('Maya Patel')], tags: [tagRef('mobile'), tagRef('database')],
        description: 'Schema design and migration tooling for the on-device SQLite store.',
    },
    {
        [PRIMARY_ID]: tid(3, 5), subject: 'App Store Submission', [PARENT_ID_COL]: parentRef(tid(3), 'Mobile App (iOS + Android)'),
        [STACK_RANK_COL]: SEED_RANKS[4], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 3, percentcomplete: 0,
        scheduledstart: '2026-04-16', scheduledend: '2026-04-30',
        estimatedeffort: 24, actualeffort: 0,
        assignedto: [personRef('Jordan Lee')], tags: [tagRef('mobile'), tagRef('release')],
        description: 'Prepare store listings, screenshots, privacy disclosures, and binary submission.',
    },
    {
        [PRIMARY_ID]: tid(3, 5, 1), subject: 'Apple App Store submission', [PARENT_ID_COL]: parentRef(tid(3, 5), 'App Store Submission'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 3, percentcomplete: 0,
        scheduledstart: '2026-04-16', scheduledend: '2026-04-23',
        estimatedeffort: 12, actualeffort: 0,
        assignedto: [personRef('Jordan Lee')], tags: [tagRef('ios'), tagRef('release')],
        description: 'App Store Connect setup, TestFlight beta, and production release.',
    },
    {
        [PRIMARY_ID]: tid(3, 5, 2), subject: 'Google Play Store submission', [PARENT_ID_COL]: parentRef(tid(3, 5), 'App Store Submission'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 3, percentcomplete: 0,
        scheduledstart: '2026-04-24', scheduledend: '2026-04-30',
        estimatedeffort: 8, actualeffort: 0,
        assignedto: [personRef('Jordan Lee')], tags: [tagRef('android'), tagRef('release')],
        description: 'Google Play Console setup, internal testing, and production track promotion.',
    },

    // ═════════════════════════════════════════════════════════════════════════
    // EPIC 4 — Infrastructure & DevOps
    // ═════════════════════════════════════════════════════════════════════════
    {
        [PRIMARY_ID]: tid(4), subject: 'Infrastructure & DevOps', [PARENT_ID_COL]: null,
        [STACK_RANK_COL]: SEED_RANKS[3], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 2, percentcomplete: 55,
        scheduledstart: '2025-08-01', scheduledend: '2026-02-28',
        estimatedeffort: 400, actualeffort: 220,
        assignedto: [personRef('Jordan Lee')], tags: [tagRef('devops'), tagRef('infrastructure')],
        description: 'Modernise the delivery pipeline and cloud infrastructure for the next growth phase.',
    },
    {
        [PRIMARY_ID]: tid(4, 1), subject: 'CI/CD Pipeline', [PARENT_ID_COL]: parentRef(tid(4), 'Infrastructure & DevOps'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 3, percentcomplete: 100,
        scheduledstart: '2025-08-01', scheduledend: '2025-09-30',
        estimatedeffort: 120, actualeffort: 130,
        assignedto: [personRef('Jordan Lee')], tags: [tagRef('ci-cd'), tagRef('devops')],
        description: 'End-to-end automated pipeline from commit to production deployment.',
    },
    {
        [PRIMARY_ID]: tid(4, 1, 1), subject: 'GitHub Actions workflow setup', [PARENT_ID_COL]: parentRef(tid(4, 1), 'CI/CD Pipeline'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 3, percentcomplete: 100,
        scheduledstart: '2025-08-01', scheduledend: '2025-08-20',
        estimatedeffort: 40, actualeffort: 42,
        assignedto: [personRef('Jordan Lee')], tags: [tagRef('ci-cd'), tagRef('github-actions')],
        description: 'Define reusable workflow templates for lint, test, build, and deploy stages.',
    },
    {
        [PRIMARY_ID]: tid(4, 1, 2), subject: 'Automated testing pipeline', [PARENT_ID_COL]: parentRef(tid(4, 1), 'CI/CD Pipeline'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 2, percentcomplete: 100,
        scheduledstart: '2025-08-21', scheduledend: '2025-09-10',
        estimatedeffort: 40, actualeffort: 45,
        assignedto: [personRef('Chris Kim')], tags: [tagRef('ci-cd'), tagRef('testing')],
        description: 'Unit, integration, and smoke test stages with coverage gates.',
    },
    {
        [PRIMARY_ID]: tid(4, 1, 3), subject: 'Docker containerisation', [PARENT_ID_COL]: parentRef(tid(4, 1), 'CI/CD Pipeline'),
        [STACK_RANK_COL]: SEED_RANKS[2], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 2, percentcomplete: 100,
        scheduledstart: '2025-09-11', scheduledend: '2025-09-30',
        estimatedeffort: 24, actualeffort: 25,
        assignedto: [personRef('Jordan Lee')], tags: [tagRef('docker'), tagRef('ci-cd')],
        description: 'Multi-stage Dockerfiles, image tagging strategy, and registry configuration.',
    },
    {
        [PRIMARY_ID]: tid(4, 2), subject: 'Cloud Infrastructure', [PARENT_ID_COL]: parentRef(tid(4), 'Infrastructure & DevOps'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 3, percentcomplete: 60,
        scheduledstart: '2025-10-01', scheduledend: '2025-12-31',
        estimatedeffort: 120, actualeffort: 72,
        assignedto: [personRef('Jordan Lee')], tags: [tagRef('kubernetes'), tagRef('cloud')],
        description: 'Migrate workloads to managed Kubernetes with autoscaling and blue/green deployments.',
    },
    {
        [PRIMARY_ID]: tid(4, 2, 1), subject: 'Kubernetes cluster setup', [PARENT_ID_COL]: parentRef(tid(4, 2), 'Cloud Infrastructure'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 3, percentcomplete: 100,
        scheduledstart: '2025-10-01', scheduledend: '2025-11-15',
        estimatedeffort: 80, actualeffort: 85,
        assignedto: [personRef('Jordan Lee')], tags: [tagRef('kubernetes'), tagRef('cloud')],
        description: 'EKS clusters (staging + prod), node groups, namespaces, and RBAC.',
    },
    {
        [PRIMARY_ID]: tid(4, 2, 2), subject: 'Load balancer configuration', [PARENT_ID_COL]: parentRef(tid(4, 2), 'Cloud Infrastructure'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 2, percentcomplete: 30,
        scheduledstart: '2025-11-16', scheduledend: '2025-12-31',
        estimatedeffort: 32, actualeffort: 10,
        assignedto: [personRef('Jordan Lee')], tags: [tagRef('cloud'), tagRef('networking')],
        description: 'ALB Ingress controller with SSL termination, WAF rules, and health checks.',
    },
    {
        [PRIMARY_ID]: tid(4, 3), subject: 'Monitoring & Alerting', [PARENT_ID_COL]: parentRef(tid(4), 'Infrastructure & DevOps'),
        [STACK_RANK_COL]: SEED_RANKS[2], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 2, percentcomplete: 50,
        scheduledstart: '2026-01-01', scheduledend: '2026-01-31',
        estimatedeffort: 80, actualeffort: 40,
        assignedto: [personRef('Jordan Lee')], tags: [tagRef('monitoring'), tagRef('devops')],
        description: 'Full observability stack: metrics, logs, traces, and on-call alerting.',
    },
    {
        [PRIMARY_ID]: tid(4, 3, 1), subject: 'Prometheus + Grafana dashboards', [PARENT_ID_COL]: parentRef(tid(4, 3), 'Monitoring & Alerting'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 2, percentcomplete: 70,
        scheduledstart: '2026-01-01', scheduledend: '2026-01-20',
        estimatedeffort: 48, actualeffort: 34,
        assignedto: [personRef('Jordan Lee')], tags: [tagRef('monitoring'), tagRef('grafana')],
        description: 'Dashboards for API latency, error rate, pod resource usage, and business metrics.',
    },
    {
        [PRIMARY_ID]: tid(4, 3, 2), subject: 'PagerDuty integration', [PARENT_ID_COL]: parentRef(tid(4, 3), 'Monitoring & Alerting'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 2, percentcomplete: 0,
        scheduledstart: '2026-01-21', scheduledend: '2026-01-31',
        estimatedeffort: 16, actualeffort: 0,
        assignedto: [personRef('Jordan Lee')], tags: [tagRef('alerting'), tagRef('on-call')],
        description: 'Tie Grafana alerting rules to PagerDuty with escalation policies.',
    },
    {
        [PRIMARY_ID]: tid(4, 4), subject: 'Disaster Recovery', [PARENT_ID_COL]: parentRef(tid(4), 'Infrastructure & DevOps'),
        [STACK_RANK_COL]: SEED_RANKS[3], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 2, percentcomplete: 0,
        scheduledstart: '2026-02-01', scheduledend: '2026-02-28',
        estimatedeffort: 60, actualeffort: 0,
        assignedto: [personRef('Jordan Lee')], tags: [tagRef('dr'), tagRef('backup')],
        description: 'Documented recovery playbooks, automated backups, and quarterly failover drills.',
    },
    {
        [PRIMARY_ID]: tid(4, 4, 1), subject: 'Backup strategy & automation', [PARENT_ID_COL]: parentRef(tid(4, 4), 'Disaster Recovery'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 2, percentcomplete: 0,
        scheduledstart: '2026-02-01', scheduledend: '2026-02-15',
        estimatedeffort: 32, actualeffort: 0,
        assignedto: [personRef('Jordan Lee')], tags: [tagRef('backup'), tagRef('dr')],
        description: 'Automated nightly snapshots for databases and object storage with 30-day retention.',
    },
    {
        [PRIMARY_ID]: tid(4, 4, 2), subject: 'Failover testing drill', [PARENT_ID_COL]: parentRef(tid(4, 4), 'Disaster Recovery'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 1, percentcomplete: 0,
        scheduledstart: '2026-02-16', scheduledend: '2026-02-28',
        estimatedeffort: 16, actualeffort: 0,
        assignedto: [personRef('Jordan Lee')], tags: [tagRef('dr'), tagRef('testing')],
        description: 'Simulate RDS failover and restore; measure and document RTO/RPO.',
    },

    // ═════════════════════════════════════════════════════════════════════════
    // EPIC 5 — Security & Compliance
    // ═════════════════════════════════════════════════════════════════════════
    {
        [PRIMARY_ID]: tid(5), subject: 'Security & Compliance', [PARENT_ID_COL]: null,
        [STACK_RANK_COL]: SEED_RANKS[4], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 3, percentcomplete: 35,
        scheduledstart: '2025-09-01', scheduledend: '2026-06-30',
        estimatedeffort: 360, actualeffort: 126,
        assignedto: [personRef('Taylor Morgan')], tags: [tagRef('security'), tagRef('compliance')],
        description: 'Harden the product and organisation against internal and external threats; achieve SOC 2 Type II.',
    },
    {
        [PRIMARY_ID]: tid(5, 1), subject: 'Security Audit', [PARENT_ID_COL]: parentRef(tid(5), 'Security & Compliance'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 3, percentcomplete: 100,
        scheduledstart: '2025-09-01', scheduledend: '2025-10-31',
        estimatedeffort: 80, actualeffort: 96,
        assignedto: [personRef('Taylor Morgan')], tags: [tagRef('security'), tagRef('audit')],
        description: 'Third-party security audit covering infrastructure, application, and supply chain.',
    },
    {
        [PRIMARY_ID]: tid(5, 1, 1), subject: 'OWASP vulnerability scan', [PARENT_ID_COL]: parentRef(tid(5, 1), 'Security Audit'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 3, percentcomplete: 100,
        scheduledstart: '2025-09-01', scheduledend: '2025-09-20',
        estimatedeffort: 24, actualeffort: 28,
        assignedto: [personRef('Taylor Morgan')], tags: [tagRef('security'), tagRef('owasp')],
        description: 'Automated DAST scan with OWASP ZAP; triage and log all findings.',
    },
    {
        [PRIMARY_ID]: tid(5, 1, 2), subject: 'Penetration testing', [PARENT_ID_COL]: parentRef(tid(5, 1), 'Security Audit'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 3, percentcomplete: 100,
        scheduledstart: '2025-09-21', scheduledend: '2025-10-31',
        estimatedeffort: 40, actualeffort: 50,
        assignedto: [personRef('Taylor Morgan')], tags: [tagRef('security'), tagRef('pentest')],
        description: 'Manual pen test by an external firm; remediate all critical and high findings.',
    },
    {
        [PRIMARY_ID]: tid(5, 2), subject: 'GDPR Compliance', [PARENT_ID_COL]: parentRef(tid(5), 'Security & Compliance'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 3, percentcomplete: 50,
        scheduledstart: '2025-11-01', scheduledend: '2026-02-28',
        estimatedeffort: 100, actualeffort: 50,
        assignedto: [personRef('Taylor Morgan')], tags: [tagRef('gdpr'), tagRef('compliance'), tagRef('legal')],
        description: 'Full GDPR compliance programme including data mapping, DPA, and user rights flows.',
    },
    {
        [PRIMARY_ID]: tid(5, 2, 1), subject: 'Data inventory & mapping', [PARENT_ID_COL]: parentRef(tid(5, 2), 'GDPR Compliance'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 3, percentcomplete: 100,
        scheduledstart: '2025-11-01', scheduledend: '2025-11-30',
        estimatedeffort: 32, actualeffort: 35,
        assignedto: [personRef('Taylor Morgan')], tags: [tagRef('gdpr'), tagRef('data')],
        description: 'Record of Processing Activities (RoPA) documenting all personal data flows.',
    },
    {
        [PRIMARY_ID]: tid(5, 2, 2), subject: 'Privacy policy update', [PARENT_ID_COL]: parentRef(tid(5, 2), 'GDPR Compliance'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 2, percentcomplete: 100,
        scheduledstart: '2025-12-01', scheduledend: '2025-12-20',
        estimatedeffort: 16, actualeffort: 14,
        assignedto: [personRef('Jamie Walsh')], tags: [tagRef('gdpr'), tagRef('legal')],
        description: 'Plain-language privacy policy co-authored with legal counsel.',
    },
    {
        [PRIMARY_ID]: tid(5, 2, 3), subject: 'Cookie consent implementation', [PARENT_ID_COL]: parentRef(tid(5, 2), 'GDPR Compliance'),
        [STACK_RANK_COL]: SEED_RANKS[2], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 2, percentcomplete: 25,
        scheduledstart: '2026-01-01', scheduledend: '2026-01-31',
        estimatedeffort: 24, actualeffort: 6,
        assignedto: [personRef('Alex Chen')], tags: [tagRef('gdpr'), tagRef('frontend')],
        description: 'Granular consent banner, preference centre, and server-side consent signal.',
    },
    {
        [PRIMARY_ID]: tid(5, 3), subject: 'SOC 2 Type II Certification', [PARENT_ID_COL]: parentRef(tid(5), 'Security & Compliance'),
        [STACK_RANK_COL]: SEED_RANKS[2], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 3, percentcomplete: 0,
        scheduledstart: '2026-03-01', scheduledend: '2026-06-30',
        estimatedeffort: 120, actualeffort: 0,
        assignedto: [personRef('Taylor Morgan')], tags: [tagRef('soc2'), tagRef('compliance')],
        description: 'Engage auditor, implement controls, and collect evidence for a 12-month observation period.',
    },
    {
        [PRIMARY_ID]: tid(5, 3, 1), subject: 'Controls documentation', [PARENT_ID_COL]: parentRef(tid(5, 3), 'SOC 2 Type II Certification'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 3, percentcomplete: 0,
        scheduledstart: '2026-03-01', scheduledend: '2026-04-30',
        estimatedeffort: 60, actualeffort: 0,
        assignedto: [personRef('Taylor Morgan')], tags: [tagRef('soc2'), tagRef('docs')],
        description: 'Write control narratives, policies, and evidence collection procedures.',
    },
    {
        [PRIMARY_ID]: tid(5, 4), subject: 'Access Control Review', [PARENT_ID_COL]: parentRef(tid(5), 'Security & Compliance'),
        [STACK_RANK_COL]: SEED_RANKS[3], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 2, percentcomplete: 40,
        scheduledstart: '2025-12-01', scheduledend: '2025-12-31',
        estimatedeffort: 40, actualeffort: 16,
        assignedto: [personRef('Taylor Morgan')], tags: [tagRef('security'), tagRef('access')],
        description: 'Quarterly access review: least-privilege audit, MFA enforcement, and offboarding check.',
    },
    {
        [PRIMARY_ID]: tid(5, 4, 1), subject: 'Role-based access audit', [PARENT_ID_COL]: parentRef(tid(5, 4), 'Access Control Review'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 2, percentcomplete: 100,
        scheduledstart: '2025-12-01', scheduledend: '2025-12-15',
        estimatedeffort: 24, actualeffort: 22,
        assignedto: [personRef('Taylor Morgan')], tags: [tagRef('security'), tagRef('rbac')],
        description: 'Review all IAM roles and service accounts; remove stale permissions.',
    },
    {
        [PRIMARY_ID]: tid(5, 4, 2), subject: 'MFA enforcement', [PARENT_ID_COL]: parentRef(tid(5, 4), 'Access Control Review'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 2, percentcomplete: 50,
        scheduledstart: '2025-12-16', scheduledend: '2025-12-31',
        estimatedeffort: 8, actualeffort: 4,
        assignedto: [personRef('Taylor Morgan')], tags: [tagRef('security'), tagRef('mfa')],
        description: 'Enforce TOTP MFA for all internal SSO accounts; block legacy auth.',
    },

    // ═════════════════════════════════════════════════════════════════════════
    // EPIC 6 — Documentation & Training
    // ═════════════════════════════════════════════════════════════════════════
    {
        [PRIMARY_ID]: tid(6), subject: 'Documentation & Training', [PARENT_ID_COL]: null,
        [STACK_RANK_COL]: SEED_RANKS[5], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 1, percentcomplete: 30,
        scheduledstart: '2025-10-01', scheduledend: '2026-05-31',
        estimatedeffort: 280, actualeffort: 84,
        assignedto: [personRef('Jamie Walsh')], tags: [tagRef('docs'), tagRef('training')],
        description: 'Comprehensive technical documentation and end-user training programme.',
    },
    {
        [PRIMARY_ID]: tid(6, 1), subject: 'Technical Documentation', [PARENT_ID_COL]: parentRef(tid(6), 'Documentation & Training'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 2, percentcomplete: 50,
        scheduledstart: '2025-10-01', scheduledend: '2026-01-31',
        estimatedeffort: 100, actualeffort: 50,
        assignedto: [personRef('Jamie Walsh')], tags: [tagRef('docs'), tagRef('technical')],
        description: 'Architecture guides, API references, and contributo guides for internal and external developers.',
    },
    {
        [PRIMARY_ID]: tid(6, 1, 1), subject: 'Architecture guide', [PARENT_ID_COL]: parentRef(tid(6, 1), 'Technical Documentation'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 2, percentcomplete: 100,
        scheduledstart: '2025-10-01', scheduledend: '2025-11-15',
        estimatedeffort: 30, actualeffort: 32,
        assignedto: [personRef('Maya Patel')], tags: [tagRef('docs'), tagRef('architecture')],
        description: 'System architecture, component interactions, data flow diagrams, and ADRs.',
    },
    {
        [PRIMARY_ID]: tid(6, 1, 2), subject: 'API reference docs', [PARENT_ID_COL]: parentRef(tid(6, 1), 'Technical Documentation'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 2, percentcomplete: 40,
        scheduledstart: '2025-11-16', scheduledend: '2026-01-15',
        estimatedeffort: 40, actualeffort: 16,
        assignedto: [personRef('Jamie Walsh')], tags: [tagRef('docs'), tagRef('api')],
        description: 'Auto-generated and hand-written reference for every endpoint, event, and webhook.',
    },
    {
        [PRIMARY_ID]: tid(6, 1, 3), subject: 'Code style & contribution guide', [PARENT_ID_COL]: parentRef(tid(6, 1), 'Technical Documentation'),
        [STACK_RANK_COL]: SEED_RANKS[2], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 1, percentcomplete: 0,
        scheduledstart: '2026-01-16', scheduledend: '2026-01-31',
        estimatedeffort: 16, actualeffort: 0,
        assignedto: [personRef('Alex Chen')], tags: [tagRef('docs'), tagRef('engineering')],
        description: 'ESLint config rationale, branch naming, PR template, and commit conventions.',
    },
    {
        [PRIMARY_ID]: tid(6, 2), subject: 'End-user Guides', [PARENT_ID_COL]: parentRef(tid(6), 'Documentation & Training'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 2, percentcomplete: 35,
        scheduledstart: '2025-12-01', scheduledend: '2026-03-31',
        estimatedeffort: 80, actualeffort: 28,
        assignedto: [personRef('Jamie Walsh')], tags: [tagRef('docs'), tagRef('user-guide')],
        description: 'Step-by-step guides for all major user journeys targeting non-technical audiences.',
    },
    {
        [PRIMARY_ID]: tid(6, 2, 1), subject: 'Getting started tutorial', [PARENT_ID_COL]: parentRef(tid(6, 2), 'End-user Guides'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 2, percentcomplete: 100,
        scheduledstart: '2025-12-01', scheduledend: '2025-12-20',
        estimatedeffort: 24, actualeffort: 26,
        assignedto: [personRef('Jamie Walsh')], tags: [tagRef('docs'), tagRef('onboarding')],
        description: 'Five-minute quickstart guiding a new user to their first successful action.',
    },
    {
        [PRIMARY_ID]: tid(6, 2, 2), subject: 'FAQ & troubleshooting guide', [PARENT_ID_COL]: parentRef(tid(6, 2), 'End-user Guides'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 1,
        statuscode: 3, priority: 1, percentcomplete: 20,
        scheduledstart: '2026-01-01', scheduledend: '2026-02-15',
        estimatedeffort: 24, actualeffort: 5,
        assignedto: [personRef('Jamie Walsh')], tags: [tagRef('docs'), tagRef('support')],
        description: 'Curated FAQ derived from support tickets; updated monthly.',
    },
    {
        [PRIMARY_ID]: tid(6, 2, 3), subject: 'Advanced features guide', [PARENT_ID_COL]: parentRef(tid(6, 2), 'End-user Guides'),
        [STACK_RANK_COL]: SEED_RANKS[2], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 1, percentcomplete: 0,
        scheduledstart: '2026-02-16', scheduledend: '2026-03-31',
        estimatedeffort: 32, actualeffort: 0,
        assignedto: [personRef('Jamie Walsh')], tags: [tagRef('docs'), tagRef('advanced')],
        description: 'Deep-dive guides for power users covering workflows, integrations, and automation.',
    },
    {
        [PRIMARY_ID]: tid(6, 3), subject: 'Training Programme', [PARENT_ID_COL]: parentRef(tid(6), 'Documentation & Training'),
        [STACK_RANK_COL]: SEED_RANKS[2], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 1, percentcomplete: 0,
        scheduledstart: '2026-03-01', scheduledend: '2026-05-31',
        estimatedeffort: 80, actualeffort: 0,
        assignedto: [personRef('Jamie Walsh')], tags: [tagRef('training')],
        description: 'Blended learning programme with videos, live workshops, and assessment quizzes.',
    },
    {
        [PRIMARY_ID]: tid(6, 3, 1), subject: 'Video tutorials', [PARENT_ID_COL]: parentRef(tid(6, 3), 'Training Programme'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 1, percentcomplete: 0,
        scheduledstart: '2026-03-01', scheduledend: '2026-04-15',
        estimatedeffort: 40, actualeffort: 0,
        assignedto: [personRef('Jamie Walsh')], tags: [tagRef('training'), tagRef('video')],
        description: 'Ten short-form screencasts covering the most common tasks.',
    },
    {
        [PRIMARY_ID]: tid(6, 3, 2), subject: 'Interactive workshops', [PARENT_ID_COL]: parentRef(tid(6, 3), 'Training Programme'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 1, percentcomplete: 0,
        scheduledstart: '2026-04-16', scheduledend: '2026-05-15',
        estimatedeffort: 24, actualeffort: 0,
        assignedto: [personRef('Jamie Walsh')], tags: [tagRef('training'), tagRef('workshop')],
        description: 'Two-hour hands-on sessions for customer success and partner teams.',
    },
    {
        [PRIMARY_ID]: tid(6, 3, 3), subject: 'Assessment quizzes', [PARENT_ID_COL]: parentRef(tid(6, 3), 'Training Programme'),
        [STACK_RANK_COL]: SEED_RANKS[2], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 0, percentcomplete: 0,
        scheduledstart: '2026-05-16', scheduledend: '2026-05-31',
        estimatedeffort: 8, actualeffort: 0,
        assignedto: [personRef('Jamie Walsh')], tags: [tagRef('training'), tagRef('assessment')],
        description: 'Online quizzes with certificates of completion for each learning module.',
    },
    {
        [PRIMARY_ID]: tid(6, 4), subject: 'Localisation', [PARENT_ID_COL]: parentRef(tid(6), 'Documentation & Training'),
        [STACK_RANK_COL]: SEED_RANKS[3], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 0, percentcomplete: 0,
        scheduledstart: '2026-04-01', scheduledend: '2026-05-31',
        estimatedeffort: 40, actualeffort: 0,
        assignedto: [personRef('Jamie Walsh')], tags: [tagRef('i18n'), tagRef('docs')],
        description: 'Translate key user guides and in-app strings into Spanish and French.',
    },
    {
        [PRIMARY_ID]: tid(6, 4, 1), subject: 'Spanish translation', [PARENT_ID_COL]: parentRef(tid(6, 4), 'Localisation'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 0, percentcomplete: 0,
        scheduledstart: '2026-04-01', scheduledend: '2026-04-30',
        estimatedeffort: 20, actualeffort: 0,
        assignedto: [personRef('Jamie Walsh')], tags: [tagRef('i18n'), tagRef('spanish')],
        description: 'Professional translation of getting-started guide and UI strings.',
    },
    {
        [PRIMARY_ID]: tid(6, 4, 2), subject: 'French translation', [PARENT_ID_COL]: parentRef(tid(6, 4), 'Localisation'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 0, percentcomplete: 0,
        scheduledstart: '2026-05-01', scheduledend: '2026-05-31',
        estimatedeffort: 20, actualeffort: 0,
        assignedto: [personRef('Jamie Walsh')], tags: [tagRef('i18n'), tagRef('french')],
        description: 'Professional translation of getting-started guide and UI strings.',
    },

    // ═════════════════════════════════════════════════════════════════════════
    // EPIC 7 — Analytics & Reporting
    // ═════════════════════════════════════════════════════════════════════════
    {
        [PRIMARY_ID]: tid(7), subject: 'Analytics & Reporting', [PARENT_ID_COL]: null,
        [STACK_RANK_COL]: SEED_RANKS[6], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 2, percentcomplete: 25,
        scheduledstart: '2026-01-01', scheduledend: '2026-06-30',
        estimatedeffort: 350, actualeffort: 88,
        assignedto: [personRef('Riley Thompson')], tags: [tagRef('analytics'), tagRef('data')],
        description: 'Build a centralised analytics platform powering executive dashboards, operational reports, and ML forecasting.',
    },
    {
        [PRIMARY_ID]: tid(7, 1), subject: 'Data Pipeline', [PARENT_ID_COL]: parentRef(tid(7), 'Analytics & Reporting'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 3, percentcomplete: 50,
        scheduledstart: '2026-01-01', scheduledend: '2026-03-31',
        estimatedeffort: 120, actualeffort: 60,
        assignedto: [personRef('Riley Thompson')], tags: [tagRef('data'), tagRef('pipeline'), tagRef('etl')],
        description: 'Ingestion layer from all product databases and third-party tools into a centralised data warehouse.',
    },
    {
        [PRIMARY_ID]: tid(7, 1, 1), subject: 'ETL pipeline setup', [PARENT_ID_COL]: parentRef(tid(7, 1), 'Data Pipeline'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 1,
        statuscode: 5, priority: 3, percentcomplete: 100,
        scheduledstart: '2026-01-01', scheduledend: '2026-02-15',
        estimatedeffort: 60, actualeffort: 65,
        assignedto: [personRef('Riley Thompson')], tags: [tagRef('etl'), tagRef('data')],
        description: 'Apache Airflow DAGs for daily extraction from Postgres, Stripe, and Mixpanel.',
    },
    {
        [PRIMARY_ID]: tid(7, 1, 2), subject: 'Data warehouse schema design', [PARENT_ID_COL]: parentRef(tid(7, 1), 'Data Pipeline'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 2, percentcomplete: 30,
        scheduledstart: '2026-02-16', scheduledend: '2026-03-31',
        estimatedeffort: 40, actualeffort: 12,
        assignedto: [personRef('Riley Thompson')], tags: [tagRef('data'), tagRef('warehouse')],
        description: 'Star schema design in Snowflake covering orders, users, events, and financials.',
    },
    {
        [PRIMARY_ID]: tid(7, 2), subject: 'Dashboards', [PARENT_ID_COL]: parentRef(tid(7), 'Analytics & Reporting'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 2, percentcomplete: 20,
        scheduledstart: '2026-03-01', scheduledend: '2026-05-31',
        estimatedeffort: 130, actualeffort: 26,
        assignedto: [personRef('Riley Thompson')], tags: [tagRef('analytics'), tagRef('dashboard')],
        description: 'Self-service dashboards in Metabase for exec, sales, and ops purposes.',
    },
    {
        [PRIMARY_ID]: tid(7, 2, 1), subject: 'Executive overview dashboard', [PARENT_ID_COL]: parentRef(tid(7, 2), 'Dashboards'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 0,
        statuscode: 2, priority: 2, percentcomplete: 30,
        scheduledstart: '2026-03-01', scheduledend: '2026-04-15',
        estimatedeffort: 50, actualeffort: 15,
        assignedto: [personRef('Riley Thompson')], tags: [tagRef('analytics'), tagRef('executive')],
        description: 'Revenue, MRR, churn, NPS, and headcount at a glance.',
    },
    {
        [PRIMARY_ID]: tid(7, 2, 2), subject: 'Sales metrics dashboard', [PARENT_ID_COL]: parentRef(tid(7, 2), 'Dashboards'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 1, percentcomplete: 0,
        scheduledstart: '2026-04-16', scheduledend: '2026-05-15',
        estimatedeffort: 40, actualeffort: 0,
        assignedto: [personRef('Riley Thompson')], tags: [tagRef('analytics'), tagRef('sales')],
        description: 'Pipeline value, conversion rates, rep leaderboard, and quota attainment.',
    },
    {
        [PRIMARY_ID]: tid(7, 2, 3), subject: 'Operational KPIs dashboard', [PARENT_ID_COL]: parentRef(tid(7, 2), 'Dashboards'),
        [STACK_RANK_COL]: SEED_RANKS[2], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 1, percentcomplete: 0,
        scheduledstart: '2026-05-16', scheduledend: '2026-05-31',
        estimatedeffort: 32, actualeffort: 0,
        assignedto: [personRef('Riley Thompson')], tags: [tagRef('analytics'), tagRef('ops')],
        description: 'Support ticket volume, resolution time, and incident MTTR.',
    },
    {
        [PRIMARY_ID]: tid(7, 3), subject: 'Custom Reports', [PARENT_ID_COL]: parentRef(tid(7), 'Analytics & Reporting'),
        [STACK_RANK_COL]: SEED_RANKS[2], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 1, percentcomplete: 0,
        scheduledstart: '2026-05-01', scheduledend: '2026-06-15',
        estimatedeffort: 60, actualeffort: 0,
        assignedto: [personRef('Riley Thompson')], tags: [tagRef('analytics'), tagRef('reports')],
        description: 'No-code report builder and scheduled PDF/CSV exports for non-analyst users.',
    },
    {
        [PRIMARY_ID]: tid(7, 3, 1), subject: 'Report builder UI', [PARENT_ID_COL]: parentRef(tid(7, 3), 'Custom Reports'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 1, percentcomplete: 0,
        scheduledstart: '2026-05-01', scheduledend: '2026-05-31',
        estimatedeffort: 40, actualeffort: 0,
        assignedto: [personRef('Alex Chen')], tags: [tagRef('frontend'), tagRef('analytics')],
        description: 'Drag-and-drop query builder with chart types, filters, and calculated fields.',
    },
    {
        [PRIMARY_ID]: tid(7, 3, 2), subject: 'Scheduled exports', [PARENT_ID_COL]: parentRef(tid(7, 3), 'Custom Reports'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 1, percentcomplete: 0,
        scheduledstart: '2026-06-01', scheduledend: '2026-06-15',
        estimatedeffort: 16, actualeffort: 0,
        assignedto: [personRef('Riley Thompson')], tags: [tagRef('analytics'), tagRef('automation')],
        description: 'Cron-driven email delivery of report snapshots in PDF and CSV formats.',
    },
    {
        [PRIMARY_ID]: tid(7, 4), subject: 'ML & Forecasting', [PARENT_ID_COL]: parentRef(tid(7), 'Analytics & Reporting'),
        [STACK_RANK_COL]: SEED_RANKS[3], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 2, percentcomplete: 0,
        scheduledstart: '2026-06-01', scheduledend: '2026-06-30',
        estimatedeffort: 80, actualeffort: 0,
        assignedto: [personRef('Riley Thompson')], tags: [tagRef('ml'), tagRef('analytics'), tagRef('forecasting')],
        description: 'Predictive models for demand forecasting and customer churn embedded in dashboards.',
    },
    {
        [PRIMARY_ID]: tid(7, 4, 1), subject: 'Demand forecasting model', [PARENT_ID_COL]: parentRef(tid(7, 4), 'ML & Forecasting'),
        [STACK_RANK_COL]: SEED_RANKS[0], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 2, percentcomplete: 0,
        scheduledstart: '2026-06-01', scheduledend: '2026-06-20',
        estimatedeffort: 48, actualeffort: 0,
        assignedto: [personRef('Riley Thompson')], tags: [tagRef('ml'), tagRef('forecasting')],
        description: 'Time-series model (Prophet or LSTM) predicting monthly order volumes by category.',
    },
    {
        [PRIMARY_ID]: tid(7, 4, 2), subject: 'Churn prediction model', [PARENT_ID_COL]: parentRef(tid(7, 4), 'ML & Forecasting'),
        [STACK_RANK_COL]: SEED_RANKS[1], [STATE_CODE_COL]: 0,
        statuscode: 1, priority: 2, percentcomplete: 0,
        scheduledstart: '2026-06-21', scheduledend: '2026-06-30',
        estimatedeffort: 32, actualeffort: 0,
        assignedto: [personRef('Riley Thompson')], tags: [tagRef('ml'), tagRef('churn')],
        description: 'Binary classifier on user engagement signals; scores surfaced in the exec dashboard.',
    },
];

/**
 * Rolls every parent's effort up from its children, bottom up, so the seed is consistent with the rule
 * the docs demonstrate: a task with children does not own an estimate, it owns the sum of its subtree.
 * Leaves keep the values written above.
 */
const rollUpEfforts = (columnNames: string[]) => {
    const childrenByParent = new Map<string, IRawRecord[]>();
    for (const task of TASKS) {
        const parentId = (task[PARENT_ID_COL] as { id: { guid: string } }[] | null)?.[0]?.id?.guid;
        if (!parentId) {
            continue;
        }
        childrenByParent.set(parentId, [...(childrenByParent.get(parentId) ?? []), task]);
    }

    const sumSubtree = (task: IRawRecord, columnName: string): number => {
        const children = childrenByParent.get(task[PRIMARY_ID] as string) ?? [];
        if (children.length === 0) {
            return Number(task[columnName] ?? 0);
        }
        const total = children.reduce((sum, child) => sum + sumSubtree(child, columnName), 0);
        task[columnName] = total;
        return total;
    };

    for (const task of TASKS) {
        //start from the roots so every level is written on the way back up
        if (task[PARENT_ID_COL]) {
            continue;
        }
        for (const columnName of columnNames) {
            sumSubtree(task, columnName);
        }
    }
};

rollUpEfforts(['estimatedeffort', 'actualeffort']);

// ─── Task dependencies ────────────────────────────────────────────────────────

/**
 * The dependencies inside Epic 1, covering all four dependency types. `Frontend Development` and
 * `Launch & QA` each sit on both ends of one, so the cell has something to show in either direction.
 */
export const TASK_DEPENDENCIES: ITaskDependency[] = [
    { id: 'dep-01', predecessorTaskId: tid(1, 1), successorTaskId: tid(1, 2), type: 'finishToStart' },
    { id: 'dep-02', predecessorTaskId: tid(1, 2), successorTaskId: tid(1, 3), type: 'finishToStart' },
    { id: 'dep-03', predecessorTaskId: tid(1, 3), successorTaskId: tid(1, 4), type: 'startToStart' },
    { id: 'dep-04', predecessorTaskId: tid(1, 4), successorTaskId: tid(1, 5), type: 'finishToFinish' },
    { id: 'dep-05', predecessorTaskId: tid(1, 3), successorTaskId: tid(1, 5), type: 'startToFinish' },
];

// ─── Sources consumed by the memory descriptor ────────────────────────────────
// The strategy deep-clones these on init, so the fixtures below are never mutated.

// ─── Task checklists ──────────────────────────────────────────────────────────

/**
 * A checklist on three of Epic 1's children, covering what the cell can show: partly done, nothing done
 * yet, and one finished outright so the green state is on screen too.
 */
/**
 * The three the docs point at by name, with the counts the Checklist story quotes — part-way, not started
 * and finished. Everything else is derived below, so these stay hand-written.
 */
const NAMED_CHECKLIST_ITEMS: Record<string, IChecklistItem[]> = {
    [tid(1, 1)]: [
        { id: 'chk-01', name: 'Book the stakeholder slots', isCompleted: true },
        { id: 'chk-02', name: 'Write the interview guide', isCompleted: true },
        { id: 'chk-03', name: 'Summarise the findings', isCompleted: false },
    ],
    [tid(1, 2)]: [
        { id: 'chk-04', name: 'Agree the colour palette', isCompleted: false },
        { id: 'chk-05', name: 'Pick the type scale', isCompleted: false },
    ],
    [tid(1, 4)]: [
        { id: 'chk-06', name: 'Inventory the old pages', isCompleted: true },
        { id: 'chk-07', name: 'Map the redirects', isCompleted: true },
    ],
};

/** The steps a derived checklist is built from — generic enough to read sensibly under any task. */
const CHECKLIST_STEPS = [
    'Agree the scope',
    'Draft the approach',
    'Review with the team',
    'Hand over the outcome',
];

/**
 * A checklist on most of the other tasks, so the column has something to show wherever it appears rather
 * than only under *Website Redesign* — while leaving every third task without one, because a blank cell is
 * a state worth seeing too.
 *
 * How many items are ticked follows the task's own `percentcomplete`, so a row's checklist and its progress
 * bar never disagree. Derived from the records rather than written out, so it keeps up as the fixture grows.
 */
const DERIVED_CHECKLIST_ITEMS: Record<string, IChecklistItem[]> = {};
TASKS.forEach((task, taskIndex) => {
    const taskId = task[PRIMARY_ID] as string;
    if (NAMED_CHECKLIST_ITEMS[taskId] || taskIndex % 3 === 2) {
        return;
    }
    //two to four steps, varied by position so neighbouring rows do not all look the same
    const total = 2 + (taskIndex % 3);
    const percentComplete = (task.percentcomplete as number) ?? 0;
    const completed = Math.round((percentComplete / 100) * total);
    DERIVED_CHECKLIST_ITEMS[taskId] = CHECKLIST_STEPS.slice(0, total).map((name, index) => ({
        id: `chk-${taskId}-${index + 1}`,
        name: name,
        isCompleted: index < completed,
    }));
});

export const CHECKLIST_ITEMS: Record<string, IChecklistItem[]> = { ...NAMED_CHECKLIST_ITEMS, ...DERIVED_CHECKLIST_ITEMS };

export const TASK_SOURCE: IMemoryEntitySource = {
    records: TASKS,
    columns: COLUMNS,
    metadata: ENTITY_METADATA,
};

export const TEMPLATE_SOURCE: IMemoryTemplateSource = {
    records: SAMPLE_TEMPLATES,
    columns: TEMPLATE_COLUMNS,
    metadata: TEMPLATE_METADATA,
    children: TEMPLATE_CHILDREN,
};
