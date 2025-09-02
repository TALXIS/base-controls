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
import { IDatasetControlModelEvents } from "../DatasetControlModel";

export const Header = (props: { onRenderHeader: IComponentProps['onRenderHeader'] }) => {
    const model = useModel();
    const dataset = model.getDataset();
    const rerender = useRerender();
    const styles = useMemo(() => getHeaderStyles(), []);
    useEventEmitter<IDataProviderEventListeners>(dataset, 'onLoading', rerender);
    useEventEmitter<IDatasetControlModelEvents>(model, 'onRecordCommandsLoaded', rerender);

    const isHeaderVisible = () => {
        switch (true) {
            case model.isQuickFindVisible():
            case dataset.error:
            case model.isRibbonVisible():
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
                onRenderQuickFind: (props, defaultRender) => defaultRender(props),
                onRenderRibbon: (props, defaultRender) => defaultRender(props)
            }, (props) => {
                return <div {...props.ribbonQuickFindContainerProps}>
                    {model.isRibbonVisible() &&
                        <Ribbon
                            context={{
                                ...model.getPcfContext(),
                                mode: {
                                    ...model.getPcfContext().mode,
                                    isControlDisabled: dataset.loading
                                }
                            }}
                            parameters={{
                                Commands: {
                                    raw: model.retrieveRecordCommands(),
                                },
                                Loading: {
                                    raw: !model.areCommandsLoaded()
                                }
                            }}
                        />
                    }
                    {model.isQuickFindVisible() &&
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