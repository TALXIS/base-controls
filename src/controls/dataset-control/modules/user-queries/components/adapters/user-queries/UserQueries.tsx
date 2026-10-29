import { useState } from "react";
import { useEventEmitter } from "@hooks";
import { ErrorHelper, useLabels, usePcfContext } from "@utils";
import { useRequiredDatasetControlRuntime } from "../../../../../components/adapters/root/context";
import type { IDatasetControlUserQueriesEvents } from "../../../DatasetControlUserQueries";
import { USER_QUERIES_LABELS } from "../../../labels";
import { IManageViewsPanelUiComponents, ManageViewsPanel } from "../../ui";
import { IManageViewsComponents, ManageViews } from "../manage-views";

/** Replacements for the user queries' UI. */
export interface IUserQueriesComponents {
    manageViewsPanel?: Partial<IManageViewsPanelUiComponents>;
    /** What the panel holds: the control the views are listed in, and its grid. */
    manageViews?: IManageViewsComponents;
}

/** Props for `DatasetControl.UserQueries`. */
export interface IUserQueriesProps {
    components?: IUserQueriesComponents;
}

/** The Manage views panel the module's command opens; goes inside `DatasetControl.ViewSwitcher`. */
export const UserQueries = (props: IUserQueriesProps) => {
    const runtime = useRequiredDatasetControlRuntime();
    const pcfContext = usePcfContext();
    const userQueries = runtime.modules.find('userQueries');
    if (!userQueries) {
        throw new Error('DatasetControl.UserQueries needs the userQueries module.');
    }
    const [isManaging, setIsManaging] = useState(false);
    const labels = useLabels(USER_QUERIES_LABELS);

    useEventEmitter<IDatasetControlUserQueriesEvents>(userQueries.events, 'onManageRequested', () => setIsManaging(true));
    useEventEmitter<IDatasetControlUserQueriesEvents>(userQueries.events, 'onOperationFailed', error => {
        pcfContext.navigation.openErrorDialog({ message: ErrorHelper.getMessageFromError(error), details: (error as { stack?: string } | undefined)?.stack });
    });

    //the switcher lists the views as they were when the control loaded
    const close = async () => {
        setIsManaging(false);
        await runtime.reload();
    };

    if (!isManaging) {
        return null;
    }
    return <ManageViewsPanel
        title={labels.get('userQueries.manageViews')}
        closeText={labels.get('userQueries.close')}
        onDismiss={close}
        components={props.components?.manageViewsPanel}>
        <ManageViews components={props.components?.manageViews} />
    </ManageViewsPanel>;
};
