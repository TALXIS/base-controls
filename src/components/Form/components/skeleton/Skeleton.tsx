import React, { useMemo } from 'react';
import { Shimmer, ShimmerElementType, useTheme } from '@fluentui/react';
import { getSkeletonStyles } from './styles';

export interface ISkeletonProps {
	sectionCount?: number;
	fieldsPerSection?: number;
	showNotifications?: boolean;
	showRibbon?: boolean;
}

export const Skeleton = (props: ISkeletonProps) => {
	const theme = useTheme();
	const styles = useMemo(() => getSkeletonStyles(theme), [theme]);
	const {
		sectionCount = 3,
		fieldsPerSection = 4,
		showNotifications = true,
		showRibbon = true,
	} = props;

	const sections = Array.from({ length: sectionCount }, (_, sectionIndex) => sectionIndex);
	const fields = Array.from({ length: fieldsPerSection }, (_, fieldIndex) => fieldIndex);

	return (
		<div className={styles.root}>
			{showNotifications && (
				<div className={styles.notifications}>
					<Shimmer
						className={styles.notification}
						shimmerElements={[{ type: ShimmerElementType.line, width: '100%', height: 40 }]}
					/>
					<Shimmer
						className={styles.notification}
						shimmerElements={[{ type: ShimmerElementType.line, width: '72%', height: 32 }]}
					/>
				</div>
			)}
			{showRibbon && (
				<div className={styles.ribbon}>
					<Shimmer
						shimmerElements={[
							{ type: ShimmerElementType.line, width: 96, height: 28 },
							{ type: ShimmerElementType.gap, width: 12 },
							{ type: ShimmerElementType.line, width: 96, height: 28 },
							{ type: ShimmerElementType.gap, width: 12 },
							{ type: ShimmerElementType.line, width: 120, height: 28 },
						]}
					/>
				</div>
			)}
			<div className={styles.body}>
				{sections.map((sectionIndex) => (
					<div key={sectionIndex} className={styles.section}>
						<div className={styles.sectionHeader}>
							<Shimmer
								shimmerElements={[{ type: ShimmerElementType.line, width: 180, height: 24 }]}
							/>
						</div>
						<div className={styles.sectionContent}>
							{fields.map((fieldIndex) => (
								<div key={fieldIndex} className={styles.field}>
									<Shimmer
										className={styles.fieldLabel}
										shimmerElements={[{ type: ShimmerElementType.line, width: '48%', height: 16 }]}
									/>
									<Shimmer
										className={styles.fieldControl}
										shimmerElements={[{ type: ShimmerElementType.line, width: '100%', height: 34 }]}
									/>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
