import { defineLabels } from "@utils";

/** The strings of the dependencies module. */
export const DEPENDENCIES_LABELS = defineLabels({
    'dependencies.predecessors': 'Predecessors',
    'dependencies.successors': 'Successors',
    'dependencies.creatingDependency': 'Creating dependency...',
    'dependencies.savingDependency': 'Saving dependency...',
    'dependencies.deletingDependency': 'Deleting dependency...',
    /** Titles the dialog a write of a dependency failed with. */
    'dependencies.dependenciesFailed': 'The dependency could not be saved.',
    'dependencies.loadDependenciesFailed': 'The dependencies could not be loaded.',
});
