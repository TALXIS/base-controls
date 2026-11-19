/** The replaceable pieces of the progress bar. */
export interface IFieldListProgressComponents {
    /** Holds the track and the text. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderTrack: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** Its width is the progress. */
    onRenderFill: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderText: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
}

/** The defaults for {@link IFieldListProgressComponents}. */
export const FieldListProgressComponents: IFieldListProgressComponents = {
    onRender: props => <div {...props} />,
    onRenderTrack: props => <div {...props} />,
    onRenderFill: props => <div {...props} />,
    onRenderText: props => <span {...props} />,
};
