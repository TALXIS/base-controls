/** The strings of the dependencies module. */
export interface IDependenciesLabels {
    predecessors: string;
    successors: string;
    creatingDependency: string;
    savingDependency: string;
    deletingDependency: string;
    /** Titles the dialog a write of a dependency failed with. */
    dependenciesFailed: string;
    loadDependenciesFailed: string;
}

/** The English defaults for {@link IDependenciesLabels}. */
export const DEPENDENCIES_LABELS: IDependenciesLabels = {
    predecessors: 'Predecessors',
    successors: 'Successors',
    creatingDependency: 'Creating dependency...',
    savingDependency: 'Saving dependency...',
    deletingDependency: 'Deleting dependency...',
    dependenciesFailed: 'The dependency could not be saved.',
    loadDependenciesFailed: 'The dependencies could not be loaded.',
};
