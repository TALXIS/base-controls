import { useEffect, useMemo, useState } from "react";
import { ErrorMessageBoundary } from "@ui";
import { IIsolatedFrameParameters, IsolatedFrame } from "../runtime/IsolatedFrame";
import { IsolatedFrameUiFrame } from "../ui/IsolatedFrameUiFrame";

export interface IIsolatedFrameHostProps {
    parameters: IIsolatedFrameParameters;
    contentProps: object;
    className?: string;
    title?: string;
}

interface IIsolatedFrameViewProps extends IIsolatedFrameHostProps {
    onLoadFailed: (error: unknown) => void;
}

/** Draws the iframe an `IsolatedFrame` runs in, and shows in its place why it failed to load. */
export const IsolatedFrameHost = (props: IIsolatedFrameHostProps) => {
    const [loadError, setLoadError] = useState<unknown>();
    const [attempt, setAttempt] = useState(0);

    const onRetry = () => {
        setLoadError(undefined);
        setAttempt(attempt => attempt + 1);
    };

    return <ErrorMessageBoundary error={loadError} onRetry={onRetry}>
        <IsolatedFrameView key={attempt} {...props} onLoadFailed={setLoadError} />
    </ErrorMessageBoundary>;
};

//remounted on every retry, so each attempt starts with a fresh iframe
const IsolatedFrameView = (props: IIsolatedFrameViewProps) => {
    const frame = useMemo(() => new IsolatedFrame(props.parameters), []);

    useEffect(() => frame.render(props.contentProps));
    useEffect(() => () => frame.destroy(), []);

    const onLoad = async (iframe: HTMLIFrameElement) => {
        try {
            await frame.load(iframe);
        }
        catch (error) {
            props.onLoadFailed(error);
        }
    };

    return <IsolatedFrameUiFrame onLoad={onLoad} title={props.title} className={props.className} />;
};
