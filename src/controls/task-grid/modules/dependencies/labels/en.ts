import { defineLabels } from "@labels";

/** The strings of the dependencies module. */
export const DEPENDENCIES_LABELS = defineLabels({
    'dependencies.predecessors': 'Predecessors',
    'dependencies.successors': 'Successors',
    /** Titles the dialog a write of a dependency failed with. */
    'dependencies.dependenciesFailed': 'The dependency could not be saved.',
    'dependencies.loadDependenciesFailed': 'The dependencies could not be loaded.',
});
