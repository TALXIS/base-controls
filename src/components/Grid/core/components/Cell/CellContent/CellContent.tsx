import * as React from 'react';
import { Attribute } from '@talxis/client-libraries';
import { useGridInstance } from '../../../hooks/useGridInstance';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import { AgGridContext } from '../../AgGrid/AgGrid';
import { GridCellLabel } from '../../../../../GridCellLabel/GridCellLabel';
import { ICellProps } from '../Cell';
import { Control, IBinding } from '../ReadOnlyCell/Component/Control';
import { TextField } from '@fluentui/react';
import { getCellContentStyles } from './styles';
import { useControlThemeGenerator } from '../../../../../../utils';

interface ICellContentProps extends ICellProps {
    isRightAlignedColumn: boolean
}


export const CellContent = (props: ICellContentProps) => {
    const column = props.baseColumn;
    const grid = useGridInstance();
    const record = props.data;
    const [initialized, setIsInitialized] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const controlRef = React.useRef<Control>();
    const agGridContext = React.useContext(AgGridContext);
    const styles = React.useMemo(() => getCellContentStyles(props.isRightAlignedColumn), []);

    if(initialized) {
        controlRef.current?.render();
    }

    const isBeingEdited = (): boolean => {
        return agGridContext.isCellBeingEdited(props.node, column.name);
    }

    const getControl = () => {
        const controls = column.controls;
        const controlForBoth = controls?.find(control => control.appliesTo === 'both');
        if (controlForBoth) {
            return controlForBoth;
        }
        if (isBeingEdited()) {
            return controls?.find(control => control.appliesTo === 'cellEditor');
        }
        return controls?.find(control => control.appliesTo === 'cellRenderer');
    }

    const getBindings = (): {[name: string]: IBinding} => {
        const bindings: {[name: string]: IBinding} = {
            'value': {
                isStatic: false,
                type: column.dataType as any,
                valueGetter: () => record.getValue(column.name),
                onNotifyOutputChanged: (value) => {
                    record.setValue(column.name, value);
                    grid.pcfContext.factory.requestRender();
                },
                metadata: {
                    attributeName: Attribute.GetNameFromAlias(column.name),
                    enitityName: (() => {
                        const entityAliasName = Attribute.GetLinkedEntityAlias(column.name);
                        if(!entityAliasName) {
                            return grid.dataset.getTargetEntityType()
                        }
                        return grid.dataset.linking.getLinkedEntities().find(x => x.alias === entityAliasName)!.name;
                    })()
                }
            }
        }
        const control = getControl()
        if(control?.bindings) {
            Object.entries(control.bindings).map(([name, binding]) => {
                bindings[name] = {
                    isStatic: true,
                    type: binding.type!,
                    valueGetter: () => binding.value,
                }
            })
        }
        return bindings;
    }

    const createControlInstance = () => {
        return new Control({
            bindings: getBindings(),
            containerElement: containerRef.current!,
            parentPcfContext: grid.pcfContext,
            callbacks: {
                onInit: () => setIsInitialized(true),
                onGetCustomControlName: () => getControl()?.name,
                onIsControlDisabled: () => !isBeingEdited(),
            },
            overrides: {
                onRender: (isCustomControl) => {
                    if(isCustomControl) {
                        return undefined;
                    }
                    return (container, controlProps) => {
                        if(isBeingEdited()) {
                            return ReactDOM.render(React.createElement(TextField), container)
                        }
                        return ReactDOM.render(React.createElement(GridCellLabel, controlProps), container);
                    }
                },
                onUnmount: (isCustomControl) => {
                    //if is custom control or no custom control is about to be mounted
                    if(isCustomControl || !getControl()?.name) {
                        return undefined;
                    }
                    return (container) => {
                        ReactDOM.unmountComponentAtNode(container)
                    }
                },
                onGetProps: () => {
                    return (props) => {
                        return {
                            ...props,
                            context: {
                                ...props.context,
                                mode: Object.create(props.context.mode, {
                                    allocatedHeight: {
                                        value: 41
                                    }
                                }),
                                fluentDesignLanguage: props.context.fluentDesignLanguage ? {
                                    ...props.context.fluentDesignLanguage,
                                    tokenTheme: {
                                        ...props.context.fluentDesignLanguage.tokenTheme,
                                        inputBackground: column.name === 'text' ? record.getValue(column.name) : undefined,
                                        underlined: false,
                                    }
                                } : undefined
                            },
                            parameters: {
                                ...props.parameters,
                                AutoFocus: {
                                    raw: true
                                },
                                EnableNavigation: {
                                    raw: false
                                },
                                IsInlineNewEnabled: {
                                    raw: false
                                },
                                EnableTypeSuffix: {
                                    raw: false
                                }
                            }
                        }
                    }
                }
            }
        })
    }
    React.useEffect(() => {
        controlRef.current = createControlInstance();
        return () => {
            controlRef.current?.unmount();
        }
    }, []);


    return (
        <div className={styles.cellContent} ref={containerRef} />
    )
}
