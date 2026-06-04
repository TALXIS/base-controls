import { IDataProvider } from '@talxis/client-libraries';
import * as React from 'react';
import { useLocalizationService } from '../../../context';
import { MultiValueRemove } from './components/multi-value-remove/MultiValueRemove';
import { LookupManyComponents, ILookupManyComponents } from './components/components';
import { LookupManyPropsContext } from './context';



export interface ILookupManyProps {
    dataProvider: IDataProvider;
    selectedRecordHeight?: number;
    isDisabled?: boolean;
    selectedRecords?: ComponentFramework.EntityReference[];
    components?: Partial<ILookupManyComponents>;
    onRecordSelect?: (selectedRecords: ComponentFramework.EntityReference[]) => void;
    onRecordOpen?: (record: ComponentFramework.EntityReference) => void;
}

//can be used as base for new lookup (is task grid independent)

export const LookupMany = (props: ILookupManyProps) => {
    const { dataProvider, selectedRecords = [], isDisabled = false, onRecordSelect, onRecordOpen } = props;
    const components = { ...LookupManyComponents, ...props.components };
    const defaultOptionsPromiseRef = React.useRef<Promise<any> | null>(null);
    const defaultOptionsResolveRef = React.useRef<any>(null);
    const localizationService = useLocalizationService();
    const hasBeenUnmountedRef = React.useRef(false);
    const MultiValueContainerComponent = React.useRef(components.onRenderMultiValueContainer);
    const MultiValueLabel = React.useRef(components.onRenderMultiValueLabel);
    const Menu = React.useRef(components.onRenderMenu);
    const Option = React.useRef(components.onRenderOption);

    const onLoadOptions = async (inputValue: string): Promise<ComponentFramework.EntityReference[]> => {
        if (!defaultOptionsPromiseRef.current) {
            defaultOptionsPromiseRef.current = new Promise((resolve) => {
                defaultOptionsResolveRef.current = resolve;
            });
        }
        await defaultOptionsPromiseRef.current;
        if(hasBeenUnmountedRef.current) return [];
        dataProvider.setSearchQuery(inputValue);
        const records = await dataProvider.refresh();
        return records.map(record => {
            return {
                ...record.getNamedReference(),
                rawData: record.getRawData()
            }
        })
    }

    //resolve the promise so initial load starts
    const onFocus = () => {
        setTimeout(() => {
            defaultOptionsResolveRef.current?.();
        }, 0);
    }

    React.useEffect(() => {
        return () => {
            hasBeenUnmountedRef.current = true;
            defaultOptionsResolveRef.current?.();
        }
    }, []);


    return <LookupManyPropsContext.Provider value={props}>
        {components.onRenderSelect({
            isMulti: true,
            isDisabled: isDisabled,
            menuPortalTarget: document.body,
            value: selectedRecords,
            menuPlacement: 'auto',
            placeholder: '',
            isClearable: false,
            menuShouldScrollIntoView: false,
            closeMenuOnSelect: false,
            //@ts-ignore
            defaultOptions: true,
            components: {
                IndicatorSeparator: () => <></>,
                DropdownIndicator: () => <></>,
                LoadingIndicator: () => <></>,
                MultiValueContainer: MultiValueContainerComponent.current,
                MultiValueRemove: MultiValueRemove,
                MultiValueLabel: MultiValueLabel.current,
                Option: Option.current,
                Menu: Menu.current
            },

            noOptionsMessage: () => localizationService.getLocalizedString('noRecordsFound'),
            loadingMessage: () => localizationService.getLocalizedString('loading'),
            getOptionValue: (record) => record.id.guid,
            getOptionLabel: (record) => record.name,
            onChange: (selectedRecords) => onRecordSelect?.(selectedRecords as ComponentFramework.EntityReference[]),
            onFocus: onFocus,
            loadOptions: onLoadOptions,
            onNavigate: onRecordOpen
        })}
    </LookupManyPropsContext.Provider>
}
