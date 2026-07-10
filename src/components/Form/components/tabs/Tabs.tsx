import * as React from "react";
import { TabsContext } from "./context";
import { FormContext } from "../../form/FormContext";
import { useFormInstance } from "../../form/useFormInstance";
import { useFormUiState } from "../../form/useFormUiState";

export interface IFormTabsProps {
    children?: React.ReactNode;
}

interface ITabEntryMetadata {
    id?: string;
    name?: string;
    label?: React.ReactNode;
    visible?: boolean;
}

type TabChildProps = ITabEntryMetadata & {
    tab?: ITabEntryMetadata;
};

export const Tabs: React.FC<IFormTabsProps> = ({ children }) => {
    const formContext = React.useContext(FormContext);
    if (!formContext) {
        throw new Error("[Form] Tabs must be rendered inside Form.");
    }

    const form = useFormInstance();
    useFormUiState();

    const tabEntries = React.Children.toArray(children)
        .filter((child): child is React.ReactElement<TabChildProps> => React.isValidElement<TabChildProps>(child))
        .map((child, index) => ({
            metadata: getTabEntryMetadata(child.props),
            key: getTabEntryKey(getTabEntryMetadata(child.props), index),
            child,
        }))
        .filter(({ metadata }) => {
            if (metadata.visible === false) {
                return false;
            }

            if (metadata.name) {
                return form.getTabVisible(metadata.name) !== false;
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
            const matched = tabEntries.find(({ metadata }) => metadata.name === activeName);
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
        const nextActiveName = activeTabEntry?.metadata.name;
        if (nextActiveName && nextActiveName !== form.getActiveTabName()) {
            form.setActiveTab(nextActiveName);
        }
    }, [activeTabEntry, form]);

    if (!activeTabEntry) {
        return null;
    }

    return (
        <TabsContext.Provider
            value={{
                activeTabId: activeTabEntry.metadata.id,
                activeTabName: activeTabEntry.metadata.name,
            }}
        >
            <div data-id="form-tabs">
                <div role="tablist" aria-orientation="horizontal">
                    {tabEntries.map(({ key, metadata }, index) => {
                        const tabId = metadata.id ?? metadata.name ?? `tab-${index}`;
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
                                    if (metadata.name) {
                                        form.setActiveTab(metadata.name);
                                    }
                                }}
                            >
                                {metadata.label ?? metadata.name ?? tabId}
                            </button>
                        );
                    })}
                </div>
                {tabEntries.map(({ key, child }) => (
                    <React.Fragment key={key}>{child}</React.Fragment>
                ))}
            </div>
        </TabsContext.Provider>
    );
};

const getTabEntryMetadata = (props: TabChildProps): ITabEntryMetadata => {
    if (props.tab) {
        return {
            id: props.tab.id,
            name: props.tab.name,
            label: props.tab.label,
            visible: props.tab.visible,
        };
    }

    return {
        id: props.id,
        name: props.name,
        label: props.label,
        visible: props.visible,
    };
};

const getTabEntryKey = (metadata: ITabEntryMetadata, index: number): string => {
    return String(metadata.name ?? metadata.id ?? `tab-${index}`);
};
