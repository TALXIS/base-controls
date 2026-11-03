import { addons } from 'storybook/manager-api';
import { COLOR_SCHEME, fluentTheme } from './fluentTheme';

//manager-head.html picks its colours by it
document.documentElement.dataset.colorScheme = COLOR_SCHEME;
addons.setConfig({ theme: fluentTheme });
