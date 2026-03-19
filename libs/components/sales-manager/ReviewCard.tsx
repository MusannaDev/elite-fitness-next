import React from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Box } from '@mui/material';
import { Comment } from '../../types/comment/comment';
import Moment from 'react-moment';
import { REACT_APP_API_URL } from '../../config';

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
				{/* Quote accent bar + text */}
				<div className="review-quote-block">
					<span className="review-quote-mark">"</span>
					<p className="review-quote-text">{comment.commentContent}</p>
				</div>

				{/* Author row */}
				<div className="review-author-row">
					<div
						className="review-author-avatar"
						style={{ backgroundImage: `url(${imagePath})` }}
					/>
					<div className="review-author-info">
						<strong className="review-author-name">
							{comment.memberData?.memberNick}
						</strong>
						<span className="review-author-date">
							<Moment format={'DD MMMM'}>{comment.createdAt}</Moment>
						</span>
					</div>

					{fromMyPage && (
						<button className="review-reply-btn">
							<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 16 16" fill="none">
								<path
									d="M6.667 4.671V1.836c0-.2-.12-.382-.306-.46-.184-.078-.4-.039-.542.102L.152 6.977A.667.667 0 000 7.336c0 .135.055.265.152.359l5.667 5.5c.145.14.359.179.542.102.186-.079.306-.26.306-.46V9.003h.945c3.091 0 5.94 1.68 7.436 4.381l.014.025c.09.163.259.26.439.26.041 0 .082-.004.123-.015.222-.057.377-.256.377-.485 0-5.183-4.171-9.41-9.333-9.498z"
									fill="currentColor"
								/>
							</svg>
							Reply
						</button>
					)}
				</div>
			</Box>
		);
	}
};

export default ReviewCard;