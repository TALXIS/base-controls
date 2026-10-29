import { useEffect, useState } from "react";
import { DatasetConstants, IAvailableRelatedColumn, IColumn } from "@talxis/client-libraries";
import { useEventEmitter } from "@hooks";
import { IErrorMessageBarComponents } from "@ui/error-message-bar";
import { useRerender } from "@legacy";
import { DatasetControlUi, IEditColumnsButtonUiComponents, IEditColumnsColumnListUiComponents, IEditColumnsPanelUiComponents, IEditColumnsSelectorUiComponents } from "../../ui";
import { ErrorBoundary, useLabels, useDataProviderEvents } from "@utils";
import { useDatasetControlPart, useRequiredDatasetControlRuntime } from "../root";
import { EDIT_COLUMNS_LABELS } from "./labels";
import { DatasetControlEditColumns, IDatasetControlEditColumnsEvents } from "./DatasetControlEditColumns";
import { IDatasetControlEditColumnsSessionEvents } from "./DatasetControlEditColumnsSession";

/** Replacements for the pieces of the column editor. */
export interface IEditColumnsComponents {
    /** The button that opens the editor. */
    button?: Partial<IEditColumnsButtonUiComponents>;
    /** The panel the editor sits in. */
    panel?: Partial<IEditColumnsPanelUiComponents>;
    /** The picker of the entity columns are added from. */
    scopeSelector?: Partial<IEditColumnsSelectorUiComponents<IAvailableRelatedColumn>>;
    /** The picker of the column to add. */
    columnSelector?: Partial<IEditColumnsSelectorUiComponents<IColumn>>;
    /** The list of the chosen columns. */
    columnList?: Partial<IEditColumnsColumnListUiComponents>;
    /** How a failed column or scope load looks. */
    errorMessage?: Partial<IErrorMessageBarComponents>;
}

/** Props for `DatasetControl.EditColumns`; the columns and related entities it offers come from the provider. */
export interface IEditColumnsProps {
    /** Replacements for the editor's pieces. */
    components?: IEditColumnsComponents;
}

const NO_COMPONENTS: IEditColumnsComponents = {};

/** The button that opens the column editor, and the editor while it is open. */
export const EditColumns = (props: IEditColumnsProps) => {
    const runtime = useRequiredDatasetControlRuntime();
    const provider = useDataProviderEvents(['onLoading']);
    const editColumns = useDatasetControlPart('editColumns', () => new DatasetControlEditColumns({ services: runtime.services, provider }));
    const labels = useLabels(EDIT_COLUMNS_LABELS);
    const components = props.components ?? NO_COMPONENTS;
    const { rerender } = useRerender();
    const [scopeVersion, setScopeVersion] = useState(0);
    //mounts the selectors again, which loads them again
    const [retryCount, setRetryCount] = useState(0);
    const [addedColumn, setAddedColumn] = useState<IColumn>();
    const session = editColumns.getSession();

    useEventEmitter<IDatasetControlEditColumnsEvents>(editColumns.events, 'onOpenChanged', rerender);
    useEventEmitter<IDatasetControlEditColumnsSessionEvents>(session?.events, 'onColumnsChanged', rerender);
    useEventEmitter<IDatasetControlEditColumnsSessionEvents>(session?.events, 'onColumnAdded', setAddedColumn);
    useEventEmitter<IDatasetControlEditColumnsSessionEvents>(session?.events, 'onScopeChanged', () => setScopeVersion(version => version + 1));
    useEventEmitter<IDatasetControlEditColumnsSessionEvents>(session?.events, 'onLoadFailed', rerender);
    useEventEmitter<IDatasetControlEditColumnsSessionEvents>(session?.events, 'onScopesLoaded', rerender);
    useEffect(() => () => editColumns.destroy(), []);

    const retry = () => {
        session?.clearError();
        setRetryCount(count => count + 1);
    };

    const getTitle = (): string => {
        const collectionName = session?.getEntityDisplayName();
        return collectionName ? `${labels.get('editColumns.editColumns')}: ${collectionName}` : labels.get('editColumns.editColumns');
    };

    const getScopeLabel = (scope: IAvailableRelatedColumn): string => {
        const name = scope.displayName ?? labels.get('editColumns.unnamed');
        return scope.relatedEntityDisplayName ? `${name} (${scope.relatedEntityDisplayName})` : name;
    };

    return <>
        <DatasetControlUi.EditColumnsButton
            text={labels.get('editColumns.editColumns')}
            onClick={() => editColumns.open()}
            disabled={provider.isLoading()}
            components={components.button} />
        {session && <DatasetControlUi.EditColumnsPanel
            title={getTitle()}
            saveText={labels.get('editColumns.save')}
            cancelText={labels.get('editColumns.cancel')}
            isSaveDisabled={session.getColumns().length === 0}
            onSave={() => editColumns.save()}
            onDismiss={() => editColumns.close()}
            commands={editColumns.getCommands(session)}
            components={components.panel}>
            <ErrorBoundary error={session.getError()} onRetry={retry} components={components.errorMessage}>
                {session.hasScopes() && <DatasetControlUi.EditColumnsScopeSelector
                    key={retryCount}
                    label={labels.get('editColumns.scopeSelectorLabel')}
                    defaultValue={session.getMainScope()}
                    noResultsText={labels.get('editColumns.noResults')}
                    loadingText={labels.get('editColumns.loading')}
                    getOptionLabel={getScopeLabel}
                    onLoadOptions={query => session.getScopes(query)}
                    onChange={scope => session.setScope(scope)}
                    components={components.scopeSelector} />}
                <DatasetControlUi.EditColumnsColumnSelector
                    key={`${scopeVersion}-${retryCount}`}
                    openMenuOnMount={scopeVersion > 0}
                    value={session.getColumns()}
                    placeholder={labels.get('editColumns.columnSelectorPlaceholder')}
                    noResultsText={labels.get('editColumns.noResults')}
                    loadingText={labels.get('editColumns.loading')}
                    noNameText={labels.get('editColumns.unnamed')}
                    getOptionTooltip={column => column.name.endsWith(DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX) ? labels.get('editColumns.customColumnTooltip') : column.name}
                    onLoadOptions={query => session.getAvailableColumns(query)}
                    onAdd={column => session.addColumn(column)}
                    components={components.columnSelector} />
            </ErrorBoundary>
            <DatasetControlUi.EditColumnsColumnList
                columns={session.getColumns().map(column => ({
                    column,
                    text: column.displayName ?? labels.get('editColumns.unnamed'),
                    //dnd-kit swallows the click, so the remove button acts on mouse up
                    commands: editColumns.getColumnCommands(column, session, { key: 'remove', iconProps: { iconName: 'Cancel' }, onMouseUp: () => session.removeColumn(column.name) }),
                }))}
                scrollToName={addedColumn?.name}
                onMove={(name, targetName) => session.moveColumn(name, targetName)}
                components={components.columnList} />
        </DatasetControlUi.EditColumnsPanel>}
    </>;
};
