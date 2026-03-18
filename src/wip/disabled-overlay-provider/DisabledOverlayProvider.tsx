import { ILoadingOptions, LoadingOverlayProvider } from "../loading-overlay-provider";
import { components as defaultComponents, IDisabledOverlayProviderComponents } from './components';

interface IDisabledOptions extends ILoadingOptions {}

export interface IDisabledOverlayProviderProps {
    options?: IDisabledOptions;
    children?: React.ReactNode;
    components?: Partial<IDisabledOverlayProviderComponents>;
}

export const DisabledOverlayProvider = (props: IDisabledOverlayProviderProps) => {
    const {options} = props;
    const components = { ...defaultComponents, ...props.components }

    return <LoadingOverlayProvider options={options}  components={{
        Spinner: () => <></>,
        Overlay: components.Overlay
    }}>
        {props.children}
    </LoadingOverlayProvider>
}