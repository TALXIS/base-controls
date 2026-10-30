import { defineLabels } from "@utils";

export const GANTT_LINKS_LABELS = defineLabels({
    'ganttLinks.confirmDeleteLink': 'Delete this dependency?',
    /** Follows a task's name while a link is drawn from or to its start. */
    'ganttLinks.linkStart': ' (start)',
    /** Follows a task's name while a link is drawn from or to its end. */
    'ganttLinks.linkEnd': ' (end)',
});
