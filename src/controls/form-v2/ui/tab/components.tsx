/** The replaceable pieces of a tab. */
export interface IFormV2UiTabComponents {
    /** The tab's box, laying its columns out in a grid. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement> & { 'data-id'?: string }) => JSX.Element | null;
}

/** The defaults for {@link IFormV2UiTabComponents}. */
export const FormV2UiTabComponents: IFormV2UiTabComponents = {
    onRender: props => <div {...props} />,
};
