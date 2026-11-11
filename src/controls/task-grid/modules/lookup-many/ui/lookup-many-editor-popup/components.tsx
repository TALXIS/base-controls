/** The replaceable pieces of {@link LookupManyEditorPopup}. */
export interface ILookupManyUiEditorPopupComponents {
    /** Its ref is what the popup is sized and moved by. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link ILookupManyUiEditorPopupComponents}. */
export const LookupManyUiEditorPopupComponents: ILookupManyUiEditorPopupComponents = {
    onRender: props => <div {...props} />,
};
