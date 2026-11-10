import { defineLabels } from "@labels";

export const LINKS_LABELS = defineLabels({
    'links.confirmDeleteLink': 'Delete the dependency {{ predecessor }} → {{ successor }}?',
    /** Follows a task's name while a link is drawn from or to its start. */
    'links.linkStart': ' (start)',
    /** Follows a task's name while a link is drawn from or to its end. */
    'links.linkEnd': ' (end)',
    'links.predecessor': 'Predecessor',
    'links.successor': 'Successor',
    'links.finishToStart': 'Finish to start',
    'links.startToStart': 'Start to start',
    'links.finishToFinish': 'Finish to finish',
    'links.startToFinish': 'Start to finish',
    /** Why a link being drawn would be refused. */
    'links.refusedSelf': 'A task cannot depend on itself.',
    'links.refusedDuplicate': 'These tasks are already linked.',
    'links.refusedCycle': 'This link would make a loop.',
    'links.refusedSaving': 'Wait until these tasks are saved.',
    'links.refused': 'This link cannot be drawn.',
});
