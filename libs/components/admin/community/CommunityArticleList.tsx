import React from 'react';
import Link from 'next/link';
import {
	Box, Button, Fade, Menu, MenuItem,
	Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import OpenInBrowserRoundedIcon from '@mui/icons-material/OpenInBrowserRounded';
import Moment from 'react-moment';
import { BoardArticle } from '../../../types/board-article/board-article';
import { NEXT_PUBLIC_API_URL } from '../../../config';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';
import { BoardArticleStatus } from '../../../enums/board-article.enum';

const headCells = [
	{ id: 'article_id', label: 'Article ID',    align: 'left' as const },
	{ id: 'title',      label: 'Title',         align: 'left' as const },
	{ id: 'category',   label: 'Category',      align: 'left' as const },
	{ id: 'writer',     label: 'Writer',        align: 'left' as const },
	{ id: 'view',       label: 'View',          align: 'center' as const },
	{ id: 'like',       label: 'Like',          align: 'center' as const },
	{ id: 'register',   label: 'Register Date', align: 'left' as const },
	{ id: 'status',     label: 'Status',        align: 'center' as const },
];

const statusStyle = (s: string) => {
	switch (s) {
		case 'ACTIVE': return { bg: 'rgba(34,197,94,0.08)',  color: '#16A34A', border: 'rgba(34,197,94,0.18)' };
		case 'DELETE': return { bg: 'var(--hover)',           color: 'var(--text-muted)', border: 'var(--border)' };
		default:       return { bg: 'var(--hover)',           color: 'var(--text-secondary)', border: 'var(--border)' };
	}
};

interface CommunityArticleListProps {
	articles: BoardArticle[];
	anchorEl: any;
	menuIconClickHandler: any;
	menuIconCloseHandler: any;
	updateArticleHandler: any;
	removeArticleHandler: any;
}

const CommunityArticleList = (props: CommunityArticleListProps) => {
	const { articles, anchorEl, menuIconClickHandler, menuIconCloseHandler, updateArticleHandler, removeArticleHandler } = props;

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 750 }} size={'medium'}>
					<TableHead>
						<TableRow>{headCells.map((c) => <TableCell key={c.id} align={c.align}>{c.label}</TableCell>)}</TableRow>
					</TableHead>
					<TableBody>
						{articles.length === 0 && (
							<TableRow><TableCell align="center" colSpan={8}><Typography className={'no-data'}>No articles found</Typography></TableCell></TableRow>
						)}
						{articles.length !== 0 && articles.map((article: BoardArticle, index: number) => {
							const ss = statusStyle(article.articleStatus);
							return (
								<TableRow hover key={article._id} sx={{ '&:last-child td': { border: 0 } }}>
									<TableCell align="left"><Typography className={'mono-id'}>{article._id}</Typography></TableCell>
									<TableCell align="left">
										<Box component={'div'} sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
											<Typography className={'row-title'}>{article.articleTitle}</Typography>
											{article.articleStatus === BoardArticleStatus.ACTIVE && (
												<Link href={`/community/detail?articleCategory=${article.articleCategory}&id=${article._id}`}>
													<IconButton size="small" sx={{ p: '3px', color: 'var(--text-muted)', '&:hover': { color: '#C8956C' } }}>
														<Tooltip title={'Open window'}>
															<OpenInBrowserRoundedIcon sx={{ fontSize: 15 }} />
														</Tooltip>
													</IconButton>
												</Link>
											)}
										</Box>
									</TableCell>
									<TableCell align="left"><Box className={'tag-pill stone'}>{article.articleCategory}</Box></TableCell>
									<TableCell align="left" className={'name'}>
										<Link href={`/member?memberId=${article?.memberData?._id}`}>
											<Stack direction={'row'} alignItems={'center'} gap={'7px'}>
												<Avatar
													src={article?.memberData?.memberImage ? `${NEXT_PUBLIC_API_URL}/${article?.memberData?.memberImage}` : '/img/profile/defaultUser.svg'}
													sx={{ width: 24, height: 24 }}
												/>
												<Typography className={'meta-text'} sx={{ fontWeight: 600 }}>{article?.memberData?.memberNick}</Typography>
											</Stack>
										</Link>
									</TableCell>
									<TableCell align="center"><Typography className={'meta-text'}>{article?.articleViews}</Typography></TableCell>
									<TableCell align="center"><Typography className={'meta-text'}>{article?.articleLikes}</Typography></TableCell>
									<TableCell align="left">
										<Typography className={'meta-text'}><Moment format={'DD.MM.YY HH:mm'}>{article?.createdAt}</Moment></Typography>
									</TableCell>
									<TableCell align="center">
										{article.articleStatus === BoardArticleStatus.DELETE ? (
											<Button onClick={() => removeArticleHandler(article._id)} sx={{
												minWidth: 'auto', width: 28, height: 28, p: 0, borderRadius: '6px',
												background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)',
												'&:hover': { background: 'rgba(239,68,68,0.15)' },
											}}>
												<DeleteIcon sx={{ fontSize: 14, color: '#DC2626' }} />
											</Button>
										) : (
											<>
												<Button onClick={(e: any) => menuIconClickHandler(e, index)} sx={{
													px: '8px', py: '2px', borderRadius: '5px', fontSize: '10px', fontWeight: 700,
													background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color,
													minWidth: 'auto', letterSpacing: '0.04em', textTransform: 'none',
													'&:hover': { opacity: 0.8 },
												}}>
													{article.articleStatus}
												</Button>
												<Menu className={'menu-modal'} MenuListProps={{ 'aria-labelledby': 'fade-button' }}
													anchorEl={anchorEl[index]} open={Boolean(anchorEl[index])}
													onClose={menuIconCloseHandler} TransitionComponent={Fade}>
													{Object.values(BoardArticleStatus).filter((e) => e !== article.articleStatus).map((status: string) => (
														<MenuItem key={status} onClick={() => updateArticleHandler({ _id: article._id, articleStatus: status })}>
															<Typography variant={'subtitle1'} component={'span'}>{status}</Typography>
														</MenuItem>
													))}
												</Menu>
											</>
										)}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	);
};

export default CommunityArticleList;