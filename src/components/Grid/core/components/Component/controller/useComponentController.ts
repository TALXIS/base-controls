import { useEffect, useMemo,useRef,useState } from "react"
import { IControlProps } from "../Component";
import { Component } from '../model/Component';
import { useGridInstance } from "../../../hooks/useGridInstance";
import { IControl } from "../../../../../../interfaces/context";
import { IGridColumn } from "../../../interfaces/IGridColumn";

interface IControlController {
    column: IGridColumn;
    componentProps: IControl<any, any, any, any>;
}

export const useComponentController = (props: IControlProps): IControlController | undefined => {
    const grid = useGridInstance();
    const component = useMemo(() => new Component(grid), []);
    const [controller, setController] = useState<IControlController>();
    const mountedRef = useRef<boolean>(true);
    
    useEffect(() => {
        (async () => {
            const componentProps = await component.getControlProps(props);
            if(!mountedRef.current) {
                return;
            }
            setController({
                column: props.column,
                componentProps: componentProps
            })
        })();
    }, [props]);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        }
    }, []);

    return controller;
}