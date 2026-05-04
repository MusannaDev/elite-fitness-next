export interface EngagementMetrics {
	likes?: number | null;
	views?: number | null;
	comments?: number | null;
	rank?: number | null;
}

const toSafeNumber = (value?: number | null): number => {
	if (typeof value !== 'number' || Number.isNaN(value)) return 0;
	return value;
};

const getEngagementScore = (metrics: EngagementMetrics): number => {
	return toSafeNumber(metrics.likes) + toSafeNumber(metrics.views) + toSafeNumber(metrics.comments);
};

export const sortByEngagement = <T>(
	list: T[] = [],
	pick: (item: T) => EngagementMetrics,
	limit?: number,
): T[] => {
	const sorted = [...list].sort((a, b) => {
		const aMetrics = pick(a);
		const bMetrics = pick(b);

		const scoreDiff = getEngagementScore(bMetrics) - getEngagementScore(aMetrics);
		if (scoreDiff !== 0) return scoreDiff;

		const likesDiff = toSafeNumber(bMetrics.likes) - toSafeNumber(aMetrics.likes);
		if (likesDiff !== 0) return likesDiff;

		const viewsDiff = toSafeNumber(bMetrics.views) - toSafeNumber(aMetrics.views);
		if (viewsDiff !== 0) return viewsDiff;

		const commentsDiff = toSafeNumber(bMetrics.comments) - toSafeNumber(aMetrics.comments);
		if (commentsDiff !== 0) return commentsDiff;

		return toSafeNumber(bMetrics.rank) - toSafeNumber(aMetrics.rank);
	});

	return typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
};
