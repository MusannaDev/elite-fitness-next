import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
	TableCell, TableHead, TableBody, TableRow,
	Table, TableContainer, Button, Box,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { IconButton, Tooltip } from '@mui/material';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { NotePencil } from 'phosphor-react';

const headCells = [
	{ id: 'category', label: 'Category', align: 'left' as const },
	{ id: 'title',    label: 'Title',    align: 'left' as const },
	{ id: 'id',       label: 'ID',       align: 'left' as const },
	{ id: 'writer',   label: 'Writer',   align: 'left' as const },
	{ id: 'date',     label: 'Date',     align: 'left' as const },
	{ id: 'view',     label: 'View',     align: 'left' as const },
	{ id: 'action',   label: 'Action',   align: 'center' as const },
];

interface NoticeListType {
	dense?: boolean;
	membersData?: any;
	searchMembers?: any;
	anchorEl?: any;
	handleMenuIconClick?: any;
	handleMenuIconClose?: any;
	generateMentorTypeHandle?: any;
}

export const NoticeList = (props: NoticeListType) => {
	const { dense } = props;
	const router = useRouter();

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 750 }} size={dense ? 'small' : 'medium'}>
					<TableHead>
						<TableRow>{headCells.map((c) => <TableCell key={c.id} align={c.align}>{c.label}</TableCell>)}</TableRow>
					</TableHead>
					<TableBody>
						{[1, 2, 3, 4, 5].map((ele: any, index: number) => {
							const member_image = '/img/profile/defaultUser.svg';
							return (
								<TableRow hover key={index} sx={{ '&:last-child td': { border: 0 } }}>
									<TableCell align="left"><Box className={'tag-pill stone'}>General</Box></TableCell>
									<TableCell align="left"><Typography className={'row-title'}>Notice Title</Typography></TableCell>
									<TableCell align="left"><Typography className={'mono-id'}>notice_id</Typography></TableCell>
									<TableCell align="left" className={'name'}>
										<Stack direction={'row'} alignItems={'center'} gap={'7px'}>
											<Link href={`/_admin/users`}>
												<Avatar src={member_image} sx={{ width: 24, height: 24 }} />
											</Link>
											<Link href={`/_admin/users`}>
												<Typography className={'meta-text'} sx={{ fontWeight: 600 }}>Admin</Typography>
											</Link>
										</Stack>
									</TableCell>
									<TableCell align="left"><Typography className={'meta-text'}>2024.01.01</Typography></TableCell>
									<TableCell align="left"><Typography className={'meta-text'}>120</Typography></TableCell>
									<TableCell align="center">
										<Stack direction={'row'} justifyContent={'center'} gap={'2px'}>
											<Tooltip title={'Delete'}>
												<IconButton size="small" sx={{
													width: 28, height: 28, borderRadius: '6px',
													background: 'rgba(239,68,68,0.06)',
													'&:hover': { background: 'rgba(239,68,68,0.12)' },
												}}>
													<DeleteRoundedIcon sx={{ fontSize: 14, color: '#DC2626' }} />
												</IconButton>
											</Tooltip>
											<Tooltip title="Edit">
												<IconButton size="small" onClick={() => router.push(`/_admin/cs/notice_create?id=notice._id`)} sx={{
													width: 28, height: 28, borderRadius: '6px',
													background: 'rgba(200,149,108,0.08)',
													'&:hover': { background: 'rgba(200,149,108,0.15)' },
												}}>
													<NotePencil size={14} weight="bold" color="#C8956C" />
												</IconButton>
											</Tooltip>
										</Stack>
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