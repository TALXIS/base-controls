import { useMemo } from 'react'
import { Overlay as OverlayBase } from '../../../loading-overlay-provider/components'
import { getClassNames } from '../../../../utils'
import { getOverlayStyles } from './styles'
import { useDisabledOverlay } from '../../context'

export const Overlay = (props: React.HTMLAttributes<HTMLDivElement>) => {
    const styles = useMemo(() => getOverlayStyles(), []);
    const { message } = useDisabledOverlay();
    return <OverlayBase
        title={message}
        {...props}
        className={getClassNames([styles.overlay, props.className])} />
}