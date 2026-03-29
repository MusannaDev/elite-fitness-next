import React, { useState } from 'react';
import { Stack, Box, Typography, IconButton, Collapse } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { Member } from '../../types/member/member';
import { CommentGroup } from '../../enums/comment.enum';
import MemberComments from '../comment/MemberComments';

interface TopTrainerCardProps {
	trainer: Member;
	likeTrainerHandler: any;
	followTrainerHandler: any;
}

const TopTrainerCard = (props: TopTrainerCardProps) => {
	const { trainer, likeTrainerHandler, followTrainerHandler } = props;
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [commentOpen, setCommentOpen] = useState(false);

	const trainerImage = trainer?.memberImage
		? `${REACT_APP_API_URL}/${trainer.memberImage}`
		: '/img/profile/defaultUser.svg';

	const pushDetailHandler = async (memberId: string) => {
		await router.push({ pathname: '/member', query: { memberId } });
	};

	return (
		<Stack className="top-trainer-card">
			{/* Horizontal: photo LEFT — info RIGHT */}
			<Box className="tr-card-main">
				<Box className="tr-photo-side" onClick={() => pushDetailHandler(trainer._id)}>
					<Box className="tr-photo" style={{ backgroundImage: `url(${trainerImage})` }} />
					<Box className="tr-badge"><Typography>PRO</Typography></Box>
				</Box>

				<Stack className="tr-info-side">
					<Box>
						<Typography className="tr-name" onClick={() => pushDetailHandler(trainer._id)}>
							{trainer.memberNick}
						</Typography>
						<Typography className="tr-role">Certified Trainer</Typography>
					</Box>

					{trainer.memberDesc && (
						<Typography className="tr-desc">{trainer.memberDesc}</Typography>
					)}

					<Stack className="tr-stats">
						<Box className="tr-stat">
							<Typography className="tr-stat-num">{trainer.memberFollowers ?? 0}</Typography>
							<Typography className="tr-stat-lbl">Followers</Typography>
						</Box>
						<Box className="tr-stat">
							<Typography className="tr-stat-num">{trainer.memberProducts ?? 0}</Typography>
							<Typography className="tr-stat-lbl">Programs</Typography>
						</Box>
						<Box className="tr-stat">
							<Typography className="tr-stat-num">{trainer.memberPoints ?? 0}</Typography>
							<Typography className="tr-stat-lbl">Points</Typography>
						</Box>
					</Stack>

					{/* All action icons in a single row */}
					<Stack className="tr-actions" direction="row" alignItems="center" gap="4px">
						<IconButton
							size="small"
							className={`tr-btn ${trainer?.meFollowed?.[0]?.myFollowing ? 'following' : ''}`}
							onClick={() => followTrainerHandler(user, trainer._id)}
						>
							{trainer?.meFollowed?.[0]?.myFollowing ? (
								<PersonRemoveIcon style={{ fontSize: 14 }} />
							) : (
								<PersonAddIcon style={{ fontSize: 14 }} />
							)}
						</IconButton>
						<IconButton
							size="small"
							className={`tr-btn ${trainer?.meLiked?.[0]?.myFavorite ? 'liked' : ''}`}
							onClick={() => likeTrainerHandler(user, trainer._id)}
						>
							<FavoriteIcon style={{ fontSize: 14 }} />
						</IconButton>
						<Typography className="tr-count">{trainer.memberLikes}</Typography>
						<IconButton size="small" className="tr-btn">
							<RemoveRedEyeIcon style={{ fontSize: 14 }} />
						</IconButton>
						<Typography className="tr-count">{trainer.memberViews}</Typography>
						<IconButton
							size="small"
							className={`tr-btn tr-comment-btn ${commentOpen ? 'active' : ''}`}
							onClick={() => setCommentOpen(!commentOpen)}
						>
							<ChatBubbleOutlineIcon style={{ fontSize: 14 }} />
							<Typography className="tr-count">{trainer.memberComments ?? 0}</Typography>
							<KeyboardArrowUpIcon
								style={{
									fontSize: 12,
									transform: commentOpen ? 'rotate(0deg)' : 'rotate(180deg)',
									transition: 'transform 0.25s',
								}}
							/>
						</IconButton>
					</Stack>
				</Stack>
			</Box>

			<Collapse in={commentOpen}>
				<Box className="tr-comment-panel">
					<MemberComments
						commentGroup={CommentGroup.MEMBER}
						commentRefId={trainer._id}
						memberId={user?._id}
					/>
				</Box>
			</Collapse>
		</Stack>
	);
};

export default TopTrainerCard;
