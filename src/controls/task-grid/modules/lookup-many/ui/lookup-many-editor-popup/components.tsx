/** The replaceable pieces of {@link LookupManyEditorPopup}. */
export interface ILookupManyEditorPopupComponents {
    /** Its ref is what the popup is sized and moved by. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link ILookupManyEditorPopupComponents}. */
export const LookupManyEditorPopupComponents: ILookupManyEditorPopupComponents = {
    onRenderContainer: props => <div {...props} />,
};
