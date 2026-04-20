import { IDataProvider } from '@talxis/client-libraries';
import * as React from 'react';
import { SelectInstance } from 'react-select';
import AsyncSelect from 'react-select/async';
import { AsyncProps } from 'react-select/dist/declarations/src/useAsync';
import { useLocalizationService } from '../../../context';

interface IMultiRecordSelectorProps {
    onSelectionChange: (selectedRecords: ComponentFramework.EntityReference[]) => void;
    dataProvider: IDataProvider;
    container: HTMLElement;
    selectedRecords?: ComponentFramework.EntityReference[];
    onGetRef?: (ref: IMultRecordSelectorRef) => void;
    onMenuToggle?: (isOpen: boolean) => void;
    onOverrideComponentProps?: (props: AsyncProps<ComponentFramework.EntityReference, boolean, any>) => AsyncProps<ComponentFramework.EntityReference, boolean, any>;
}

export interface IMultRecordSelectorRef {
    openMenu: () => void;
}

export const MultiRecordSelector = (props: IMultiRecordSelectorProps) => {
    const { dataProvider, onSelectionChange, selectedRecords = [], container } = props;
    const localizationService = useLocalizationService();
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((p) => p);
    const ref = React.useRef<SelectInstance>(null);

    const onLoadOptions = async (inputValue: string): Promise<ComponentFramework.EntityReference[]> => {
        dataProvider.setSearchQuery(inputValue);
        const records = await dataProvider.refresh();
        return records.map(record => {
            return {
                ...record.getNamedReference(),
                rawData: record.getRawData()
            }
        })
    }

    const openMenu = React.useCallback(() => {
        if (!componentProps.isDisabled) {
            ref.current?.focusInput();
            ref.current?.openMenu('first')
        }
    }, []);

    const onKeyDown = (event: React.KeyboardEvent) => {
        switch (event.key) {
            case 'Enter': {
                ref.current?.openMenu('first');
            }
        }
    }

    const onMenuOpen = (isOpen: boolean) => {
        props.onMenuToggle?.(isOpen);
        const controlElement = ref.current?.controlRef;
        if (isOpen && controlElement) {
            setTimeout(() => {
                controlElement.scrollTop = controlElement.scrollHeight;
            }, 0);
        }
    }

    React.useEffect(() => {
        container.addEventListener('dblclick', openMenu);
        return () => {
            container.removeEventListener('dblclick', openMenu);
        }
    }, []);

    props.onGetRef?.({ openMenu });
    const componentProps = onOverrideComponentProps({
        isMulti: true,
        //@ts-ignore - typings
        ref: ref,
        menuPortalTarget: document.body,
        onKeyDown: onKeyDown,
        openMenuOnClick: false,
        placeholder: '',
        value: selectedRecords,
        menuPlacement: 'auto',
        isClearable: false,
        menuShouldScrollIntoView: false,
        noOptionsMessage: () => localizationService.getLocalizedString('noRecordsFound'),
        loadingMessage: () => localizationService.getLocalizedString('loading'),
        getOptionValue: (record) => record.id.guid,
        getOptionLabel: (record) => record.name,
        onChange: (selectedRecords) => onSelectionChange(selectedRecords as ComponentFramework.EntityReference[]),
        onMenuOpen: () => onMenuOpen(true),
        onBlur: () => onMenuOpen(false),
        loadOptions: onLoadOptions,
        styles: {
            control: (base) => {
                return {
                    ...base,
                    maxHeight: 200,
                    overflow: 'auto',
                    border: 'none',
                    background: 'none',
                    boxShadow: 'none',
                }
            },
        },
        components: {
            IndicatorSeparator: () => <></>,
            DropdownIndicator: () => <></>,
            LoadingIndicator: () => <></>,
        },
    })

    return <AsyncSelect {...componentProps} />
}