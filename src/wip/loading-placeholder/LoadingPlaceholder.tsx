import { useEffect } from "react";
import { ILoadingPlaceholderComponents } from "./components";
import { components as defaultComponents } from "./components";
import React from "react";

export interface ILoadingPlaceholderProps {
    loadingPromise: Promise<any>
    components?: Partial<ILoadingPlaceholderComponents>;
    children?: React.ReactNode;
}

export const LoadingPlaceholder = (props: ILoadingPlaceholderProps) => {
    const components = { ...defaultComponents, ...props.components };
    const [isPromiseResolved, setIsPromiseResolved] = React.useState(false);

    const awaitPromise = async () => {
        await props.loadingPromise;
        setIsPromiseResolved(true);
    }
    useEffect(() => {
        awaitPromise();
    }, []);

    return <>
        {isPromiseResolved && props.children}
        {!isPromiseResolved && <components.Spinner />}
    </>
}