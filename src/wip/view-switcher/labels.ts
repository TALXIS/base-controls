export interface IViewSwitcherLabels {
    userViews: string;
    systemViews: string;
    default: string;
    saveExistingView: string;
    saveNewView: string;
    manageViews: string;
    name: string;
    description: string;
    namePlaceholder: string;
    descriptionPlaceholder: string;
    savingView: string;
    nameRequired: string;
}

export const VIEW_SWITCHER_LABELS: IViewSwitcherLabels = {
    userViews: 'User views',
    systemViews: 'System views',
    default: 'Default',
    saveExistingView: 'Save existing view',
    saveNewView: 'Save as new view',
    manageViews: 'Manage views',
    name: 'Name',
    description: 'Description',
    savingView: 'Saving view...',
    namePlaceholder: '---',
    descriptionPlaceholder: '---',
    nameRequired: 'Name is required'
}