import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography, Box, Chip } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import CommunityCard from '../common/CommunityCard';
import { T } from '../../types/common';
import { BoardArticle } from '../../types/board-article/board-article';
import { BoardArticlesInquiry } from '../../types/board-article/board-article.input';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { useMutation, useQuery } from '@apollo/client';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { Messages } from '../../config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';

const MemberArticles: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [total, setTotal] = useState<number>(0);
	const { memberId } = router.query;
	const [searchFilter, setSearchFilter] = useState<BoardArticlesInquiry>(initialInput);
	const [memberBoArticles, setMemberBoArticles] = useState<BoardArticle[]>([]);

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const {
		loading,
		refetch: boardArticlesRefetch,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMemberBoArticles(data?.getBoardArticles?.list);
			setTotal(data?.getBoardArticles?.metaCounter[0]?.total || 0);
		},
	});

	/** LIFECYCLE **/
	useEffect(() => {
		if (memberId) setSearchFilter({ ...initialInput, search: { memberId: memberId } });
	}, [memberId]);

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const likeBoardArticleHandler = async (user: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetBoardArticle({ variables: { input: id } });
			await boardArticlesRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeTargetBoardArticleHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (device === 'mobile') return <div>MEMBER ARTICLES MOBILE</div>;

	return (
		<div id="member-articles-page">

			{/* ── Glass Header ── */}
			<Stack className="mar-glass-header">
				<Stack className="mar-header-left">
					<Box className="mar-header-icon-wrap">
						<AutoStoriesOutlinedIcon />
					</Box>
					<Box>
						<Typography className="mar-page-title">Articles</Typography>
						<Typography className="mar-page-sub">
							{loading ? 'Loading…' : total > 0 ? `${total} articles published` : 'No articles yet'}
						</Typography>
					</Box>
				</Stack>
				<Chip
					icon={<ArticleOutlinedIcon />}
					label={`${total} Posts`}
					className="mar-total-chip"
					size="small"
				/>
			</Stack>

			{/* ── Skeleton ── */}
			{loading && (
				<Stack className="mar-skeleton-grid">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<Box key={i} className="mar-skeleton-card" />
					))}
				</Stack>
			)}

			{/* ── Empty State ── */}
			{!loading && memberBoArticles?.length === 0 && (
				<Stack className="mar-empty">
					<Box className="mar-empty-icon-wrap">
						<AutoStoriesOutlinedIcon />
					</Box>
					<Typography className="mar-empty-title">No Articles Yet</Typography>
					<Typography className="mar-empty-desc">
						This member hasn't published any articles yet.
					</Typography>
				</Stack>
			)}

			{/* ── Articles Grid ── */}
			{!loading && memberBoArticles?.length > 0 && (
				<Stack className="mar-articles-grid">
					{memberBoArticles.map((boardArticle: BoardArticle) => (
						<Box key={boardArticle?._id} className="mar-card-wrap">
							<CommunityCard
								boardArticle={boardArticle}
								size={'small'}
								likeBoardArticleHandler={likeBoardArticleHandler}
							/>
						</Box>
					))}
				</Stack>
			)}

			{/* ── Pagination ── */}
			{memberBoArticles?.length > 0 && (
				<Stack className="mar-pagination">
					<Pagination
						count={Math.ceil(total / searchFilter.limit) || 1}
						page={searchFilter.page}
						shape="rounded"
						color="primary"
						onChange={paginationHandler}
					/>
					<Typography className="mar-page-label">{total} articles total</Typography>
				</Stack>
			)}
		</div>
	);
};

MemberArticles.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default MemberArticles;