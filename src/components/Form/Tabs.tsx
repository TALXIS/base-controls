import * as React from "react";
import { useFormInstance } from "./form/useFormInstance";
import { useFormUiState } from "./form/useFormUiState";
import { Tab, type IFormTabProps } from "./Tab";

export interface IFormTabsProps {
    id?: string;
    className?: string;
    children?: React.ReactNode;
}

export const Tabs: React.FC<IFormTabsProps> = ({ id, className, children }) => {
    const form = useFormInstance();
    useFormUiState();

    const tabEntries = React.Children.toArray(children)
        .filter((child): child is React.ReactElement<IFormTabProps> => React.isValidElement<IFormTabProps>(child))
        .map((child, index) => ({
            key: String(child.props.name ?? child.props.id ?? child.key ?? `tab-${index}`),
            child,
        }))
        .filter(({ child }) => {
            if (child.props.visible === false) {
                return false;
            }

            if (child.props.name) {
                return form.getTabVisible(child.props.name) !== false;
            }

            return true;
        });
    const [selectedKey, setSelectedKey] = React.useState<string | undefined>(tabEntries[0]?.key);

    const activeTabEntry = React.useMemo(() => {
        if (tabEntries.length === 0) {
            return null;
        }

        const activeName = form.getActiveTabName();
        if (activeName) {
            const matched = tabEntries.find(({ child }) => child.props.name === activeName);
            if (matched) {
                return matched;
            }
        }

        if (selectedKey) {
            const matched = tabEntries.find((entry) => entry.key === selectedKey);
            if (matched) {
                return matched;
            }
        }

        return tabEntries[0];
    }, [form, selectedKey, tabEntries]);

    React.useEffect(() => {
        const nextSelectedKey = activeTabEntry?.key;
        if (nextSelectedKey && nextSelectedKey !== selectedKey) {
            setSelectedKey(nextSelectedKey);
        }
    }, [activeTabEntry, selectedKey]);

    React.useEffect(() => {
        const nextActiveName = activeTabEntry?.child.props.name;
        if (nextActiveName && nextActiveName !== form.getActiveTabName()) {
            form.setActiveTab(nextActiveName);
        }
    }, [activeTabEntry, form]);

    if (!activeTabEntry) {
        return null;
    }

    return (
        <div data-id={id ?? "form-tabs"} className={className}>
            <div role="tablist" aria-orientation="horizontal">
                {tabEntries.map(({ key, child }, index) => {
                    const tabId = child.props.id ?? child.props.name ?? `tab-${index}`;
                    const isSelected = activeTabEntry.key === key;

                    return (
                        <button
                            key={key}
                            type="button"
                            id={`${tabId}-trigger`}
                            role="tab"
                            aria-selected={isSelected}
                            aria-controls={`${tabId}-panel`}
                            onClick={() => {
                                setSelectedKey(key);
                                if (child.props.name) {
                                    form.setActiveTab(child.props.name);
                                }
                            }}
                        >
                            {child.props.label ?? child.props.name ?? tabId}
                        </button>
                    );
                })}
            </div>
            {React.cloneElement(activeTabEntry.child, {
                showLabel: false,
                panelId: `${activeTabEntry.child.props.id ?? activeTabEntry.child.props.name ?? "active-tab"}-panel`,
                triggerId: `${activeTabEntry.child.props.id ?? activeTabEntry.child.props.name ?? "active-tab"}-trigger`,
            })}
        </div>
    );
};
