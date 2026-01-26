import { CommandBar, CommandBarButton, MessageBar, MessageBarType } from "@fluentui/react";
import { IComponentProps } from "../interfaces";
import { useModel } from "../useModel";
import { useMemo, useState } from "react";
import { getHeaderStyles } from "./styles";
import { ICommandBarItemProps, useRerender } from "@talxis/react-components";
import { QuickFind } from "../QuickFind/QuickFind";
import { Ribbon } from "../../Ribbon/Ribbon";
import { useEventEmitter } from "../../../hooks/useEventEmitter";
import { IDataProviderEventListeners } from "@talxis/client-libraries";
import { IDatasetControlEvents } from "../../../utils/dataset-control";
import { EditColumns } from "../EditColumns/EditColumns";

export const Header = (props: { onRenderHeader: IComponentProps['onRenderHeader'] }) => {
    const model = useModel();
    const datasetControl = model.getDatasetControl();
    const dataset = datasetControl.getDataset();
    const rerender = useRerender();
    const styles = useMemo(() => getHeaderStyles(), []);
    const [isEditColumnsPanelVisible, setIsEditColumnsPanelVisible] = useState<boolean>(false);
    useEventEmitter<IDataProviderEventListeners>(dataset, 'onLoading', rerender);
    useEventEmitter<IDatasetControlEvents>(datasetControl, 'onRecordCommandsLoaded', rerender);

    const isHeaderVisible = () => {
        switch (true) {
            case datasetControl.isQuickFindVisible():
            case dataset.error:
            case datasetControl.isRibbonVisible():
                {
                    return true;
                }
            default: {
                return false;
            }
        }
    }

    const getRightSideCommands = (): ICommandBarItemProps[] => {
        return [
            ...(datasetControl.isEditColumnsVisible() ? [{
                key: 'column',
                text: 'Edit Columns',
                iconProps: { iconName: 'ColumnOptions' },
                onClick: () => setIsEditColumnsPanelVisible(true)
            }] : []),
            ...(datasetControl.isEditFiltersVisible() ? [{
                key: 'filter',
                text: 'Edit Filters',
                iconProps: { iconName: 'Filter' }
            }] : [])];
    }

    const shouldMergeRightSideCommandsWithRibbon = () => {
        return datasetControl.isViewSwitcherVisible() && (datasetControl.isEditColumnsVisible() || datasetControl.isEditFiltersVisible());
    }

    return props.onRenderHeader({
        headerContainerProps: {
            className: styles.header
        },
        onRenderErrorMessageBar: (props, defaultRender) => defaultRender(props),
        onRenderRibbonQuickFindWrapper: (props, defaultRender) => defaultRender(props),
        onRenderUnsavedChangesMessageBar: (props, defaultRender) => defaultRender(props)
    }, (props) => {
        if (!isHeaderVisible()) {
            return <></>
        }
        return <div {...props.headerContainerProps}>
            {props.onRenderRibbonQuickFindWrapper({
                ribbonQuickFindContainerProps: {
                    className: styles.ribbonQuickFindContainer
                },
                isRibbonVisible: datasetControl.isRibbonVisible(),
                isQuickFindVisible: datasetControl.isQuickFindVisible(),
                isEditColumnsVisible: datasetControl.isEditColumnsVisible(),
                isViewSwitcherVisible: datasetControl.isViewSwitcherVisible(),
                isEditFiltersVisible: datasetControl.isEditFiltersVisible(),
                shouldMergeRightSideCommandsWithRibbon: shouldMergeRightSideCommandsWithRibbon(),
                onRenderQuickFind: (props, defaultRender) => defaultRender(props),
                onRenderRibbon: (props, defaultRender) => defaultRender(props)
            }, (props) => {
                return <div {...props.ribbonQuickFindContainerProps}>
                    {props.isViewSwitcherVisible &&
                        <CommandBarButton text="Current View" />
                    }
                    {props.isRibbonVisible &&
                        <Ribbon
                            context={{
                                ...datasetControl.getPcfContext(),
                                mode: {
                                    ...datasetControl.getPcfContext().mode,
                                    isControlDisabled: dataset.loading
                                }
                            }}
                            onOverrideComponentProps={(ribbonProps) => {
                                return {
                                    ...ribbonProps,
                                    onRender: (ribbonProps, defaultRender) => props.onRenderRibbon({
                                        ...ribbonProps,
                                        onRenderCommandBar: (commandBarProps, defaultRender) => {
                                            return defaultRender({
                                                ...commandBarProps,
                                                styles: {
                                                    ...commandBarProps.styles,
                                                    primarySet: {
                                                        justifyContent: props.isViewSwitcherVisible ? 'flex-end' : 'flex-start'
                                                    }
                                                },
                                                items: [...commandBarProps.items, ...(props.isViewSwitcherVisible ? getRightSideCommands() : [])],
                                                farItems: !props.isViewSwitcherVisible ? getRightSideCommands() : []
                                            })
                                        }
                                    }, defaultRender)
                                }
                            }}
                            parameters={{
                                Commands: {
                                    raw: datasetControl.retrieveRecordCommands(),
                                },
                                Loading: {
                                    raw: !datasetControl.areCommandsLoaded()
                                }
                            }}
                        />
                    }
                    {props.isQuickFindVisible &&
                        <QuickFind
                            onRenderQuickFind={props.onRenderQuickFind} />
                    }
                </div>
            })}
            {dataset.error &&
                props.onRenderErrorMessageBar({
                    messageBarProps: {
                        messageBarType: MessageBarType.error
                    },
                    onRenderMessageBar: (props, defaultRender) => defaultRender(props)

                }, (props) => {
                    return <MessageBar {...props.messageBarProps}>
                        {dataset.errorMessage}
                    </MessageBar>
                })
            }
            {isEditColumnsPanelVisible &&
                <div style={{position: 'absolute'}}>
                    <EditColumns
                        onDismiss={() => setIsEditColumnsPanelVisible(false)} />
                </div>
            }
        </div>
    })
}