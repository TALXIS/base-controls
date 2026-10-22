/** The strings of the templates module. */
export interface ITemplatesLabels {
    /** New › the plain task, beside the templates. */
    task: string;
    fromTemplate: string;
    saveAsTemplate: string;
    searchTemplates: string;
    noTemplates: string;
    /** Titles the dialog an operation on a template failed with. */
    templatesFailed: string;
}

/** The English defaults for {@link ITemplatesLabels}. */
export const TEMPLATES_LABELS: ITemplatesLabels = {
    task: 'Task',
    fromTemplate: 'From template',
    saveAsTemplate: 'Save as template',
    searchTemplates: 'Search templates',
    noTemplates: 'No templates found',
    templatesFailed: 'The template could not be used.',
};
