
import { IMultiSelectOptionSet } from './interfaces';
import { useComponent } from '../../hooks';
import { ComboBox } from '@talxis/react-components/dist/components/ComboBox';

export const MultiSelectOptionset = (props: IMultiSelectOptionSet) => {
    const [onNotifyOutputChanged] = useComponent('MultiSelectOptionSet', props);

    return <ComboBox options={[]} />;
};