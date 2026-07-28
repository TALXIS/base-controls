import { notImplemented } from "./utils";

export interface INavigationParams {
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
    ): Xrm.Async.PromiseLike<any> {
        void pageInput;
        void navigationOptions;
        return notImplemented("Navigation.navigateTo");
    }

    public openAlertDialog(
        alertStrings: Xrm.Navigation.AlertStrings,
        alertOptions?: Xrm.Navigation.DialogSizeOptions,
    ): Xrm.Async.PromiseLike<any> {
        void alertStrings;
        void alertOptions;
        return notImplemented("Navigation.openAlertDialog");
    }

    public openConfirmDialog(
        confirmStrings: Xrm.Navigation.ConfirmStrings,
        confirmOptions?: Xrm.Navigation.DialogSizeOptions,
    ): Xrm.Async.PromiseLike<Xrm.Navigation.ConfirmResult> {
        void confirmStrings;
        void confirmOptions;
        return notImplemented("Navigation.openConfirmDialog");
    }

    public openErrorDialog(errorOptions: Xrm.Navigation.ErrorDialogOptions): Xrm.Async.PromiseLike<any> {
        void errorOptions;
        return notImplemented("Navigation.openErrorDialog");
    }

    public openFile(file: Xrm.Navigation.FileDetails, openFileOptions?: Xrm.Navigation.OpenFileOptions): void {
        void file;
        void openFileOptions;
        notImplemented("Navigation.openFile");
    }

    public openForm(
        entityFormOptions: Xrm.Navigation.EntityFormOptions,
        formParameters?: Xrm.Utility.OpenParameters,
    ): Xrm.Async.PromiseLike<Xrm.Navigation.OpenFormResult> {
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
