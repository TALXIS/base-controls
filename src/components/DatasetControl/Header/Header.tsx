import { ActionButton, MessageBar, MessageBarType } from "@fluentui/react";
import { IComponentProps } from "../interfaces";
import { useModel } from "../useModel";
import { useEffect, useMemo } from "react";
import { getHeaderStyles } from "./styles";
import { useRerender } from "@talxis/react-components";
import { QuickFind } from "../QuickFind/QuickFind";
import { Ribbon } from "../../Ribbon/Ribbon";

export const Header = (props: { onRenderHeader: IComponentProps['onRenderHeader'] }) => {
    const model = useModel();
    const dataset = model.getDataset();
    const rerender = useRerender();

    const styles = useMemo(() => getHeaderStyles(), []);

    const isHeaderVisible = () => {
        //render header only in these cases
        //rest of the cases (ribbon, quick find) are handled by the platform for native grids
        if (!dataset.isVirtual()) {
            return dataset.isDirty() || dataset.error;
        }
        switch (true) {
            case model.isQuickFindVisible():
            case dataset.error:
            case model.isRibbonVisible():
            case dataset.isDirty(): {
                return true;
            }
            default: {
                return false;
            }
        }
    }

    useEffect(() => {
        model.addEventListener('onRecordCommandsLoaded', () => rerender());
        dataset.addEventListener('onLoading', () => rerender());
    }, []);

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
                        props.onRenderRibbon({
                            onRenderCommandBar: (props, defaultRender) => defaultRender(props),
                            onRenderLoading: (props, defaultRender) => defaultRender(props),
                        }, (props) => {
                            return <Ribbon
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
                                onOverrideComponentProps={(ribbonProps) => {
                                    return {
                                        ...ribbonProps,
                                        onRenderLoading: (shimmerProps, defaultRender) => props.onRenderLoading(shimmerProps, (props) => defaultRender(props)),
                                        onRenderCommandBar: (commandBarProps, defaultRender) => props.onRenderCommandBar(commandBarProps, (props) => defaultRender(props)),
                                    }
                                }}
                            />
                        })
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
            {/* {model.isUnsavedChangesMessageBarVisible() &&
                props.onRenderUnsavedChangesMessageBar({
                    messageBarProps: {
                        messageBarType: dataset.isValid() ? MessageBarType.info : MessageBarType.error,
                        isMultiline: false
                    },
                    onRenderSaveBtn: (props, defaultRender) => defaultRender(props),
                    onRenderDiscardBtn: (props, defaultRender) => defaultRender(props)
                }, (props) => {
                    return <MessageBar actions={
                        <>
                            {props.onRenderDiscardBtn({
                                text: 'Discard changes',
                                iconProps: {
                                    iconName: 'Cancel'
                                },
                                disabled: dataset.loading,
                                styles: {
                                    root: styles.unsavedChangesMessageBarBtn
                                },
                                onClick: () => dataset.refresh(),
                            }, (props) => {
                                return <ActionButton {...props} />
                            })}
                            {props.onRenderSaveBtn({
                                text: 'Save',
                                disabled: dataset.loading || !dataset.isValid(),
                                iconProps: {
                                    iconName: 'Save'
                                },
                                styles: {
                                    root: styles.unsavedChangesMessageBarBtn
                                },
                                onClick: saveChanges,
                            }, (props) => {
                                return <ActionButton {...props} />
                            })}
                        </>
                    } {...props.messageBarProps}>
                        <div dangerouslySetInnerHTML={{
                            __html: labels["unsaved-changes"]({
                                numOfChanges: dataset.getDataProvider().getDirtyRecordIds().length
                            })
                        }} />
                    </MessageBar>
                })
            } */}
        </div>
    })
}