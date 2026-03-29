import React, { useState } from 'react';
import Link from 'next/link';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Typography } from '@mui/material';
import CommunityCard from './CommunityCard';
import { BoardArticle } from '../../types/board-article/board-article';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { useQuery } from '@apollo/client';
import { T } from '../../types/common';
import { BoardArticleCategory } from '../../enums/board-article.enum';

const TABS = [
	{ key: BoardArticleCategory.NEWS,      label: 'News',        icon: '📡' },
	{ key: BoardArticleCategory.FREE,      label: 'Discussions', icon: '💬' },
	{ key: BoardArticleCategory.RECOMMEND, label: 'Recommend',   icon: '⚡' },
	{ key: BoardArticleCategory.HUMOR,     label: 'Humor',       icon: '🔥' },
];

const CommunityBoards = () => {
	const device = useDeviceDetect();
	const [activeTab, setActiveTab] = useState<BoardArticleCategory>(BoardArticleCategory.NEWS);
	const [searchCommunity] = useState({ page: 1, sort: 'articleViews', direction: 'DESC' });

	const [newsArticles,      setNewsArticles]      = useState<BoardArticle[]>([]);
	const [freeArticles,      setFreeArticles]      = useState<BoardArticle[]>([]);
	const [recommendArticles, setRecommendArticles] = useState<BoardArticle[]>([]);
	const [humorArticles,     setHumorArticles]     = useState<BoardArticle[]>([]);

	useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: { ...searchCommunity, limit: 7, search: { articleCategory: BoardArticleCategory.NEWS } } },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => setNewsArticles(data?.getBoardArticles?.list),
	});
	useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: { ...searchCommunity, limit: 7, search: { articleCategory: BoardArticleCategory.FREE } } },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => setFreeArticles(data?.getBoardArticles?.list),
	});
	useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: { ...searchCommunity, limit: 7, search: { articleCategory: BoardArticleCategory.RECOMMEND } } },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => setRecommendArticles(data?.getBoardArticles?.list),
	});
	useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: { ...searchCommunity, limit: 7, search: { articleCategory: BoardArticleCategory.HUMOR } } },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => setHumorArticles(data?.getBoardArticles?.list),
	});

	const articlesMap: Record<BoardArticleCategory, BoardArticle[]> = {
		[BoardArticleCategory.NEWS]:      newsArticles,
		[BoardArticleCategory.FREE]:      freeArticles,
		[BoardArticleCategory.RECOMMEND]: recommendArticles,
		[BoardArticleCategory.HUMOR]:     humorArticles,
	};

	const activeArticles = articlesMap[activeTab] ?? [];
	const featured       = activeArticles[0];
	const rest           = activeArticles.slice(1);

	if (device === 'mobile') {
		return (
			<Stack className={'community-board'}>
				<Stack className={'container'}>
					<Typography className={'cb-title'}>FITNESS COMMUNITY</Typography>
					<Stack className={'cb-tabs-mobile'} direction="row" flexWrap="wrap" gap={'8px'}>
						{TABS.map((t) => (
							<button
								key={t.key}
								className={`cb-tab-mobile ${activeTab === t.key ? 'active' : ''}`}
								onClick={() => setActiveTab(t.key)}
							>
								<span>{t.icon}</span> {t.label}
							</button>
						))}
					</Stack>
					<Stack className={'cb-mobile-list'} gap={'8px'} mt={'16px'}>
						{activeArticles.map((article, idx) => (
							<CommunityCard key={article._id} article={article} index={idx} variant="row" />
						))}
					</Stack>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className={'community-board'}>
			<Stack className={'container'}>
				{/* Header */}
				<Stack className={'cb-header'} direction="row" alignItems="flex-end" justifyContent="space-between" mb={'28px'}>
					<Stack gap={'6px'}>
						<span className={'cb-eyebrow'}>Community Hub</span>
						<Typography className={'cb-title'}>FITNESS COMMUNITY</Typography>
					</Stack>
					<Link href={`/community?articleCategory=${activeTab}`} className={'cb-view-all'}>
						View All <span>→</span>
					</Link>
				</Stack>

				{/* Tab Bar */}
				<Stack className={'cb-tab-bar'} direction="row" gap={'4px'} mb={'24px'}>
					{TABS.map((t) => (
						<button
							key={t.key}
							className={`cb-tab ${activeTab === t.key ? 'active' : ''}`}
							onClick={() => setActiveTab(t.key)}
						>
							<span className={'cb-tab-icon'}>{t.icon}</span>
							<span className={'cb-tab-label'}>{t.label}</span>
						</button>
					))}
				</Stack>

				{/* Content */}
				<Stack direction="row" gap={'20px'} alignItems="flex-start">
					{/* Featured */}
					{featured && (
						<div className={'cb-featured'}>
							<CommunityCard article={featured} index={0} variant="featured" />
						</div>
					)}

					{/* Grid */}
					<Stack className={'cb-grid'} gap={'10px'} flex={1}>
						{rest.map((article, idx) => (
							<CommunityCard key={article._id} article={article} index={idx + 1} variant="grid" />
						))}
					</Stack>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default CommunityBoards;