import { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "../error-handling/error-boundary";
import { IIsolatedFrameParameters, IsolatedFrame } from "./IsolatedFrame";
import { getIsolatedFrameStyles } from "./styles";

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

    return <ErrorBoundary error={loadError} onRetry={onRetry}>
        <IsolatedFrameView key={attempt} {...props} onLoadFailed={setLoadError} />
    </ErrorBoundary>;
};

//remounted on every retry, so each attempt starts with a fresh iframe
const IsolatedFrameView = (props: IIsolatedFrameViewProps) => {
    const styles = useMemo(() => getIsolatedFrameStyles(), []);
    const frame = useMemo(() => new IsolatedFrame(props.parameters), []);

    useEffect(() => frame.render(props.contentProps));
    useEffect(() => () => frame.destroy(), []);

    const onIframe = useCallback(async (iframe: HTMLIFrameElement | null) => {
        if (!iframe) {
            return;
        }
        try {
            await frame.load(iframe);
        }
        catch (error) {
            props.onLoadFailed(error);
        }
    }, []);

    return <iframe ref={onIframe} title={props.title} className={props.className ? `${styles.frame} ${props.className}` : styles.frame} />;
};
