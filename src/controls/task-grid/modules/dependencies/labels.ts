/** The strings of the dependencies module. */
export interface IDependenciesLabels {
    predecessors: string;
    successors: string;
    /** Titles the dialog a load or write of dependencies failed with. */
    dependenciesFailed: string;
}

/** The English defaults for {@link IDependenciesLabels}. */
export const DEPENDENCIES_LABELS: IDependenciesLabels = {
    predecessors: 'Predecessors',
    successors: 'Successors',
    dependenciesFailed: 'The dependency could not be saved.',
};
