import { CommandBarButton, IButtonProps } from "@fluentui/react";

/** The replaceable pieces of {@link TemplateList}. */
export interface ITemplateListComponents {
    /** The button that picks one template. */
    onRenderTemplate: (props: IButtonProps) => JSX.Element | null;
}

/** The defaults for {@link ITemplateListComponents}. */
export const TemplateListComponents: ITemplateListComponents = {
    onRenderTemplate: props => <CommandBarButton {...props} />,
};
