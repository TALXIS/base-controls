import { IButtonProps, IconButton, ISliderProps, Slider } from "@fluentui/react";

/** The replaceable pieces of the zoom slider. */
export interface IGanttUiZoomSliderComponents {
    /** Holds the buttons and the slider between them. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderSlider: (props: ISliderProps) => JSX.Element | null;
    /** The buttons that zoom out and in by a step. */
    onRenderZoomButton: (props: IButtonProps) => JSX.Element | null;
}

/** The defaults for {@link IGanttUiZoomSliderComponents}. */
export const GanttUiZoomSliderComponents: IGanttUiZoomSliderComponents = {
    onRender: props => <div {...props} />,
    onRenderSlider: props => <Slider {...props} />,
    onRenderZoomButton: props => <IconButton {...props} />,
};
