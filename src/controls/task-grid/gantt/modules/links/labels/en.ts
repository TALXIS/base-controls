import { defineLabels } from "@labels";

export const LINKS_LABELS = defineLabels({
    'links.confirmDeleteLink': 'Delete this dependency?',
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
});
