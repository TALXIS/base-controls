import * as React from "react";

interface ICellErrorBoundaryProps {
    children?: React.ReactNode;
}

interface ICellErrorBoundaryState {
    hasError: boolean;
}

/**
 * Contains a throw inside one cell so it cannot take the grid down with it.
 *
 * Cell content used to render into a React root of its own, which contained a failure as a side effect.
 * Now that it renders inline, the grid needs this on purpose: without it, one bad cell unmounts the whole
 * AG Grid tree.
 */
export class CellErrorBoundary extends React.Component<ICellErrorBoundaryProps, ICellErrorBoundaryState> {
    constructor(props: ICellErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    public static getDerivedStateFromError(): ICellErrorBoundaryState {
        return { hasError: true };
    }

    public componentDidCatch(error: any) {
        console.error('A task grid cell failed to render.', error);
    }

    public render() {
        if (this.state.hasError) {
            //the row keeps its shape; only this cell goes blank
            return null;
        }
        return this.props.children;
    }
}
