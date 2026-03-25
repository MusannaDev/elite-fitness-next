import React, { useState } from 'react';
import { Stack, Box, Typography } from '@mui/material';
import Moment from 'react-moment';
import { useMutation, useQuery } from '@apollo/client';
import { GET_COMMENTS } from '../../../apollo/user/query';
import { CREATE_COMMENT } from '../../../apollo/user/mutation';
import { T } from '../../types/common';
import { CommentGroup } from '../../enums/comment.enum';
import { REACT_APP_API_URL } from '../../config';

interface EquipmentCommentsProps {
	commentGroup: CommentGroup;
	commentRefId: string;
	memberId?: string;
}

const EquipmentComments = (props: EquipmentCommentsProps) => {
	const { commentGroup, commentRefId, memberId } = props;
	const [commentContent, setCommentContent] = useState('');
	const [comments, setComments] = useState<any[]>([]);

	const [createComment] = useMutation(CREATE_COMMENT);

	const { refetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: 1,
				limit: 10,
				sort: 'createdAt',
				direction: 'DESC',
				search: { commentRefId },
			},
		},
		onCompleted: (data: T) => {
			setComments(data?.getComments?.list ?? []);
		},
		skip: !commentRefId,
	});

	const submitHandler = async () => {
		if (!commentContent.trim() || !memberId) return;
		try {
			await createComment({
				variables: {
					input: {
						commentGroup,
						commentContent: commentContent.trim(),
						commentRefId,
					},
				},
			});
			setCommentContent('');
			await refetch();
		} catch (err: any) {
			console.log('Comment error:', err.message);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			submitHandler();
		}
	};

	return (
		<Stack className="comments-wrap">
			{comments.length > 0 && (
				<Stack className="comments-list">
					{comments.map((comment) => {
						const avatar = comment?.memberData?.memberImage
							? `${REACT_APP_API_URL}/${comment.memberData.memberImage}`
							: '/img/profile/defaultUser.svg';
						return (
							<Stack key={comment._id} className="comment-item" direction="row">
								<Box className="comment-avatar" style={{ backgroundImage: `url(${avatar})` }} />
								<Box className="comment-body">
									<Box>
										<Typography component="span" className="comment-author">
											{comment?.memberData?.memberNick ?? 'User'}
										</Typography>
										<Typography component="span" className="comment-date">
											<Moment format="DD.MM.YY">{comment.createdAt}</Moment>
										</Typography>
									</Box>
									<Typography className="comment-content">{comment.commentContent}</Typography>
								</Box>
							</Stack>
						);
					})}
				</Stack>
			)}
			<Box className="comment-input-area">
				<textarea
					className="comment-input"
					placeholder={memberId ? 'Review this equipment...' : 'Sign in to comment'}
					value={commentContent}
					onChange={(e) => setCommentContent(e.target.value)}
					onKeyDown={handleKeyDown}
					rows={2}
					disabled={!memberId}
				/>
				<button
					className="comment-submit-btn"
					onClick={submitHandler}
					disabled={!memberId || !commentContent.trim()}
				>
					Post
				</button>
			</Box>
		</Stack>
	);
};

export default EquipmentComments;