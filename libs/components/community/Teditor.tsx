import React, { useMemo, useRef, useState } from 'react';
import { Box, Button, FormControl, MenuItem, Stack, Typography, Select, TextField } from '@mui/material';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { Editor } from '@toast-ui/react-editor';
import { getJwtToken } from '../../auth';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import axios from 'axios';
import { T } from '../../types/common';
import '@toast-ui/editor/dist/toastui-editor.css';
import { useMutation } from '@apollo/client';
import { CREATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';

const TuiEditor = () => {
	const editorRef = useRef<Editor>(null);
	const token = getJwtToken();
	const router = useRouter();
	const [articleCategory, setArticleCategory] = useState<BoardArticleCategory>(BoardArticleCategory.FREE);

	/** APOLLO REQUESTS **/
	const [createBoardArticle] = useMutation(CREATE_BOARD_ARTICLE);

	const memoizedValues = useMemo(() => {
		const articleTitle = '',
			articleContent = '',
			articleImage = '';
		return { articleTitle, articleContent, articleImage };
	}, []);

	/** HANDLERS **/
	const uploadImage = async (image: any) => {
		try {
			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target)
					}`,
					variables: { file: null, target: 'article' },
				}),
			);
			formData.append('map', JSON.stringify({ '0': ['variables.file'] }));
			formData.append('0', image);

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImage = response.data.data.imageUploader;
			memoizedValues.articleImage = responseImage;
			return `${REACT_APP_API_URL}/${responseImage}`;
		} catch (err) {
			console.log('Error, uploadImage:', err);
		}
	};

	const changeCategoryHandler = (e: any) => {
		setArticleCategory(e.target.value);
	};

	const articleTitleHandler = (e: T) => {
		memoizedValues.articleTitle = e.target.value;
	};

	const handleRegisterButton = async () => {
		try {
			const editor = editorRef.current;
			const articleContent = editor?.getInstance().getHTML() as string;
			memoizedValues.articleContent = articleContent;

			if (!memoizedValues.articleContent || !memoizedValues.articleTitle) {
				throw new Error(Message.INSERT_ALL_INPUTS);
			}

			await createBoardArticle({
				variables: { input: { ...memoizedValues, articleCategory } },
			});

			await sweetTopSuccessAlert('Article created successfully', 700);
			await router.push({ pathname: '/mypage', query: { category: 'myArticles' } });
		} catch (err) {
			console.log('ERROR:', err);
			sweetErrorHandling(err);
		}
	};

	return (
		<div id="tui-editor-wrap">
			{/* Header */}
			<div className="editor-header">
				<h2 className="editor-title">
					Write an <em>Article</em>
				</h2>
				<p className="editor-sub">Share your thoughts with the EliteFitness community</p>
			</div>

			{/* Meta fields */}
			<div className="editor-meta-row">
				<div className="editor-field">
					<label className="field-label">Category</label>
					<FormControl sx={{ width: '100%' }}>
						<Select
							value={articleCategory}
							onChange={changeCategoryHandler}
							displayEmpty
							inputProps={{ 'aria-label': 'category' }}
							sx={{
								fontFamily: 'Inter, sans-serif',
								fontSize: '13px',
								borderRadius: '9px',
								background: '#fff',
								'& .MuiOutlinedInput-notchedOutline': { borderColor: '#ede8e0' },
								'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ff1744' },
								'&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ff1744' },
							}}
						>
							<MenuItem value={BoardArticleCategory.FREE}>Free Board</MenuItem>
							<MenuItem value={BoardArticleCategory.HUMOR}>Humor</MenuItem>
							<MenuItem value={BoardArticleCategory.NEWS}>News</MenuItem>
							<MenuItem value={BoardArticleCategory.RECOMMEND}>Recommendation</MenuItem>
						</Select>
					</FormControl>
				</div>

				<div className="editor-field">
					<label className="field-label">Title</label>
					<TextField
						onChange={articleTitleHandler}
						placeholder="Enter your article title"
						fullWidth
						sx={{
							'& .MuiOutlinedInput-root': {
								fontFamily: 'Inter, sans-serif',
								fontSize: '13px',
								borderRadius: '9px',
								background: '#fff',
								'& fieldset': { borderColor: '#ede8e0' },
								'&:hover fieldset': { borderColor: '#ff1744' },
								'&.Mui-focused fieldset': { borderColor: '#ff1744' },
							},
						}}
					/>
				</div>
			</div>

			{/* Toast Editor */}
			<div className="editor-body">
				<Editor
					initialValue="Write your article here..."
					placeholder="Write your article here..."
					previewStyle="vertical"
					height="520px"
					// @ts-ignore
					initialEditType="WYSIWYG"
					toolbarItems={[
						['heading', 'bold', 'italic', 'strike'],
						['image', 'table', 'link'],
						['ul', 'ol', 'task'],
					]}
					ref={editorRef}
					hooks={{
						addImageBlobHook: async (image: any, callback: any) => {
							const uploadedImageURL = await uploadImage(image);
							callback(uploadedImageURL);
							return false;
						},
					}}
					events={{ load: function (param: any) {} }}
				/>
			</div>

			{/* Submit */}
			<div className="editor-footer">
				<button className="register-btn" onClick={handleRegisterButton}>
					Publish Article
				</button>
			</div>
		</div>
	);
};

export default TuiEditor;