export interface IFormLabels {
    save: string;
    saving: string;
    saved: string;
    unsavedChanges: string;
    groupedNotificationsSummary: string;
}

export const FORM_LABELS: IFormLabels = {
    save: "Save",
    saving: "Saving...",
    saved: "Saved!",
    unsavedChanges: "Unsaved changes",
    groupedNotificationsSummary: "You have {{ count }} notifications. Select to view them.",
};
