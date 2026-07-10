import * as React from "react";
import { Tabs } from "../../components";
import { useFormInstance } from "../useFormInstance";
import { FormTab } from "./FormTab";

export const FormTabs: React.FC = () => {
    const form = useFormInstance();
    const tabs = form.getTabs();

    if (tabs.length === 0) {
        return null;
    }

    return (
        <Tabs>
            {tabs.map((tab, tabIndex) => (
                <FormTab
                    key={tab.id ?? tab.name ?? `tab-${tabIndex}`}
                    tab={tab}
                />
            ))}
        </Tabs>
    );
};
