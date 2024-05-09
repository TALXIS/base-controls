import { useEffect, useMemo,useRef,useState } from "react"
import { IComponentProps } from "../Component";
import { Component } from '../model/Component';
import { useGridInstance } from "../../../hooks/useGridInstance";
import { IComponent } from "../../../../../../interfaces/context";

export const useComponentController = (props: IComponentProps): IComponent<any, any, any> | undefined => {
    const grid = useGridInstance();
    const component = useMemo(() => new Component(grid), []);
    const [controlProps, setControlProps] = useState<IComponent<any, any, any>>();
    const mountedRef = useRef<boolean>(true);
    useEffect(() => {
        (async () => {
            const _props = await component.getControlProps(props);
            if(!mountedRef.current) {
                return;
            }
            setControlProps(_props);
        })();
    }, [props]);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        }
    }, []);

    return controlProps;
}