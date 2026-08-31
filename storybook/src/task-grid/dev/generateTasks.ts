import { faker } from '@faker-js/faker';
import { LexoRank } from 'lexorank';
import type { IRawRecord } from '@talxis/client-libraries';
import { PEOPLE, TAGS, personRef, tagRef } from '../memoryLookupManyData';
import { ENTITY_NAME, PARENT_ID_COL, PRIMARY_ID, STACK_RANK_COL, STATE_CODE_COL, SUBJECT_COL } from '../memoryTaskData';

/**
 * Status codes from the `statuscode` option set in {@link ../memoryTaskData}. The two terminal ones
 * also flip `statecode`, which is what the *Hide inactive tasks* toggle reads.
 */
const STATUS_NOT_STARTED = 1;
const STATUS_IN_PROGRESS = 2;
const STATUS_WAITING = 3;
const STATUS_DEFERRED = 4;
const STATUS_COMPLETED = 5;
const STATUS_CANCELLED = 6;
const TERMINAL_STATUSES = [STATUS_COMPLETED, STATUS_CANCELLED];

/**
 * Measured yield of one epic's subtree at the fan-out below: the epic, ~5.6 children, and ~18 of their
 * children. Picks the starting number of epics; the generator tops up if it still runs short.
 */
const TASKS_PER_EPIC = 25;

const PEOPLE_NAMES = PEOPLE.map(person => person.name as string);
const TAG_NAMES = TAGS.map(tag => tag.name as string);

export interface IGenerateTasksOptions {
    /** Total number of task records to produce. */
    count: number;
    /**
     * Seeds faker, so the same count always produces the same dataset. Keeping it fixed is what makes
     * a measurement on this story comparable between runs.
     */
    seed?: number;
}

/** A task's own id plus what its children need to point at it. */
interface INode {
    id: string;
    subject: string;
    depth: number;
}

const devId = (index: number): string =>
    `dev${index.toString().padStart(5, '0')}-0000-4000-8000-${index.toString().padStart(12, '0')}`;

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

const subjectForDepth = (depth: number): string => {
    switch (depth) {
        //epics read like programmes of work, leaves like individual pieces of work
        case 0: return capitalize(faker.company.buzzPhrase());
        case 1: return capitalize(`${faker.hacker.verb()} ${faker.hacker.noun()}`);
        default: return capitalize(`${faker.hacker.verb()} the ${faker.hacker.adjective()} ${faker.hacker.noun()}`);
    }
};

/**
 * Generates a hierarchy of task records in the same shape as the hand-written fixtures — three levels
 * deep, lookup values pointing at the existing people and tag entities, and one comparable LexoRank per
 * sibling group.
 *
 * Ranks are generated per parent with `genNext`, so every sibling group is ordered and gaps stay wide
 * enough for a drag to land between two rows.
 */
export const generateTasks = (options: IGenerateTasksOptions): IRawRecord[] => {
    const { count, seed = 42 } = options;
    faker.seed(seed);

    const records: IRawRecord[] = [];
    //one running rank per parent id ('' for the top level), so siblings stay in insertion order
    const ranksByParent = new Map<string, LexoRank>();

    const nextRank = (parentId: string): string => {
        const previous = ranksByParent.get(parentId);
        const rank = previous ? previous.genNext() : LexoRank.middle();
        ranksByParent.set(parentId, rank);
        return rank.format();
    };

    const push = (parent: INode | undefined, depth: number): INode => {
        const index = records.length;
        const id = devId(index);
        const subject = subjectForDepth(depth);
        const statuscode = faker.helpers.arrayElement([
            STATUS_NOT_STARTED, STATUS_IN_PROGRESS, STATUS_IN_PROGRESS, STATUS_WAITING,
            STATUS_DEFERRED, STATUS_COMPLETED, STATUS_COMPLETED, STATUS_CANCELLED,
        ]);
        const isTerminal = TERMINAL_STATUSES.includes(statuscode);
        const start = faker.date.between({ from: '2025-06-01', to: '2026-09-30' });
        const end = faker.date.soon({ days: faker.number.int({ min: 3, max: 90 }), refDate: start });
        const estimatedeffort = faker.number.int({ min: 1, max: depth === 0 ? 480 : 80 });

        records.push({
            [PRIMARY_ID]: id,
            [SUBJECT_COL]: subject,
            [PARENT_ID_COL]: parent ? [{ id: { guid: parent.id }, etn: ENTITY_NAME, name: parent.subject }] : null,
            [STACK_RANK_COL]: nextRank(parent?.id ?? ''),
            [STATE_CODE_COL]: isTerminal ? 1 : 0,
            statuscode,
            priority: faker.helpers.arrayElement([0, 1, 1, 2, 2, 3]),
            percentcomplete: statuscode === STATUS_COMPLETED ? 100
                : statuscode === STATUS_NOT_STARTED ? 0
                : faker.number.int({ min: 5, max: 95 }),
            scheduledstart: start.toISOString().slice(0, 10),
            scheduledend: end.toISOString().slice(0, 10),
            estimatedeffort,
            actualeffort: isTerminal ? estimatedeffort + faker.number.int({ min: -10, max: 20 }) : faker.number.int({ min: 0, max: estimatedeffort }),
            description: faker.lorem.sentence(),
            assignedto: faker.helpers.arrayElements(PEOPLE_NAMES, faker.number.int({ min: 1, max: 2 })).map(personRef),
            tags: faker.helpers.arrayElements(TAG_NAMES, faker.number.int({ min: 0, max: 3 })).map(tagRef),
        });

        return { id, subject, depth };
    };

    //breadth-first: every epic, then every epic's children, then theirs - so a dataset that runs out at
    //`count` is a balanced tree rather than one very deep first branch. Whenever the frontier empties
    //before the count is met another batch of epics is added, so any count is reachable at this depth.
    const epicBatch = Math.max(1, Math.ceil(count / TASKS_PER_EPIC));
    let queue: INode[] = [];

    while (records.length < count) {
        if (queue.length === 0) {
            for (let i = 0; i < epicBatch && records.length < count; i++) {
                queue.push(push(undefined, 0));
            }
            continue;
        }
        const next: INode[] = [];
        for (const parent of queue) {
            if (records.length >= count) {
                break;
            }
            //leaves stop at depth 2, so the tree stays three levels like the hand-written fixtures
            const childCount = parent.depth === 0
                ? faker.number.int({ min: 4, max: 12 })
                : faker.number.int({ min: 0, max: 10 });
            for (let i = 0; i < childCount && records.length < count; i++) {
                const child = push(parent, parent.depth + 1);
                if (child.depth < 2) {
                    next.push(child);
                }
            }
        }
        queue = next;
    }

    return records;
};
