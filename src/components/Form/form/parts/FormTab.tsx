import * as React from "react";
import { useFormInstance } from "../useFormInstance";
import { FormSection } from "./FormSection";

/**
 * Renders the currently-active tab. MVP: always the first tab.
 */
export const FormTab: React.FC = () => {
    const form = useFormInstance();
    const tab = form.getActiveTab();
    if (!tab) {
        return null;
    }
    const columns = tab.columns?.column ?? [];
    const tabLabel = form.resolveLocalizedLabel(tab.labels, tab.name ?? "");
    const showLabel = tab.showlabel !== false;
    return (
        <div data-id={`tab-${tab.name ?? tab.id ?? ''}`}>
            {showLabel && tabLabel && (
                <h3 data-id={`tab-label-${tab.name ?? tab.id ?? ''}`}>{tabLabel}</h3>
            )}
            {columns.map((column: any, columnIndex: number) => {
                const sections = column.sections?.section ?? [];
                return (
                    <div key={columnIndex} data-id={`tab-column-${columnIndex}`}>
                        {sections.map((section: any, sectionIndex: number) => (
                            <FormSection
                                key={section.id ?? section.name ?? sectionIndex}
                                section={section}
                            />
                        ))}
                    </div>
                );
            })}
        </div>
    );
};
;
