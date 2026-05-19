import { IDataProvider } from '@talxis/client-libraries';
import * as React from 'react';
import { SelectInstance } from 'react-select';
import { useLocalizationService } from '../../../context';
import { MultiValueContainer } from './components/multi-value-container/MultiValueContainer';
import { MultiValueRemove } from './components/multi-value-remove/MultiValueRemove';
import { getLookupManyStyles } from './styles';
import { DEFAULT_COMPONENTS, ILookupManyComponents } from './components';
import { LookupManyPropsContext } from './context';

export interface ILookupManyProps {
    dataProvider: IDataProvider;
    container: HTMLElement;
    selectedRecordHeight?: number;
    isDisabled?: boolean;
    selectedRecords?: ComponentFramework.EntityReference[];
    components?: Partial<ILookupManyComponents>;
    onRecordSelect: (selectedRecords: ComponentFramework.EntityReference[]) => void;
    onRecordOpen?: (record: ComponentFramework.EntityReference) => void;
}

export interface ILookupManyRef {
    openMenu: () => void;
}

export const LookupMany = (props: ILookupManyProps) => {
    const { dataProvider, selectedRecords = [], container, isDisabled = false, onRecordSelect, onRecordOpen } = props;
    const components = { ...DEFAULT_COMPONENTS, ...props.components };
    const localizationService = useLocalizationService();
    const ref = React.useRef<SelectInstance>(null);
    const [renderKey, setRenderKey] = React.useState(0);
    const isFirstRenderRef = React.useRef(true);
    const [defaultOptions, setDefaultOptions] = React.useState<boolean>(false);
    const MultiValueLabel = React.useRef(components.onRenderMultiValueLabel);

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
        if (!isDisabled) {
            ref.current?.focusInput();
            ref.current?.openMenu('first')
        }
    }, [isDisabled]);

    const onKeyDown = (event: React.KeyboardEvent) => {
        switch (event.key) {
            case 'Enter': {
                ref.current?.openMenu('first');
            }
        }
    }

    const onMenuOpen = (isOpen: boolean) => {
        const controlElement = ref.current?.controlRef;
        if (isOpen && !defaultOptions) {
            setDefaultOptions(true);
            setRenderKey(prev => prev + 1);
        }
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

    React.useEffect(() => {
        if (!isFirstRenderRef.current) {
            ref.current?.openMenu('first');
        }
        isFirstRenderRef.current = false;
    }, [renderKey]);

    return <LookupManyPropsContext.Provider value={props}>
        <React.Fragment key={renderKey}>
            {components.onRenderSelect({
                //@ts-ignore
                ref: ref,
                isMulti: true,
                menuPortalTarget: document.body,
                openMenuOnClick: false,
                isDisabled: isDisabled,
                placeholder: '',
                value: selectedRecords,
                menuPlacement: 'auto',
                isClearable: false,
                menuShouldScrollIntoView: false,
                defaultOptions: defaultOptions,
                styles: getLookupManyStyles(),
                components: {
                    IndicatorSeparator: () => <></>,
                    DropdownIndicator: () => <></>,
                    LoadingIndicator: () => <></>,
                    MultiValueContainer: MultiValueContainer,
                    MultiValueRemove: MultiValueRemove,
                    MultiValueLabel: MultiValueLabel.current
                },
                onKeyDown: onKeyDown,
                noOptionsMessage: () => localizationService.getLocalizedString('noRecordsFound'),
                loadingMessage: () => localizationService.getLocalizedString('loading'),
                getOptionValue: (record) => record.id.guid,
                getOptionLabel: (record) => record.name,
                onChange: (selectedRecords) => onRecordSelect(selectedRecords as ComponentFramework.EntityReference[]),
                onMenuOpen: () => onMenuOpen(true),
                onBlur: () => onMenuOpen(false),
                loadOptions: onLoadOptions,
                onNavigate: onRecordOpen
            })}
        </React.Fragment>
    </LookupManyPropsContext.Provider>
}
