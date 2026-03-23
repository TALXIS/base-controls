import React from "react";

export interface IScrollableContainerComponents {
    Container: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element;
}

export const Container = (props: React.HTMLAttributes<HTMLDivElement>) => {
    return <div {...props} />
}

export const components: IScrollableContainerComponents = {
    Container: Container
}