import { mergeStyleSets } from "@fluentui/react";

export const getTaskCommandsCellStyles = () => mergeStyleSets({
    commands: {
        '&&': { flex: '1 1 100%', width: '100%' },
        '.ms-OverflowSet-item, .ms-TooltipHost, .ms-CommandBarItem-link': { flexGrow: 1, width: '100%' },
    },
});
