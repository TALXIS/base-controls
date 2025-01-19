import React, { useRef, useState } from 'react';
import { NestedControl } from './NestedControl';
import { INestedControlRenderer, INestedControlRendererComponentProps } from './interfaces';
import { TextField } from '../TextField';
import { IControl } from '../../interfaces';
import { Decimal } from '../Decimal';
import { Duration } from '../Duration';
import { TwoOptions } from '../TwoOptions';
import { DateTime } from '../DateTime';
import { MultiSelectOptionSet } from '../MultiSelectOptionSet';
import { Lookup } from '../Lookup';
import { OptionSet } from '../OptionSet';
import { GridCellRenderer } from '../GridCellRenderer/GridCellRenderer';
import { BaseControls } from '../../utils';

export const NestedControlRenderer = (__props: INestedControlRenderer) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const controlRef = useRef<NestedControl>();
    const shouldRenderBaseControlRef = useRef<boolean>(false);
    const [initialized, setIsInitialized] = useState(false);
    const propsRef = useRef<INestedControlRenderer>({} as any);
    propsRef.current = __props;
    const onOverrideComponentProps = __props.onOverrideComponentProps ?? ((props) => props);

    const componentPropsRef = useRef<INestedControlRendererComponentProps>(onOverrideComponentProps({
        onGetProps: () => { return (props) => props },
        onOverrideBaseControlProps: (props) => props
    }))

    if (initialized) {
        controlRef.current?.render();
    }

    const renderBaseControl = (controlProps: IControl<any, any, any, any>) => {
        switch (propsRef.current.parameters.ControlName) {
            case 'TextField':
                return <TextField {...controlProps} />
            case 'OptionSet':
                return <OptionSet {...controlProps} />
            case 'Lookup':
                return <Lookup {...controlProps} />
            case 'MultiSelectOptionSet':
                return <MultiSelectOptionSet {...controlProps} />
            case 'TwoOptions':
                return <TwoOptions {...controlProps} />
            case 'DateTime':
                return <DateTime {...controlProps} />
            case 'Decimal':
                return <Decimal {...controlProps} />
            case 'Duration':
                return <Duration {...controlProps} />;
            case 'GridCellRenderer':
                return <GridCellRenderer {...controlProps} />
            default:
                return null;
        }
    };
    const createControlInstance = () => {
        return new NestedControl({
            containerElement: containerRef.current!,
            parentPcfContext: propsRef.current.context,
            onGetControlName: () => propsRef.current.parameters.ControlName,
            onGetBindings: () => {
                return propsRef.current.parameters.Bindings;
            },
            callbacks: {
                onInit: () => setIsInitialized(true),
                onGetControlStates: () => propsRef.current.parameters.ControlStates
            },
            overrides: {
                onGetProps: componentPropsRef.current.onGetProps,
                onRender: () => {
                    if(BaseControls.IsBaseControl(propsRef.current.parameters.ControlName)) {
                        return () => shouldRenderBaseControlRef.current = true;
                    }
                    return undefined;
                },
                onUnmount: () => {
                    if(BaseControls.IsBaseControl(propsRef.current.parameters.ControlName)) {
                        return () => shouldRenderBaseControlRef.current = false;
                    }
                    return undefined;
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
        <div className={componentPropsRef.current.rootClassName} ref={containerRef}>
            {initialized && shouldRenderBaseControlRef.current && renderBaseControl(controlRef.current!.getProps())}
        </div>
    )
}
