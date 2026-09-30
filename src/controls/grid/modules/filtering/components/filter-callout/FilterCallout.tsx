import { useEffect, useMemo } from "react";
import { Target } from "@fluentui/react";
import { IColumn, IInternalDataProvider } from "@talxis/client-libraries";
import { getClassNames, usePcfContext } from "@utils";
import { DatasetColumnFiltering } from "@controls/dataset-control/filtering/DatasetColumnFiltering";
import { ILookup } from "@controls/fields/lookup";
import { INestedControlRenderer } from "@controls/nested-control-renderer/interfaces";
import { useGridService } from "../../../../useGridService";
import { useGridFilteringLabels } from "../../useGridFilteringLabels";
import { FilteringUi, IFilteringUiCalloutComponents } from "../ui";
import { getFilterCalloutStyles } from "./styles";

export interface IFilterCalloutProps {
    column: IColumn;
    /** What the callout points at. */
    target?: Target;
    onDismiss: () => void;
    components?: Partial<IFilteringUiCalloutComponents>;
}

/** The callout a column's filter is set in, wired to the provider it filters. */
export const FilterCallout = (props: IFilterCalloutProps) => {
    const { column, onDismiss } = props;
    const filterCalloutStyles = useMemo(() => getFilterCalloutStyles(), []);
    const filtering = useGridService('filtering')!;
    const provider = useGridService('provider');
    const dataProvider = provider as IInternalDataProvider;
    const context = usePcfContext();
    const labels = useGridFilteringLabels();

    const onColumnFilterSaved = (filter: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression) => {
        dataProvider.executeWithUnsavedChangesBlocker(() => {
            onDismiss();
            provider.setFiltering(filter);
            provider.refresh();
        })
    }

    const onRenderConditionValueControl = (props: INestedControlRenderer, defaultRender: (props: INestedControlRenderer) => React.ReactElement) => {
        switch (column.dataType) {
            case 'Lookup.Customer':
            case 'Lookup.Owner':
            case 'Lookup.Regarding':
            case 'Lookup.Simple': {
                return defaultRender({
                    ...props,
                    onOverrideComponentProps: (props) => {
                        return {
                            ...props,
                            onOverrideControlProps: (props: ILookup): ILookup => {
                                return {
                                    ...props,
                                    parameters: {
                                        ...props.parameters,
                                        IsInlineNewEnabled: {
                                            raw: false
                                        },
                                        value: {
                                            ...props.parameters.value,
                                            //@ts-ignore
                                            getAllViews: (() => {
                                                const originalGetAllViews = props.parameters.value.getAllViews;
                                                //@ts-ignore
                                                return (...args) => originalGetAllViews(...args, 1);
                                            })()
                                        }
                                    }
                                }
                            }
                        }
                    }
                })
            }
            default: {
                return defaultRender(props);
            }
        }
    }

    useEffect(() => {
        return () => {
            if (!filtering.isFiltered(column)) {
                filtering.removeColumnFilter(column.name)
            }
        }
    }, []);

    return (
        <FilteringUi.Callout
            target={props.target}
            title={labels.getLocalizedString('filterMenuFilterBy')}
            onDismiss={onDismiss}
            components={props.components}>
            <DatasetColumnFiltering
                parameters={{
                    ColumnName: {
                        raw: column.name,
                    },
                    Filtering: filtering.getFiltering()
                }}
                onNotifyOutputChanged={(outputs) => onColumnFilterSaved(outputs)}
                onOverrideComponentProps={(props) => {
                    return {
                        ...props,
                        onRender: (props, defaultRender) => {
                            return defaultRender({
                                ...props,
                                container: {
                                    ...props.container,
                                    className: getClassNames([props.container.className, filterCalloutStyles.datasetColumnFilteringRoot]),
                                },
                                valueControlsContainer: {
                                    ...props.valueControlsContainer,
                                    className: getClassNames([props.valueControlsContainer.className, filterCalloutStyles.valueControlsContainer]),
                                },
                                onRenderConditionValueControl: onRenderConditionValueControl,
                                onRenderButtons: (props, defaultRender) => {
                                    return defaultRender({
                                        ...props,
                                        container: {
                                            className: getClassNames([props.container.className, filterCalloutStyles.datasetColumnFilteringButtons])
                                        }
                                    })
                                }
                            })
                        }
                    }
                }}
                context={context} />
        </FilteringUi.Callout>
    );
};
