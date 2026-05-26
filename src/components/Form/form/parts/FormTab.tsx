import * as React from "react";
import { useFormInstance } from "../useFormInstance";
import { useFormUiState } from "../useFormUiState";
import { FormSection } from "./FormSection";

/**
 * Renders the currently-active tab. MVP: always the first tab.
 */
export const FormTab: React.FC = () => {
    const form = useFormInstance();
    useFormUiState();

    const tab = form.getActiveTab();
    if (!tab) {
        return null;
    }

    if (form.getTabVisible(tab.name ?? '') === false) {
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
                                tabName={tab.name ?? ''}
                            />
                        ))}
                    </div>
                );
            })}
        </div>
    );
};
