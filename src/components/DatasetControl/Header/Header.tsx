import { MessageBar, MessageBarType } from "@fluentui/react";
import { IComponentProps } from "../interfaces";
import { useModel } from "../useModel";
import { useMemo } from "react";
import { getHeaderStyles } from "./styles";
import { useRerender } from "@talxis/react-components";
import { QuickFind } from "../QuickFind/QuickFind";
import { Ribbon } from "../../Ribbon/Ribbon";
import { useEventEmitter } from "../../../hooks/useEventEmitter";
import { IDataProviderEventListeners } from "@talxis/client-libraries";
import { IDatasetControlEvents } from "../../../utils/dataset-control";

export const Header = (props: { onRenderHeader: IComponentProps['onRenderHeader'] }) => {
    const model = useModel();
    const datasetControl = model.getDatasetControl();
    const dataset = datasetControl.getDataset();
    const rerender = useRerender();
    const styles = useMemo(() => getHeaderStyles(), []);
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
                onRenderQuickFind: (props, defaultRender) => defaultRender(props),
                onRenderRibbon: (props, defaultRender) => defaultRender(props)
            }, (props) => {
                return <div {...props.ribbonQuickFindContainerProps}>
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
                                    onRender: props.onRenderRibbon
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
        </div>
    })
}