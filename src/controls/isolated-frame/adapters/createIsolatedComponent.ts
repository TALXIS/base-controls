import { createElement } from "react";
import ReactDOM from "react-dom";
import { IIsolatedComponentParameters } from "../runtime/IsolatedFrame";
import { IsolatedFrameChannel } from "../runtime/IsolatedFrameChannel";
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
 * The component the page renders: an iframe that loads `options.scripts` and renders what they registered under `key`.
 *
 * @param key Unique within the app; the frame's scripts define the content under it with `defineIsolatedContent`.
 * @param options Pass `scripts` when the content is in a script of its own: the default is the script the library was loaded from.
 */
export const createIsolatedHost = <TProps extends object>(key: string, options?: IIsolatedComponentParameters): React.ComponentType<TProps & IIsolatedComponentProps> => {
    const parameters = { key, ...options };
    return ({ frame, ...contentProps }: TProps & IIsolatedComponentProps) => createElement(IsolatedFrameHost, {
        parameters,
        contentProps,
        className: frame?.className,
        title: frame?.title,
    });
};

/**
 * Defines what frames render under `key`; outside a frame it does nothing.
 *
 * @param key The key the page's `createIsolatedHost` names.
 */
export const defineIsolatedContent = <TProps extends object>(key: string, Content: React.ComponentType<TProps>): void => {
    const channel = new IsolatedFrameChannel(window);
    if (!channel.isFrame()) {
        return;
    }
    channel.add(key, {
        render: (props, container) => ReactDOM.render(createElement(Content, props as TProps), container),
        unmount: container => ReactDOM.unmountComponentAtNode(container),
    });
};

/**
 * Declares both sides from one bundle: the host on the page, the registered content in a frame; call it at module level.
 *
 * @param key Unique within the bundle; the frame finds the content in its own copy of the code by it.
 */
export const createIsolatedComponent = <TProps extends object>(key: string, Content: React.ComponentType<TProps>, parameters?: IIsolatedComponentParameters): React.ComponentType<TProps & IIsolatedComponentProps> => {
    if (new IsolatedFrameChannel(window).isFrame()) {
        defineIsolatedContent(key, Content);
        return ({ frame, ...contentProps }: TProps & IIsolatedComponentProps) => createElement(Content, contentProps as TProps);
    }
    return createIsolatedHost<TProps>(key, parameters);
};
