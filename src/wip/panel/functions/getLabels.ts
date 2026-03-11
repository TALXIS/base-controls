export interface IPanelLabels {
    dismiss: string;
    save: string;
    header: string;
}
export const getLabels = () => {
    return {
        dismiss: "Dismiss",
        save: "Save",
        header: ''
    }
}