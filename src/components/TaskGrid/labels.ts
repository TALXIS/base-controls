import { Liquid } from "liquidjs";

export interface ITaskGridLabels {
    name: string;
    no: string;
    yes: string;
    ok: string;
    confirm: string;
    confirmation: string;
    myViews: string;
    systemViews: string;
    saveAsNew: string;
    saveExisting: string;
    manageViews: string;
    deleteView: string;
    cancel: string;
    save: string;
    loading: string;
    reordering: string;
    search: string;
    editColumns: string;
    allTasks: string;
    new: string;
    bulkEdit: string;
    settings: string;
    'reorderingTaskDialog.text.children': string;
    'reorderingTaskDialog.text.above': string;
    'reorderingTaskDialog.text.below': string;
    'reorderingTaskTemplateDialog.text.children': string;
    'reorderingTaskTemplateDialog.text.topLevel': string;
    'reorderingTaskDialog.manyChildrenWarning': string;
    creatingTemplateFromTasks: string;
    creatingTasksFromTemplate: string;
    templateCreatedSuccessfully: string;
    description: string;
    noTaskTemplates: string;
    addChild: string;
    addCustomColumn: string;
    confirmColumnDelete: string;
    confirmColumnEdit: string;
    loadingTemplates: string;
    taskFromTemplate: string;
    templateFromTask: string;
    loadingMilestones: string;
    chooseExisting: string;
    noMilestones: string;
    loadingContracts: string;
    createFromContract: string;
    noContracts: string;
    createManually: string;
    newRecord: string;
    filterByKeyword: string;
    deleteSelected: string;
    showHierarchy: string;
    'confirmDialog.deleteSelectedRows.text': string;
    topLevel: string;
    canNotDeleteCompleted: string;
    canNotDeletedRecordsWithChild: string;
    canNotEditCompletedTask: string;
    selectMaximumOneTask: string;
    hideInactiveTasks: string;
    successfulOperationDialogTitle: string;
    warningDialogTitle: string;
    informationDialogTitle: string;
    couldNotFindRecord: string;
    wrongBaseRecord: string;
    fillRecordId: string;
    fillEntityName: string;
    fillFetchXml: string;
    myTemplates: string;
    publicTemplates: string;
    updatingTasks: string;
    deletingTasks: string;
    deletingTasksError: string;
    noRecordsFound: string;
    unexpectedErrorOccurred: string;
}

export interface ILocalizationService<T> {
    getLocalizedString: (key: keyof T, variables?: {[key: string]: string}) => string;
}

export const TASK_GRID_LABELS: ITaskGridLabels = {
    name: 'Name',
    no: 'No',
    yes: 'Yes',
    ok: 'Ok',
    confirm: 'Confirm',
    confirmation: 'Confirmation',
    myViews: 'My views',
    systemViews: 'System views',
    saveAsNew: 'Save as new view',
    saveExisting: 'Save changes to current view',
    manageViews: 'Manage views',
    deleteView: "Are you sure you want to delete this view? You can't undo this action.",
    cancel: 'Cancel',
    save: 'Save',
    loading: 'Loading...',
    reordering: 'Reordering',
    search: 'Search',
    editColumns: 'Edit columns',
    allTasks: 'All Tasks',
    new: 'New',
    bulkEdit: 'Edit',
    settings: 'Settings',
    'reorderingTaskDialog.text.children': 'Do you want to make "{{ baseRecord }}" children of "{{ overBaseRecord }}"?',
    'reorderingTaskDialog.text.above': 'Do you want to move "{{ baseRecord }}" above "{{ overBaseRecord }}"?',
    'reorderingTaskDialog.text.below': 'Do you want to move "{{ baseRecord }}" below "{{ overBaseRecord }}"?',
    'reorderingTaskTemplateDialog.text.children': 'Do you want to make "{{ baseRecord }}" children of "{{ overBaseRecord }}"?',
    'reorderingTaskTemplateDialog.text.topLevel': 'Do you want to make "{{ baseRecord }}" top-level template?',
    'reorderingTaskDialog.manyChildrenWarning': 'You are about to move {{ numberOfRecords }} records. Do you wish to continue?',
    creatingTemplateFromTasks: 'Creating template from task...',
    creatingTasksFromTemplate: 'Creating tasks from template...',
    templateCreatedSuccessfully: 'Template was created successfully.',
    description: 'Description',
    noTaskTemplates: 'No task templates',
    addChild: 'Add Child',
    addCustomColumn: 'Create Custom Column',
    confirmColumnDelete: 'Do you want to delete the selected column?',
    confirmColumnEdit: 'To edit the column, all data needs to be reloaded. Do you want to continue?',
    loadingTemplates: 'Loading templates...',
    taskFromTemplate: 'Task From Template',
    templateFromTask: 'Template From Task',
    loadingMilestones: 'Loading milestones...',
    chooseExisting: 'Choose existing',
    noMilestones: 'No milestones',
    loadingContracts: 'Loading contracts...',
    createFromContract: 'Create from contract',
    noContracts: 'No contracts',
    createManually: 'Create manually',
    newRecord: 'New Record',
    filterByKeyword: 'Filter by keyword',
    deleteSelected: 'Delete',
    showHierarchy: 'Show hierarchy',
    'confirmDialog.deleteSelectedRows.text': 'Are you sure you want to delete selected rows?',
    topLevel: 'Top-level',
    canNotDeleteCompleted: "You can't delete completed one.",
    canNotDeletedRecordsWithChild: "You can't delete records with children.",
    canNotEditCompletedTask: "You can't edit completed task.",
    selectMaximumOneTask: 'Select maximum one task.',
    hideInactiveTasks: 'Hide inactive tasks',
    successfulOperationDialogTitle: 'Success',
    warningDialogTitle: 'Warning',
    informationDialogTitle: 'Information',
    couldNotFindRecord: 'Could not find base record from the fetch xml!',
    wrongBaseRecord: 'Base record has to be task or task template entity!',
    fillRecordId: 'Fill record id to retrieve base records!',
    fillEntityName: 'Fill entity name to retrieve base records!',
    fillFetchXml: 'Fill fetch xml to retrieve base records!',
    myTemplates: 'My Templates',
    publicTemplates: 'Public Templates',
    updatingTasks: 'Updating task...',
    deletingTasks: 'Deleting task...',
    deletingTasksError: 'Some tasks could not be deleted due to following reasons:',
    noRecordsFound: 'No records found.',
    unexpectedErrorOccurred: 'Unexpected error occurred.',
}

export class LocalizationService<T extends { [K in keyof T]: string }> implements ILocalizationService<T> {
    private _getLabels: () => T;
    private _liquidEngine: Liquid;

    constructor(getLabels: () => T) {
        this._getLabels = getLabels;
        this._liquidEngine = new Liquid();
    }

    public getLocalizedString(key: keyof T, variables?: {[key: string]: string}): string {
        const labels = this._getLabels();
        if(variables) {
            return this._liquidEngine.parseAndRenderSync(labels[key] as unknown as string, variables);
        }
        return labels[key];
    }
}