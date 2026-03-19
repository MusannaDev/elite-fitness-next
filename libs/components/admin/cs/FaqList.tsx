import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
	TableCell, TableHead, TableBody, TableRow,
	Table, TableContainer, Button, Menu, Fade, MenuItem,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';

const headCells = [
	{ id: 'category', label: 'Category', align: 'left' as const },
	{ id: 'title',    label: 'Title',    align: 'left' as const },
	{ id: 'writer',   label: 'Writer',   align: 'left' as const },
	{ id: 'date',     label: 'Date',     align: 'left' as const },
	{ id: 'status',   label: 'Status',   align: 'center' as const },
];

interface FaqArticlesPanelListType {
	dense?: boolean;
	membersData?: any;
	searchMembers?: any;
	anchorEl?: any;
	handleMenuIconClick?: any;
	handleMenuIconClose?: any;
	generateMentorTypeHandle?: any;
}

export const FaqArticlesPanelList = (props: FaqArticlesPanelListType) => {
	const { dense, anchorEl, handleMenuIconClick, handleMenuIconClose, generateMentorTypeHandle } = props;
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
									<TableCell align="left"><Typography className={'meta-text'}>Category</Typography></TableCell>
									<TableCell align="left"><Typography className={'row-title'}>FAQ Title</Typography></TableCell>
									<TableCell align="left" className={'name'}>
										<Stack direction={'row'} alignItems={'center'} gap={'7px'}>
											<Link href={`/_admin/users`}>
												<Avatar src={member_image} sx={{ width: 24, height: 24 }} />
											</Link>
											<Link href={`/_admin/users`}>
												<Typography className={'meta-text'} sx={{ fontWeight: 600 }}>Writer</Typography>
											</Link>
										</Stack>
									</TableCell>
									<TableCell align="left"><Typography className={'meta-text'}>2024.01.01</Typography></TableCell>
									<TableCell align="center">
										<Button
											onClick={(e: any) => handleMenuIconClick?.(e, index)}
											sx={{
												px: '8px', py: '2px', borderRadius: '5px', fontSize: '10px', fontWeight: 700,
												background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)',
												color: '#16A34A', minWidth: 'auto', textTransform: 'none',
												'&:hover': { opacity: 0.8 },
											}}
										>
											ACTIVE
										</Button>
										<Menu className={'menu-modal'} MenuListProps={{ 'aria-labelledby': 'fade-button' }}
											anchorEl={anchorEl?.[index]} open={Boolean(anchorEl?.[index])}
											onClose={handleMenuIconClose} TransitionComponent={Fade}>
											<MenuItem onClick={() => generateMentorTypeHandle?.('id', 'mentor', 'originate')}>
												<Typography variant={'subtitle1'} component={'span'}>MENTOR</Typography>
											</MenuItem>
											<MenuItem onClick={() => generateMentorTypeHandle?.('id', 'user', 'remove')}>
												<Typography variant={'subtitle1'} component={'span'}>USER</Typography>
											</MenuItem>
										</Menu>
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