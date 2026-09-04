import { Callout, IconButton, ICalloutProps } from '@fluentui/react';
import { Text } from '@fluentui/react';
import { DatasetColumnFiltering } from '@components/DatasetControl/Filtering/DatasetColumnFiltering';
import { getClassNames , usePcfContext} from '@utils';
import { useEffect } from 'react';
import { IGridColumn } from '@components/Grid/grid/columns';
import { useGridService } from '@components/Grid/grid/useGridService';
import { useGridFilteringLabels } from './useGridFilteringLabels';
import { filterCalloutStyles } from './styles';
import { ILookup } from '@components/Lookup';
import { INestedControlRenderer } from '@components/NestedControlRenderer/interfaces';
import { IInternalDataProvider } from '@talxis/client-libraries';

export interface IFilterCallout extends ICalloutProps {
    column: IGridColumn;
    onDismiss: () => void;
}

export const FilterCallout = (props: IFilterCallout) => {
    const { column, onDismiss } = { ...props };
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
        <Callout
            {...props}
            calloutWidth={230}
            className={filterCalloutStyles.root}>
            <div className={filterCalloutStyles.header}>
                <Text className={filterCalloutStyles.title} variant="mediumPlus">{labels.getLocalizedString('filterMenuFilterBy')}</Text>
                <IconButton onClick={() => onDismiss()} iconProps={{
                    iconName: 'ChromeClose',
                }} />
            </div>
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
        </Callout>
    );
};