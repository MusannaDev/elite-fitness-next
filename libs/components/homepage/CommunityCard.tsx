import React from 'react';
import Link from 'next/link';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack } from '@mui/material';
import Moment from 'react-moment';
import { BoardArticle } from '../../types/board-article/board-article';
import { BoardArticleCategory } from '../../enums/board-article.enum';

interface CommunityCardProps {
	article: BoardArticle;
	index: number;
	variant: 'featured' | 'grid' | 'row';
}

const CATEGORY_META: Record<BoardArticleCategory, { label: string; icon: string; isCyan: boolean }> = {
	[BoardArticleCategory.NEWS]:      { label: 'News',        icon: '📡', isCyan: false },
	[BoardArticleCategory.FREE]:      { label: 'Discussions', icon: '💬', isCyan: true  },
	[BoardArticleCategory.RECOMMEND]: { label: 'Recommend',   icon: '⚡', isCyan: false },
	[BoardArticleCategory.HUMOR]:     { label: 'Humor',       icon: '🔥', isCyan: true  },
};

const CommunityCard = ({ article, index, variant }: CommunityCardProps) => {
	const device = useDeviceDetect();
	const articleImage = article?.articleImage
		? `${process.env.REACT_APP_API_URL}/${article?.articleImage}`
		: '/img/event.svg';

	const meta = CATEGORY_META[article?.articleCategory] ?? CATEGORY_META[BoardArticleCategory.FREE];
	const href = `/community/detail?articleCategory=${article?.articleCategory}&id=${article?._id}`;

	if (device === 'mobile') {
		return (
			<Link href={href}>
				<Stack className={'cb-row-card'} direction="row" gap={'10px'} alignItems="center">
					<div className={'cb-row-img'} style={{ backgroundImage: `url(${articleImage})` }}>
						<span>{index + 1}</span>
					</div>
					<div className={'cb-row-info'}>
						<strong>{article?.articleTitle}</strong>
						<span className={meta.isCyan ? 'cyan' : ''}>{meta.icon} {meta.label}</span>
					</div>
				</Stack>
			</Link>
		);
	}

	if (variant === 'featured') {
		return (
			<Link href={href}>
				<div className={'cb-featured-card'}>
					<div className={'cb-feat-img'} style={{ backgroundImage: `url(${articleImage})` }}>
						<div className={'cb-feat-overlay'} />
						<div className={'cb-feat-rank'}>{String(index + 1).padStart(2, '0')}</div>
						<div className={`cb-feat-cat ${meta.isCyan ? 'cyan' : ''}`}>{meta.icon} {meta.label}</div>
					</div>
					<div className={'cb-feat-body'}>
						<p className={'cb-feat-title'}>{article?.articleTitle}</p>
						<Stack direction="row" alignItems="center" justifyContent="space-between" mt={'auto'}>
							<span className={'cb-feat-date'}>
								<Moment format="DD MMM YYYY">{article?.createdAt}</Moment>
							</span>
							<Stack direction="row" gap={'12px'} className={'cb-feat-stats'}>
								<span>👁 {article?.articleViews}</span>
								<span>❤️ {article?.articleLikes}</span>
								<span>💬 {article?.articleComments}</span>
							</Stack>
						</Stack>
					</div>
				</div>
			</Link>
		);
	}

	return (
		<Link href={href}>
			<div className={'cb-grid-card'}>
				<div className={'cb-grid-thumb'} style={{ backgroundImage: `url(${articleImage})` }}>
					<span className={'cb-grid-rank'}>{String(index + 1).padStart(2, '0')}</span>
				</div>
				<div className={'cb-grid-body'}>
					<span className={`cb-grid-cat ${meta.isCyan ? 'cyan' : ''}`}>{meta.icon} {meta.label}</span>
					<p className={'cb-grid-title'}>{article?.articleTitle}</p>
					<Stack direction="row" alignItems="center" justifyContent="space-between" className={'cb-grid-footer'}>
						<span className={'cb-grid-date'}>
							<Moment format="DD MMM YY">{article?.createdAt}</Moment>
						</span>
						<Stack direction="row" gap={'8px'} className={'cb-grid-stats'}>
							<span>👁 {article?.articleViews}</span>
							<span>❤️ {article?.articleLikes}</span>
						</Stack>
					</Stack>
				</div>
			</div>
		</Link>
	);
};

export default CommunityCard;