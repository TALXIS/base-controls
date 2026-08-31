import * as React from "react";
import { ITemplateComponents } from "../interfaces";
import { TemplateSelector } from "./template-selector";

/** The defaults for {@link ITemplateComponents}. */
export const TemplateComponents: ITemplateComponents = {
    onRenderTemplateSelector: (props) => <TemplateSelector {...props} />,
};
