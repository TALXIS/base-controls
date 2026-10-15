import dayjs from 'dayjs'
import { IRawRecord } from '@talxis/client-libraries'
import { LexoRank } from 'lexorank'
import { PEOPLE, personRef } from './memoryLookupManyData'
import { ENTITY_NAME, PARENT_ID_COL, PRIMARY_ID, STACK_RANK_COL, STATE_CODE_COL } from './memoryTaskData'

//the most children a task at each depth may get
const MAX_CHILDREN_PER_LEVEL = [8, 6, 5, 4, 4, 3, 3]
const FIRST_START = dayjs('2026-01-01')

const getChildCount = (index: number, level: number) => {
    const max = MAX_CHILDREN_PER_LEVEL[level] ?? 0
    return (Math.imul(index + 1, 2654435761) >>> 0) % (max + 1)
}

const createTask = (index: number, outline: string, parent: IRawRecord | null, rank: LexoRank): IRawRecord => {
    const statuscode = index % 6 + 1
    const start = FIRST_START.add(index % 365, 'day')
    return {
        [PRIMARY_ID]: `${index.toString().padStart(8, '0')}-0000-0000-0000-000000000000`,
        subject: `Task ${outline}`,
        [PARENT_ID_COL]: parent ? [{ id: { guid: parent[PRIMARY_ID] }, etn: ENTITY_NAME, name: parent.subject }] : null,
        [STACK_RANK_COL]: rank.format(),
        [STATE_CODE_COL]: statuscode >= 5 ? 1 : 0,
        statuscode,
        priority: index % 4,
        percentcomplete: statuscode === 5 ? 100 : index * 7 % 100,
        scheduledstart: start.format('YYYY-MM-DD'),
        scheduledend: start.add(index % 30 + 1, 'day').format('YYYY-MM-DD'),
        estimatedeffort: index % 40 + 8,
        actualeffort: index % 32,
        assignedto: [personRef(PEOPLE[index % PEOPLE.length].name as string)],
        description: `Generated task ${index + 1}.`,
    }
}

/** Builds a deterministic tree of `count` tasks up to eight levels deep, with uneven branching. */
export const createStressTasks = (count: number): IRawRecord[] => {
    const tasks: IRawRecord[] = []

    const addChildren = (parent: IRawRecord, outline: string, level: number) => {
        let rank = LexoRank.middle()
        const childCount = getChildCount(tasks.length, level)
        for (let i = 1; i <= childCount && tasks.length < count; i++) {
            const task = createTask(tasks.length, `${outline}.${i}`, parent, rank)
            tasks.push(task)
            addChildren(task, `${outline}.${i}`, level + 1)
            rank = rank.genNext()
        }
    }

    let rank = LexoRank.middle()
    for (let i = 1; tasks.length < count; i++) {
        const root = createTask(tasks.length, `${i}`, null, rank)
        tasks.push(root)
        addChildren(root, `${i}`, 0)
        rank = rank.genNext()
    }
    return tasks
}
