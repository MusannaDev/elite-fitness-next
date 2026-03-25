import React from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Typography } from '@mui/material';
import { BoardArticle } from '../../types/board-article/board-article';
import Moment from 'react-moment';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

interface CommunityCardProps {
	boardArticle: BoardArticle;
	size?: string;
	likeBoardArticleHandler: any;
}

const CARD_COLORS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];

const CommunityCard = (props: CommunityCardProps) => {
	const { boardArticle, size = 'normal', likeBoardArticleHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const imagePath: string | null = boardArticle?.articleImage
		? `${REACT_APP_API_URL}/${boardArticle?.articleImage}`
		: null;

	const colorClass = CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)];

	/** HANDLERS **/
	const chooseArticleHandler = (e: React.SyntheticEvent) => {
		router.push(
			{
				pathname: '/community/detail',
				query: { articleCategory: boardArticle?.articleCategory, id: boardArticle?._id },
			},
			undefined,
			{ shallow: true },
		);
	};

	const goMemberPage = (e: React.SyntheticEvent, id: string) => {
		e.stopPropagation();
		if (id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};

	if (device === 'mobile') {
		return <div>COMMUNITY CARD MOBILE</div>;
	} else {
		return (
			<div className="community-card" onClick={chooseArticleHandler}>
				{/* IMAGE / COLOR ZONE */}
			<div className={`card-image-zone ${colorClass}`}>
				{imagePath ? (
					<img src={imagePath} alt="" className="card-real-img" />
				) : (
					<div className="card-icon-placeholder">
						<span>📝</span>
					</div>
				)}
				<span className="card-cat-badge">{boardArticle?.articleCategory}</span>
			</div>

				{/* BODY */}
				<div className="card-body">
					<p className="card-article-title">{boardArticle?.articleTitle}</p>

					<div className="card-footer">
						<div
							className="card-author"
							onClick={(e: any) => goMemberPage(e, boardArticle?.memberData?._id as string)}
						>
							<div
								className="card-avatar"
								style={{
									backgroundImage: boardArticle?.memberData?.memberImage
										? `url(${REACT_APP_API_URL}/${boardArticle?.memberData?.memberImage})`
										: undefined,
								}}
							>
								{!boardArticle?.memberData?.memberImage &&
									boardArticle?.memberData?.memberNick?.charAt(0).toUpperCase()}
							</div>
							<span className="card-nick">{boardArticle?.memberData?.memberNick}</span>
						</div>

						<div className="card-stats">
							<span className="card-stat">
								<RemoveRedEyeIcon sx={{ fontSize: 13 }} />
								{boardArticle?.articleViews}
							</span>
							<span
								className="card-stat like-btn"
								onClick={(e: any) => {
									e.stopPropagation();
									likeBoardArticleHandler(e, user, boardArticle?._id);
								}}
							>
								{boardArticle?.meLiked && boardArticle?.meLiked[0]?.myFavorite ? (
									<FavoriteIcon sx={{ fontSize: 13, color: '#ff1744' }} />
								) : (
									<FavoriteBorderIcon sx={{ fontSize: 13 }} />
								)}
								{boardArticle?.articleLikes}
							</span>
						</div>
					</div>
				</div>
			</div>
		);
	}
};

export default CommunityCard;