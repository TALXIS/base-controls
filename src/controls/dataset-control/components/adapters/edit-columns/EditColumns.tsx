import { useEffect, useMemo, useState } from "react";
import { DatasetConstants, IAvailableRelatedColumn, IColumn } from "@talxis/client-libraries";
import { useEventEmitter, useLatest } from "@hooks";
import { IErrorMessageBarComponents } from "@ui/error-message-bar";
import { useRerender } from "@legacy";
import { DatasetControlUi, IEditColumnsButtonUiComponents, IEditColumnsColumnListUiComponents, IEditColumnsPanelUiComponents, IEditColumnsSelectorUiComponents } from "../../ui";
import { ErrorBoundary, LocalizationService, useDataProvider } from "@utils";
import { useRequiredDatasetControlRuntime } from "../root";
import { EDIT_COLUMNS_LABELS, IEditColumnsLabels } from "./labels";
import { DatasetControlEditColumns, IDatasetControlEditColumnsEvents } from "./DatasetControlEditColumns";
import { IDatasetControlEditColumnsLoaders, IDatasetControlEditColumnsSessionEvents } from "./DatasetControlEditColumnsSession";

/** Replacements for the pieces of the column editor. */
export interface IEditColumnsComponents {
    button?: Partial<IEditColumnsButtonUiComponents>;
    panel?: Partial<IEditColumnsPanelUiComponents>;
    scopeSelector?: Partial<IEditColumnsSelectorUiComponents<IAvailableRelatedColumn>>;
    columnSelector?: Partial<IEditColumnsSelectorUiComponents<IColumn>>;
    columnList?: Partial<IEditColumnsColumnListUiComponents>;
    /** How a failed column or scope load looks. */
    errorMessage?: Partial<IErrorMessageBarComponents>;
}

export interface IEditColumnsProps extends IDatasetControlEditColumnsLoaders {
    labels?: Partial<IEditColumnsLabels>;
    components?: IEditColumnsComponents;
}

const NO_COMPONENTS: IEditColumnsComponents = {};

/** The button that opens the column editor, and the editor while it is open. */
export const EditColumns = (props: IEditColumnsProps) => {
    const runtime = useRequiredDatasetControlRuntime();
    const provider = useDataProvider();
    const propsRef = useLatest(props);
    const editColumns = useMemo(() => new DatasetControlEditColumns({
        services: runtime.services,
        provider,
        onLoadColumns: scope => propsRef.current.onLoadColumns(scope),
        onLoadScopes: props.onLoadScopes && (() => propsRef.current.onLoadScopes!()),
    }), []);
    const labels = useMemo(() => new LocalizationService<IEditColumnsLabels>({ ...EDIT_COLUMNS_LABELS, ...props.labels }), [props.labels]);
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
    useEffect(() => () => editColumns.destroy(), []);

    const retry = () => {
        session?.clearError();
        setRetryCount(count => count + 1);
    };

    const getTitle = (): string => {
        const collectionName = session?.getEntityDisplayName();
        return collectionName ? `${labels.getLocalizedString('editColumns')}: ${collectionName}` : labels.getLocalizedString('editColumns');
    };

    const getScopeLabel = (scope: IAvailableRelatedColumn): string => {
        const name = scope.displayName ?? labels.getLocalizedString('unnamed');
        return scope.relatedEntityDisplayName ? `${name} (${scope.relatedEntityDisplayName})` : name;
    };

    return <>
        <DatasetControlUi.EditColumnsButton
            text={labels.getLocalizedString('editColumns')}
            onClick={() => editColumns.open()}
            components={components.button} />
        {session && <DatasetControlUi.EditColumnsPanel
            title={getTitle()}
            saveText={labels.getLocalizedString('save')}
            cancelText={labels.getLocalizedString('cancel')}
            isSaveDisabled={session.getColumns().length === 0}
            onSave={() => editColumns.save()}
            onDismiss={() => editColumns.close()}
            components={components.panel}>
            <ErrorBoundary error={session.getError()} onRetry={retry} components={components.errorMessage}>
                {session.hasScopes() && <DatasetControlUi.EditColumnsScopeSelector
                    key={retryCount}
                    label={labels.getLocalizedString('scopeSelectorLabel')}
                    defaultValue={session.getMainScope()}
                    noResultsText={labels.getLocalizedString('noResults')}
                    loadingText={labels.getLocalizedString('loading')}
                    getOptionLabel={getScopeLabel}
                    onLoadOptions={query => session.getScopes(query)}
                    onChange={scope => session.setScope(scope)}
                    components={components.scopeSelector} />}
                <DatasetControlUi.EditColumnsColumnSelector
                    key={`${scopeVersion}-${retryCount}`}
                    openMenuOnMount={scopeVersion > 0}
                    value={session.getColumns()}
                    placeholder={labels.getLocalizedString('columnSelectorPlaceholder')}
                    noResultsText={labels.getLocalizedString('noResults')}
                    loadingText={labels.getLocalizedString('loading')}
                    noNameText={labels.getLocalizedString('unnamed')}
                    getOptionTooltip={column => column.name.endsWith(DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX) ? labels.getLocalizedString('customColumnTooltip') : column.name}
                    onLoadOptions={query => session.getAvailableColumns(query)}
                    onAdd={column => session.addColumn(column)}
                    components={components.columnSelector} />
            </ErrorBoundary>
            <DatasetControlUi.EditColumnsColumnList
                columns={session.getColumns().map(column => ({
                    column,
                    text: column.displayName ?? labels.getLocalizedString('unnamed'),
                    //dnd-kit swallows the click, so the remove button acts on mouse up
                    commands: [{ key: 'remove', iconProps: { iconName: 'Cancel' }, onMouseUp: () => session.removeColumn(column.name) }],
                }))}
                scrollToName={addedColumn?.name}
                onMove={(name, targetName) => session.moveColumn(name, targetName)}
                components={components.columnList} />
        </DatasetControlUi.EditColumnsPanel>}
    </>;
};
