import { Dropdown, IDropdownOption } from "@fluentui/react";
import { useMemo } from "react";
import { IMapProviderPickerProps } from "../components/components";
import { getMapProviderPickerStyles } from "./styles";

/**
 * Chrome the Map control renders over the map when there is more than one provider. Deliberately not part of
 * the provider contract - a map vendor should not have to know it can be swapped. Positioned by the overlay
 * it sits in, alongside the rest of the control's chrome.
 */
export const MapProviderPicker = (props: IMapProviderPickerProps) => {
    const { theme } = props;
    const styles = useMemo(() => getMapProviderPickerStyles(theme), [theme]);
    const options = useMemo<IDropdownOption[]>(() => props.options.map((option) => ({
        key: option.id,
        text: option.label ?? option.id
    })), [props.options]);

    return (
        <div className={styles.root}>
            <Dropdown
                ariaLabel={props.label}
                title={props.label}
                options={options}
                //null, not undefined, so the dropdown stays controlled while the selection is resolving
                selectedKey={props.selectedId ?? null}
                onChange={(_event, option) => option && props.onChange(`${option.key}`)} />
        </div>
    );
};
