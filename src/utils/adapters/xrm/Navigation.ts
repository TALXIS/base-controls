import { notImplemented } from "./utils";

function getDialogMessage(title: string | undefined, text: string): string {
    return title ? `${title}\n\n${text}` : text;
}

function getErrorDialogMessage(errorOptions: Xrm.Navigation.ErrorDialogOptions): string {
    const lines = [
        errorOptions.message,
        errorOptions.details,
        errorOptions.errorCode !== undefined ? `Error code: ${errorOptions.errorCode}` : undefined,
    ].filter(Boolean);

    return lines.join("\n\n");
}

export class Navigation {
    public navigateTo(
        pageInput:
            | Xrm.Navigation.PageInputEntityRecord
            | Xrm.Navigation.PageInputEntityList
            | Xrm.Navigation.CustomPage
            | Xrm.Navigation.PageInputHtmlWebResource
            | Xrm.Navigation.Dashboard,
        navigationOptions?: Xrm.Navigation.NavigationOptions,
    ): Promise<any> {
        void pageInput;
        void navigationOptions;
        return notImplemented("Navigation.navigateTo");
    }

    public openAlertDialog(
        alertStrings: Xrm.Navigation.AlertStrings,
        alertOptions?: Xrm.Navigation.DialogSizeOptions,
    ): Promise<void> {
        void alertOptions;
        window.alert(getDialogMessage(alertStrings.title, alertStrings.text));

        return Promise.resolve();
    }

    public openConfirmDialog(
        confirmStrings: Xrm.Navigation.ConfirmStrings,
        confirmOptions?: Xrm.Navigation.DialogSizeOptions,
    ): Promise<Xrm.Navigation.ConfirmResult> {
        void confirmOptions;
        const confirmed = window.confirm(getDialogMessage(confirmStrings.title, confirmStrings.text));

        return Promise.resolve({
            confirmed,
        });
    }

    public openErrorDialog(errorOptions: Xrm.Navigation.ErrorDialogOptions): Promise<void> {
        window.alert(getErrorDialogMessage(errorOptions));

        return Promise.resolve();
    }

    public openFile(file: Xrm.Navigation.FileDetails, openFileOptions?: Xrm.Navigation.OpenFileOptions): void {
        void file;
        void openFileOptions;
        notImplemented("Navigation.openFile");
    }

    public openForm(
        entityFormOptions: Xrm.Navigation.EntityFormOptions,
        formParameters?: Xrm.Utility.OpenParameters,
    ): Promise<Xrm.Navigation.OpenFormResult> {
        void entityFormOptions;
        void formParameters;
        return notImplemented("Navigation.openForm");
    }

    public openUrl(url: string, openUrlOptions?: Xrm.Navigation.DialogSizeOptions): void {
        void url;
        void openUrlOptions;
        notImplemented("Navigation.openUrl");
    }

    public openWebResource(
        webResourceName: string,
        windowOptions?: Xrm.Navigation.OpenWebresourceOptions,
        data?: string,
    ): void {
        void webResourceName;
        void windowOptions;
        void data;
        notImplemented("Navigation.openWebResource");
    }
}
