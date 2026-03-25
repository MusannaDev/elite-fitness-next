import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Button, Stack, Typography, IconButton, Backdrop, Pagination } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import Moment from 'react-moment';
import { userVar } from '../../apollo/store';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ChatIcon from '@mui/icons-material/Chat';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import dynamic from 'next/dynamic';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { T } from '../../libs/types/common';
import EditIcon from '@mui/icons-material/Edit';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import {
	sweetConfirmAlert,
	sweetErrorHandling,
	sweetMixinErrorAlert,
	sweetTopSmallSuccessAlert,
} from '../../libs/sweetAlert';
import { CREATE_COMMENT, LIKE_TARGET_BOARD_ARTICLE, UPDATE_COMMENT } from '../../apollo/user/mutation';
import { GET_BOARD_ARTICLE, GET_COMMENTS } from '../../apollo/user/query';
import { Messages } from '../../libs/config';
import { CommentUpdate } from '../../libs/types/comment/comment.update';
const ToastViewerComponent = dynamic(() => import('../../libs/components/community/TViewer'), { ssr: false });

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

const CommunityDetail: NextPage = ({ initialInput, ...props }: T) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { query } = router;

	const articleId = query?.id as string;
	const articleCategory = query?.articleCategory as string;

	const [comment, setComment] = useState<string>('');
	const [wordsCnt, setWordsCnt] = useState<number>(0);
	const [updatedCommentWordsCnt, setUpdatedCommentWordsCnt] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const [comments, setComments] = useState<Comment[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchFilter, setSearchFilter] = useState<CommentsInquiry>({ ...initialInput });
	const [memberImage, setMemberImage] = useState<string>('/img/community/articleImg.png');
	const [openBackdrop, setOpenBackdrop] = useState<boolean>(false);
	const [updatedComment, setUpdatedComment] = useState<string>('');
	const [updatedCommentId, setUpdatedCommentId] = useState<string>('');
	const [likeLoading, setLikeLoading] = useState<boolean>(false);
	const [boardArticle, setBoardArticle] = useState<BoardArticle>();
	const [isDark, setIsDark] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	const [createComment] = useMutation(CREATE_COMMENT);
	const [updateComment] = useMutation(UPDATE_COMMENT);

	const { refetch: boardArticleRefetch } = useQuery(GET_BOARD_ARTICLE, {
		fetchPolicy: 'network-only',
		variables: { input: articleId },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBoardArticle(data?.getBoardArticle);
			if (data?.getBoardArticle?.memberData?.memberImage) {
				setMemberImage(`${process.env.REACT_APP_API_URL}/${data?.getBoardArticle?.memberData?.memberImage}`);
			}
		},
	});

	const { refetch: getCommentsRefetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setComments(data.getComments.list);
			setTotal(data.getComments?.metaCounter?.[0]?.total || 0);
		},
	});

	/** LIFECYCLE **/
	useEffect(() => {
		if (articleId) setSearchFilter({ ...searchFilter, search: { commentRefId: articleId } });
	}, [articleId]);

	/** HANDLERS **/
	const tabChangeHandler = (value: string) => {
		router.replace(
			{ pathname: '/community', query: { articleCategory: value } },
			'/community',
			{ shallow: true },
		);
	};

	const likeBoardArticleHandler = async (user: any, id: any) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			setLikeLoading(true);
			await likeTargetBoardArticle({ variables: { input: id } });
			await boardArticleRefetch({ input: articleId });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setLikeLoading(false);
		}
	};

	const createCommentHandler = async () => {
		if (!comment) return;
		try {
			if (!user._id) throw new Error(Messages.error2);
			const commentInput: CommentInput = {
				commentGroup: CommentGroup.ARTICLE,
				commentRefId: articleId,
				commentContent: comment,
			};
			await createComment({ variables: { input: commentInput } });
			await getCommentsRefetch({ input: searchFilter });
			await boardArticleRefetch({ input: articleId });
			setComment('');
			setWordsCnt(0);
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const updateButtonHandler = async (commentId: string, commentStatus?: CommentStatus.DELETE) => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			if (!commentId) throw new Error('Select a comment');
			const targetComment = comments.find((c) => c?._id === commentId);
			if (!commentStatus && updatedComment === targetComment?.commentContent) return;

			const updateData: CommentUpdate = {
				_id: commentId,
				...(commentStatus && { commentStatus }),
				...(updatedComment && { commentContent: updatedComment }),
			};

			if (!updateData?.commentContent && !updateData?.commentStatus)
				throw new Error('Provide data to update!');

			if (commentStatus) {
				if (await sweetConfirmAlert('Delete this comment?')) {
					await updateComment({ variables: { input: updateData } });
					await sweetTopSmallSuccessAlert('success', 800);
				} else return;
			} else {
				await updateComment({ variables: { input: updateData } });
				await sweetTopSmallSuccessAlert('success', 800);
			}
			await getCommentsRefetch({ input: searchFilter });
			setComment('');
		} catch (err: any) {
			await sweetErrorHandling(err);
		} finally {
			setOpenBackdrop(false);
			setUpdatedComment('');
			setUpdatedCommentWordsCnt(0);
			setUpdatedCommentId('');
		}
	};

	const getCommentMemberImage = (imageUrl: string | undefined) => {
		if (imageUrl) return `${process.env.REACT_APP_API_URL}/${imageUrl}`;
		return '/img/community/articleImg.png';
	};

	const goMemberPage = (id: any) => {
		if (id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};

	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const articleImage = boardArticle?.articleImage
		? `${process.env.REACT_APP_API_URL}/${boardArticle?.articleImage}`
		: '/img/community/articleImg.png';

	if (device === 'mobile') {
		return <div>COMMUNITY DETAIL PAGE MOBILE</div>;
	} else {
		return (
			<div id="community-detail-page" className={isDark ? 'dark' : 'light'}>
				{/* Aurora blobs — dark only */}
				<div className="detail-blobs">
					<div className="blob blob1" />
					<div className="blob blob2" />
					<div className="blob blob3" />
				</div>

				<div className="detail-wrap">
					{/* ── HERO CONTAINER — nav + image combined ── */}
					<div className="detail-hero-container">
						<img src={articleImage} alt={boardArticle?.articleTitle} className="hero-bg-img" />
						<div className="hero-overlay" />

						{/* Nav inside hero */}
						<div className="detail-nav">
							<div className="nav-logo">Elite<em>Fitness</em></div>
							<div className="nav-tabs">
								{NAV_TABS.map((tab) => (
									<button
										key={tab.value}
										className={`nav-tab ${articleCategory === tab.value ? 'active' : ''}`}
										onClick={() => tabChangeHandler(tab.value)}
									>
										{tab.label}
									</button>
								))}
							</div>
							<div className="nav-right">
								<Button
									className="write-btn"
									onClick={() => router.push({ pathname: '/mypage', query: { category: 'writeArticle' } })}
								>
									+ Write
								</Button>
								<button className="toggle-btn" onClick={() => setIsDark(!isDark)}>
									<span>{isDark ? '☀' : '🌙'}</span>
									<span>{isDark ? 'Light' : 'Dark'}</span>
								</button>
							</div>
						</div>

						{/* Article info at bottom of hero */}
						<div className="hero-content">
							<div className="hero-cat">
								{articleCategory}&nbsp;·&nbsp;
								{boardArticle?.createdAt && <Moment format="DD.MM.YY">{boardArticle?.createdAt}</Moment>}
							</div>
							<h1 className="hero-title">{boardArticle?.articleTitle}</h1>
							<div className="hero-meta">
								<div className="hero-av">{boardArticle?.memberData?.memberNick?.charAt(0).toUpperCase()}</div>
								<span className="hero-nick" onClick={() => goMemberPage(boardArticle?.memberData?._id)}>
									{boardArticle?.memberData?.memberNick}
								</span>
								<span className="hero-date">
									<Moment format="DD.MM.YY · HH:mm">{boardArticle?.createdAt}</Moment>
								</span>
							</div>
						</div>
					</div>

					{/* ── BODY ── */}
					<div className="detail-body">

						{/* Stats bar */}
						<div className="stats-bar">
							<span className="stat-item">
								{boardArticle?.meLiked && boardArticle?.meLiked[0]?.myFavorite ? (
									<ThumbUpAltIcon sx={{ fontSize: 15, color: '#ff1744' }} />
								) : (
									<ThumbUpOffAltIcon sx={{ fontSize: 15 }} />
								)}
								{boardArticle?.articleLikes}
							</span>
							<div className="stat-sep" />
							<span className="stat-item">
								<VisibilityIcon sx={{ fontSize: 15 }} />
								{boardArticle?.articleViews}
							</span>
							<div className="stat-sep" />
							<span className="stat-item">
								{total > 0 ? (
									<ChatIcon sx={{ fontSize: 15 }} />
								) : (
									<ChatBubbleOutlineRoundedIcon sx={{ fontSize: 15 }} />
								)}
								{total}
							</span>
							<button
								className="like-btn"
								onClick={() => likeBoardArticleHandler(user, boardArticle?._id)}
							>
								{boardArticle?.meLiked && boardArticle?.meLiked[0]?.myFavorite ? (
									<ThumbUpAltIcon sx={{ fontSize: 15, color: '#ff1744' }} />
								) : (
									<ThumbUpOffAltIcon sx={{ fontSize: 15 }} />
								)}
								<span>Like · {boardArticle?.articleLikes}</span>
							</button>
						</div>

						{/* Article content */}
						<div className="article-content">
							<ToastViewerComponent markdown={boardArticle?.articleContent} className="ytb_play" />
						</div>

						{/* Comments box */}
						<div className="comm-wrap">
							<div className="comm-title">Comments ({total})</div>

							<input
								type="text"
								className="comm-input"
								placeholder="Leave a comment..."
								value={comment}
								onChange={(e) => {
									if (e.target.value.length > 100) return;
									setWordsCnt(e.target.value.length);
									setComment(e.target.value);
								}}
							/>
							<div className="comm-bar">
								<span className="char-cnt">{wordsCnt}/100</span>
								<button className="submit-btn" onClick={createCommentHandler}>
									Comment
								</button>
							</div>
						</div>

						{/* Comments list */}
						{total > 0 && (
							<div className="comments-list-header">
								<span>All comments</span>
							</div>
						)}

						{comments?.map((commentData) => (
							<div className="comment-item" key={commentData?._id}>
								<div className="comment-top">
									<div
										className="comment-author"
										onClick={() => goMemberPage(commentData?.memberData?._id as string)}
									>
										<img
											src={getCommentMemberImage(commentData?.memberData?.memberImage)}
											alt=""
											className="comment-av"
										/>
										<div className="comment-author-info">
											<span className="comment-nick">{commentData?.memberData?.memberNick}</span>
											<span className="comment-date">
												<Moment format="DD.MM.YY HH:mm">{commentData?.createdAt}</Moment>
											</span>
										</div>
									</div>

									{commentData?.memberId === user?._id && (
										<div className="comment-actions">
											<IconButton
												size="small"
												onClick={() => {
													setUpdatedCommentId(commentData?._id);
													updateButtonHandler(commentData?._id, CommentStatus.DELETE);
												}}
											>
												<DeleteForeverIcon sx={{ fontSize: 17 }} />
											</IconButton>
											<IconButton
												size="small"
												onClick={() => {
													setUpdatedComment(commentData?.commentContent);
													setUpdatedCommentWordsCnt(commentData?.commentContent?.length);
													setUpdatedCommentId(commentData?._id);
													setOpenBackdrop(true);
												}}
											>
												<EditIcon sx={{ fontSize: 17 }} />
											</IconButton>

											<Backdrop
												sx={{
													top: '40%',
													right: '25%',
													left: '25%',
													width: '900px',
													height: 'fit-content',
													borderRadius: '16px',
													zIndex: 999,
												}}
												open={openBackdrop}
											>
												<Stack
													sx={{
														width: '100%',
														background: isDark ? '#1a1a2e' : '#fff',
														border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #ede8e0',
														padding: '24px',
														gap: '16px',
														borderRadius: '16px',
													}}
												>
													<Typography
														variant="h5"
														sx={{
															fontFamily: 'Fraunces, serif',
															fontWeight: 300,
															color: isDark ? '#fff' : '#1a1a1a',
														}}
													>
														Update comment
													</Typography>
													<input
														autoFocus
														value={updatedComment}
														onChange={(e) => {
															if (e.target.value.length > 100) return;
															setUpdatedCommentWordsCnt(e.target.value.length);
															setUpdatedComment(e.target.value);
														}}
														type="text"
														style={{
															border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #ede8e0',
															outline: 'none',
															height: '46px',
															padding: '0 14px',
															borderRadius: '9px',
															fontFamily: 'Inter, sans-serif',
															fontSize: '13px',
															color: isDark ? '#fff' : '#1a1a1a',
															background: isDark ? 'rgba(255,255,255,0.06)' : '#fff',
														}}
													/>
													<Stack flexDirection="row" justifyContent="space-between" alignItems="center">
														<Typography sx={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.3)' : '#bbb' }}>
															{updatedCommentWordsCnt}/100
														</Typography>
														<Stack flexDirection="row" gap="8px">
															<Button
																variant="outlined"
																sx={{
																	borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#ede8e0',
																	color: isDark ? 'rgba(255,255,255,0.5)' : '#888',
																	textTransform: 'none',
																	borderRadius: '8px',
																	fontSize: '12px',
																}}
																onClick={() => {
																	setOpenBackdrop(false);
																	setUpdatedComment('');
																	setUpdatedCommentWordsCnt(0);
																}}
															>
																Cancel
															</Button>
															<Button
																variant="contained"
																sx={{
																	background: '#ff1744',
																	textTransform: 'none',
																	borderRadius: '8px',
																	fontSize: '12px',
																	'&:hover': { background: '#d50000' },
																}}
																onClick={() => updateButtonHandler(updatedCommentId, undefined)}
															>
																Update
															</Button>
														</Stack>
													</Stack>
												</Stack>
											</Backdrop>
										</div>
									)}
								</div>
								<p className="comment-text">{commentData?.commentContent}</p>
							</div>
						))}

						{total > 0 && (
							<div className="comm-pagination">
								<Pagination
									count={Math.ceil(total / searchFilter.limit) || 1}
									page={searchFilter.page}
									shape="circular"
									color="primary"
									onChange={paginationHandler}
								/>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}
};

CommunityDetail.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: { commentRefId: '' },
	},
};

export default withLayoutBasic(CommunityDetail);