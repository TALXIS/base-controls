import * as React from "react";
import { RecordSelector } from "@components/TaskGrid/components/grid/record-selector";
import { useServices } from "@components/TaskGrid/context";
import { ITemplateSelectorProps } from "../../interfaces";

/**
 * The template picker, rendered inside the *New* and per-row add-task submenus. Wraps the generic
 * `RecordSelector` over this grid's template provider.
 */
export const TemplateSelector = (props: ITemplateSelectorProps) => {
    const provider = useServices().get('templatesModule').provider;

    return <RecordSelector
        provider={provider}
        onRenderRecord={(recordProps, defaultRender) => defaultRender({
            ...recordProps,
            iconProps: { iconName: 'AddToShoppingList' },
        })}
        onRecordSelected={props.onTemplateSelected} />
}
