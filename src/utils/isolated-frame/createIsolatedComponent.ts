import { createElement } from "react";
import ReactDOM from "react-dom";
import { IIsolatedComponentOptions } from "./IsolatedFrame";
import { IsolatedFrameChannel } from "./IsolatedFrameChannel";
import { IsolatedFrameHost } from "./IsolatedFrameHost";

/** How one frame is drawn, given as its `frame` prop. */
export interface IIsolatedFrameProps {
    /** Put on the iframe, which fills its parent by default. */
    className?: string;
    /** The frame's accessible name. */
    title?: string;
}

export interface IIsolatedComponentProps {
    /** The frame's own settings; every other prop goes to the content. */
    frame?: IIsolatedFrameProps;
}

/**
 * Declares a component that runs inside its own iframe; call it at module level.
 *
 * @param key Unique within the bundle; the frame finds the content in its own copy of the code by it.
 */
export const createIsolatedComponent = <TProps extends object>(key: string, Content: React.ComponentType<TProps>, options?: IIsolatedComponentOptions): React.ComponentType<TProps & IIsolatedComponentProps> => {
    const channel = new IsolatedFrameChannel(window);
    if (channel.isFrame()) {
        channel.register(key, {
            render: (props, container) => ReactDOM.render(createElement(Content, props as TProps), container),
            unmount: container => ReactDOM.unmountComponentAtNode(container),
        });
        return ({ frame, ...contentProps }: TProps & IIsolatedComponentProps) => createElement(Content, contentProps as TProps);
    }
    const parameters = { key, ...options };
    return ({ frame, ...contentProps }: TProps & IIsolatedComponentProps) => createElement(IsolatedFrameHost, {
        parameters,
        contentProps,
        className: frame?.className,
        title: frame?.title,
    });
};
