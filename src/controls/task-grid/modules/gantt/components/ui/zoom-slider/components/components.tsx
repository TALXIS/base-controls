import { ISliderProps, Slider } from "@fluentui/react";

export interface IZoomSliderComponents {
    onRenderSlider: (props: ISliderProps) => JSX.Element
}

export const ZoomSliderComponents: IZoomSliderComponents = {
    onRenderSlider: (props) => <Slider {...props} />
};