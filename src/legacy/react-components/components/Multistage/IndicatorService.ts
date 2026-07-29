import { ACTIVE_INDICATOR_ANIMATION_LENGTH } from "./styles";

export class IndicatorService {
    private _headerProgressRef: React.RefObject<HTMLDivElement>;
    constructor(headerProgressRef: React.RefObject<HTMLDivElement>) {
        this._headerProgressRef = headerProgressRef;
    }

    public setActiveIndicatorPosition(animation?: boolean) {
        const activeElement = this._headerProgressRef.current?.querySelector('[data-current]') as HTMLElement;
        const indicator = this._headerProgressRef.current?.firstElementChild as HTMLElement;
        if(!activeElement) {
            indicator.style.setProperty('--active_indicator_opacity', `0`);
            return;
        }
        indicator.style.setProperty('--active_indicator_opacity', `1`);
        this._setIndicatorBorder();
        if (animation) {
            indicator.style.setProperty('--active_indicator_animation_length', `${ACTIVE_INDICATOR_ANIMATION_LENGTH}s`);
            setTimeout(() => {
                indicator.style.setProperty('--active_indicator_animation_length', `0s`);
            }, ACTIVE_INDICATOR_ANIMATION_LENGTH * 1000);
        }
        indicator.style.setProperty('--left', `${activeElement?.offsetLeft}px`)
    };
    private  _setIndicatorBorder = (): void => {
        const activeElement = this._headerProgressRef.current?.querySelector('[data-current]');
        const lastChild = this._headerProgressRef.current?.lastElementChild;
        const indicator = this._headerProgressRef.current?.firstElementChild as HTMLElement;
        if (activeElement === indicator) {
            indicator.style.setProperty('--active_indicator_border_left', '4px');
            return;
        }
        if (activeElement === lastChild) {
            indicator.style.setProperty('--active_indicator_border_right', '4px');
            return;
        }
        indicator.style.setProperty('--active_indicator_border_left', '0px');
        indicator.style.setProperty('--active_indicator_border_right', '0px');

    };
}