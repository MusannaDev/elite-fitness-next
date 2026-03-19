import React from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Box, Typography } from '@mui/material';
import { Comment } from '../../types/comment/comment';
import Moment from 'react-moment';
import { REACT_APP_API_URL } from '../../config';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ReplyIcon from '@mui/icons-material/Reply';

interface ReviewCardProps {
	fromMyPage?: string;
	comment: Comment;
}

const ReviewCard = (props: ReviewCardProps) => {
	const { fromMyPage, comment } = props;
	const device = useDeviceDetect();
	const imagePath: string = comment?.memberData?.memberImage
		? `${REACT_APP_API_URL}/${comment?.memberData?.memberImage}`
		: '/img/profile/defaultUser.svg';

	if (device === 'mobile') {
		return <div>REVIEW CARD</div>;
	} else {
		return (
			<Box component={'div'} className={'review-card'}>
				<div className={'review-quote-icon'}>
					<FormatQuoteIcon />
				</div>

				<p className={'review-content'}>{comment.commentContent}</p>

				<div className={'review-footer'}>
					<div className={'reviewer-info'}>
						<div className={'reviewer-avatar'}>
							<img src={imagePath} alt="" />
						</div>
						<div className={'reviewer-meta'}>
							<strong>{comment.memberData?.memberNick}</strong>
							<span>
								<Moment format={'DD MMM, YYYY'}>{comment.createdAt}</Moment>
							</span>
						</div>
					</div>

					{fromMyPage && (
						<button className="reply-btn">
							<ReplyIcon />
							<span>Reply</span>
						</button>
					)}
				</div>
			</Box>
		);
	}
};

export default ReviewCard;