
import { IMultiSelectOptionSet } from './interfaces';
import { useComponent } from '../../hooks';
import { ComboBox } from '@talxis/react-components/dist/components/ComboBox';

export const MultiSelectOptionset = (props: IMultiSelectOptionSet) => {
    const [onNotifyOutputChanged] = useComponent(props);

    return <ComboBox options={[]} />;
};