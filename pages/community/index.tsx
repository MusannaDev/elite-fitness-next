import React, { useEffect, useState } from 'react';
import { useTheme } from '../../libs/context/ThemeContext';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Button, Pagination } from '@mui/material';
import CommunityCard from '../../libs/components/common/CommunityCard';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { Messages } from '../../libs/config';
import { userVar } from '../../apollo/store';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const NAV_TABS = [
	{ value: 'FREE', label: 'Free Board' },
	{ value: 'RECOMMEND', label: 'Recommend' },
	{ value: 'NEWS', label: 'News' },
	{ value: 'HUMOR', label: 'Humor' },
];

const Community: NextPage = ({ initialInput, ...props }: T) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { query } = router;
	const articleCategory = query?.articleCategory as string;
	const [searchCommunity, setSearchCommunity] = useState<BoardArticlesInquiry>(initialInput);
	const [boardArticles, setBoardArticles] = useState<BoardArticle[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);
	const { isDark } = useTheme();
	const user = useReactiveVar(userVar);

	if (articleCategory) initialInput.search.articleCategory = articleCategory;

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const {
		loading: boardArticlesLoading,
		refetch: boardArticlesRefetch,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: searchCommunity },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBoardArticles(data?.getBoardArticles?.list || []);
			setTotalCount(data?.getBoardArticles?.metaCounter[0]?.total || 0);
		},
	});

	/** LIFECYCLE **/
	useEffect(() => {
		if (!query?.articleCategory)
			router.push(
				{ pathname: router.pathname, query: { articleCategory: 'FREE' } },
				router.pathname,
				{ shallow: true },
			);
	}, []);

	/** HANDLERS **/
	const tabChangeHandler = async (value: string) => {
		setSearchCommunity({ ...searchCommunity, page: 1, search: { articleCategory: value as BoardArticleCategory } });
		await router.push(
			{ pathname: '/community', query: { articleCategory: value } },
			router.pathname,
			{ shallow: true },
		);
	};

	const paginationHandler = (e: T, value: number) => {
		setSearchCommunity({ ...searchCommunity, page: value });
	};

	const likeBoardArticleHandler = async (e: any, user: any, id: string) => {
		try {
			e.stopPropagation();
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetBoardArticle({ variables: { input: id } });
			await boardArticlesRefetch({ input: searchCommunity });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeBoardArticleHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (device === 'mobile') {
		return <h1>COMMUNITY PAGE MOBILE</h1>;
	} else {
		return (
			<div id="community-list-page" className={isDark ? 'dark' : 'light'}>
				<div className="community-blobs">
					<div className="blob blob1" />
					<div className="blob blob2" />
					<div className="blob blob3" />
				</div>
				<div className="container">
					<div className="comm-topbar">
						<div className="brand-row">
							<h1 className="brand-name">
								Elite<em>Fitness</em>
							</h1>
							<span className="brand-tag">Community</span>
						</div>

						<div className="tabs-wrap">
							{NAV_TABS.map((tab) => (
								<button
									key={tab.value}
									className={`comm-tab ${
										searchCommunity.search.articleCategory === tab.value ? 'active' : ''
									}`}
									onClick={() => tabChangeHandler(tab.value)}
								>
									{tab.label}
								</button>
							))}
						</div>

						<div className="right-btns">
							<Button
								className="write-btn"
								onClick={() =>
									router.push({
										pathname: '/mypage',
										query: { category: 'writeArticle' },
									})
								}
							>
								+ Write
							</Button>
						</div>
					</div>

					<div className="section-row">
						<span className="section-label">Latest · {totalCount} articles</span>
						<div className="section-line" />
					</div>

					<div className="articles-grid">
						{boardArticlesLoading ? (
							<div className="loading-state">
								<div className="spinner" />
							</div>
						) : totalCount ? (
							boardArticles.map((boardArticle: BoardArticle) => (
								<CommunityCard
									boardArticle={boardArticle}
									key={boardArticle?._id}
									likeBoardArticleHandler={likeBoardArticleHandler}
								/>
							))
						) : (
							<div className="empty-state">
								<div className="empty-icon">!</div>
								<p>No articles found</p>
							</div>
						)}
					</div>

					{totalCount > 0 && (
						<div className="comm-pagination">
							<span className="pg-info">
								Showing {(searchCommunity.page - 1) * searchCommunity.limit + 1}–
								{Math.min(searchCommunity.page * searchCommunity.limit, totalCount)} of {totalCount} articles
							</span>
							<Pagination
								count={Math.ceil(totalCount / searchCommunity.limit)}
								page={searchCommunity.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</div>
					)}
				</div>
			</div>
		);
	}
};

Community.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'DESC',
		search: { articleCategory: 'FREE' },
	},
};

export default withLayoutBasic(Community);