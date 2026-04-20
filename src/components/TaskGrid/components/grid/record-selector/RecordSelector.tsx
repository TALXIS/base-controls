import { DatasetControl } from "../../../../DatasetControl"
import { Dataset, IDataProvider, IRecord } from "@talxis/client-libraries";
import { DatasetControl as DatasetControlModel } from '../../../../../utils/dataset-control';
import * as React from "react"
import { getClassNames, Spinner } from "@talxis/react-components";
import { CommandBarButton, Icon, useTheme, Text, IButtonProps, DirectionalHint } from "@fluentui/react";
import { getRecordSelectorStyles } from "./styles";
import { FixedSizeList } from 'react-window';
import { useLocalizationService, usePcfContext } from "../../../context";

interface IRecordSelectorProps {
    provider: IDataProvider;
    onRecordSelected: (recordId: string) => void;
    onRenderRecord?: (props: IButtonProps, defaultRender: (props: IButtonProps) => React.ReactNode) => React.ReactNode;
}

export const RecordSelector = (props: IRecordSelectorProps) => {
    const { onRecordSelected } = props;
    const providerRef = React.useRef(props.provider);
    const localizationService = useLocalizationService();
    const pcfContext = usePcfContext();
    const dataset = React.useMemo(() => new Dataset(providerRef.current), []);
    const theme = useTheme();
    const styles = React.useMemo(() => getRecordSelectorStyles(theme), []);
    const { onRenderRecord = (props, defaultRender) => defaultRender(props) } = props;

    const datasetControl = React.useMemo(() => {
        return new DatasetControlModel({
            controlId: 'recordSelectorDatasetControl',
            onGetParameters: () => {
                return {
                    Grid: dataset,
                    EnableCommandBar: {
                        raw: false
                    },
                    EnablePageSizeSwitcher: {
                        raw: false
                    },
                    DestroyDatasetOnUnmount: {
                        raw: false
                    }
                }
            },
            onGetPcfContext: () => pcfContext,
            state: {}
        })
    }, []);
    return <DatasetControl
        onGetDatasetControlInstance={() => datasetControl}
        onOverrideComponentProps={(props) => {
            return {
                ...props,
                onRender: (props, defaultRender) => {
                    return defaultRender({
                        ...props,
                        onRenderHeader: (props, defaultRender) => {
                            return defaultRender({
                                ...props,
                                headerContainerProps: {
                                    ...props.headerContainerProps,
                                    className: getClassNames([props.headerContainerProps.className, styles.headerContainer]),
                                },
                                onRenderRibbonQuickFindWrapper: (props, defaultRender) => {
                                    return defaultRender({
                                        ...props,
                                        onRenderQuickFind: (props, defaultRender) => {
                                            return defaultRender({
                                                ...props,
                                                containerProps: {
                                                    ...props.containerProps,
                                                    className: getClassNames([props.containerProps.className, styles.quickFindContainer])
                                                },
                                                onRenderCalloutContainer: (props, defaultRender) => {
                                                    return defaultRender({
                                                        ...props,
                                                        onRenderCallout: (props, defaultRender) => {
                                                            return defaultRender({
                                                                ...props,
                                                                directionalHint: DirectionalHint.topLeftEdge
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        },

                                    })
                                }
                            })
                        },
                        container: {
                            ...props.container,
                            className: getClassNames([props.container.className, styles.root])
                        },
                        onRenderControlContainer: (props, defaultRender) => {
                            return defaultRender({
                                ...props,
                                controlContainerProps: {
                                    ...props.controlContainerProps,
                                    className: getClassNames([props.controlContainerProps.className, styles.controlContainer])
                                }
                            })
                        }
                    })
                }
            }
        }}
        onGetControlComponent={() => {
            const records = providerRef.current.getRecords();
            if (providerRef.current.isLoading()) {
                return <div className={styles.loadingContainer}>
                    <Spinner />
                </div>
            }
            else if (records.length === 0) {
                return <div className={styles.recordsNotFoundContainer}>
                    <Icon className={styles.recordsNotFoundIcon} iconName='SearchAndApps' />
                    <Text>{localizationService.getLocalizedString('noRecordsFound')}</Text>
                </div>
            }
            else {
                return <FixedSizeList
                    className={styles.recordList}
                    itemCount={records.length}
                    itemSize={36}
                    height={200}
                    width={300}
                >
                    {({ index, style }) => {
                        const record: IRecord = records[index];
                        return (
                            <div key={record.getRecordId()} style={style}>
                                {onRenderRecord({
                                    className: styles.recordButton,
                                    onClick: () => onRecordSelected(record.getRecordId()),
                                    text: record.getFormattedValue(providerRef.current.getMetadata().PrimaryNameAttribute)!
                                }, (props) => <CommandBarButton {...props} />)}
                            </div>
                        );
                    }}
                </FixedSizeList>
            }
        }}
    />
}