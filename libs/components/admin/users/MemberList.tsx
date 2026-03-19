import React from 'react';
import Link from 'next/link';
import {
	TableCell, TableHead, TableBody, TableRow,
	Table, TableContainer, Button, Menu, Fade, MenuItem,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { Stack, Box } from '@mui/material';
import { Member } from '../../../types/member/member';
import { REACT_APP_API_URL } from '../../../config';
import { MemberStatus, MemberType } from '../../../enums/member.enum';

const headCells = [
	{ id: 'id',       label: 'Member ID',  align: 'left' as const },
	{ id: 'nick',     label: 'Nickname',   align: 'left' as const },
	{ id: 'fullname', label: 'Full Name',  align: 'center' as const },
	{ id: 'phone',    label: 'Phone',      align: 'center' as const },
	{ id: 'type',     label: 'Type',       align: 'center' as const },
	{ id: 'warn',     label: 'Warnings',   align: 'center' as const },
	{ id: 'block',    label: 'Blocks',     align: 'center' as const },
	{ id: 'status',   label: 'Status',     align: 'center' as const },
];

const typeStyle = (t: string) => {
	switch (t) {
		case 'ADMIN':        return { bg: 'rgba(200,149,108,0.1)', color: '#A07248', border: 'rgba(200,149,108,0.25)' };
		case 'AGENT':        return { bg: 'rgba(168,130,200,0.1)', color: '#7C5AA0', border: 'rgba(168,130,200,0.25)' };
		case 'TRAINER':      return { bg: 'rgba(34,197,94,0.08)',  color: '#16A34A', border: 'rgba(34,197,94,0.18)' };
		case 'SALESMANAGER': return { bg: 'rgba(245,158,11,0.1)',  color: '#D97706', border: 'rgba(245,158,11,0.2)' };
		default:             return { bg: 'var(--hover)',          color: 'var(--text-secondary)', border: 'var(--border)' };
	}
};

const statusStyle = (s: string) => {
	switch (s) {
		case 'ACTIVE': return { bg: 'rgba(34,197,94,0.08)',  color: '#16A34A', border: 'rgba(34,197,94,0.18)' };
		case 'BLOCK':  return { bg: 'rgba(239,68,68,0.08)',  color: '#DC2626', border: 'rgba(239,68,68,0.18)' };
		case 'DELETE': return { bg: 'var(--hover)',           color: 'var(--text-muted)', border: 'var(--border)' };
		default:       return { bg: 'var(--hover)',           color: 'var(--text-secondary)', border: 'var(--border)' };
	}
};

interface MemberPanelListType {
	members: Member[];
	anchorEl: any;
	menuIconClickHandler: any;
	menuIconCloseHandler: any;
	updateMemberHandler: any;
}

export const MemberPanelList = ({ members, anchorEl, menuIconClickHandler, menuIconCloseHandler, updateMemberHandler }: MemberPanelListType) => {
	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 850 }} size={'medium'}>
					<TableHead>
						<TableRow>
							{headCells.map((c) => (
								<TableCell key={c.id} align={c.align}>{c.label}</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{members.length === 0 && (
							<TableRow>
								<TableCell align="center" colSpan={8}>
									<Typography className={'no-data'}>No members found</Typography>
								</TableCell>
							</TableRow>
						)}

						{members.map((member: Member, index: number) => {
							const memberImage = member.memberImage
								? `${REACT_APP_API_URL}/${member.memberImage}`
								: '/img/profile/defaultUser.svg';
							const ts = typeStyle(member.memberType);
							const ss = statusStyle(member.memberStatus);

							return (
								<TableRow hover key={member._id} sx={{ '&:last-child td': { border: 0 } }}>
									<TableCell align="left">
										<Typography className={'mono-id'}>{member._id}</Typography>
									</TableCell>

									<TableCell align="left" className={'name'}>
										<Stack direction={'row'} alignItems={'center'} gap={'8px'}>
											<Link href={`/member?memberId=${member._id}`}>
												<Avatar src={memberImage} sx={{ width: 28, height: 28 }} />
											</Link>
											<Link href={`/member?memberId=${member._id}`}>
												<Typography className={'row-title'}>{member.memberNick}</Typography>
											</Link>
										</Stack>
									</TableCell>

									<TableCell align="center">
										<Typography className={'meta-text'}>{member.memberFullName ?? '—'}</Typography>
									</TableCell>

									<TableCell align="center">
										<Typography className={'meta-text'}>{member.memberPhone}</Typography>
									</TableCell>

									<TableCell align="center">
										<Button onClick={(e: any) => menuIconClickHandler(e, index)} sx={{
											px: '8px', py: '2px', borderRadius: '5px', fontSize: '10px', fontWeight: 700,
											background: ts.bg, border: `1px solid ${ts.border}`, color: ts.color,
											minWidth: 'auto', letterSpacing: '0.04em', textTransform: 'none',
											'&:hover': { background: ts.bg, opacity: 0.8 },
										}}>
											{member.memberType}
										</Button>
										<Menu className={'menu-modal'} MenuListProps={{ 'aria-labelledby': 'fade-button' }}
											anchorEl={anchorEl[index]} open={Boolean(anchorEl[index])}
											onClose={menuIconCloseHandler} TransitionComponent={Fade}>
											{Object.values(MemberType).filter((e) => e !== member.memberType).map((type: string) => (
												<MenuItem key={type} onClick={() => updateMemberHandler({ _id: member._id, memberType: type })}>
													<Typography variant={'subtitle1'} component={'span'}>{type}</Typography>
												</MenuItem>
											))}
										</Menu>
									</TableCell>

									<TableCell align="center">
										<Box sx={{
											display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
											width: 26, height: 24, borderRadius: '5px',
											background: member.memberWarnings > 0 ? 'rgba(245,158,11,0.08)' : 'var(--hover)',
											border: `1px solid ${member.memberWarnings > 0 ? 'rgba(245,158,11,0.18)' : 'var(--border)'}`,
											fontSize: '11px', fontWeight: 700,
											color: member.memberWarnings > 0 ? '#D97706' : 'var(--text-muted)',
										}}>
											{member.memberWarnings}
										</Box>
									</TableCell>

									<TableCell align="center">
										<Box sx={{
											display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
											width: 26, height: 24, borderRadius: '5px',
											background: member.memberBlocks > 0 ? 'rgba(239,68,68,0.08)' : 'var(--hover)',
											border: `1px solid ${member.memberBlocks > 0 ? 'rgba(239,68,68,0.18)' : 'var(--border)'}`,
											fontSize: '11px', fontWeight: 700,
											color: member.memberBlocks > 0 ? '#DC2626' : 'var(--text-muted)',
										}}>
											{member.memberBlocks}
										</Box>
									</TableCell>

									<TableCell align="center">
										<Button onClick={(e: any) => menuIconClickHandler(e, member._id)} sx={{
											px: '8px', py: '2px', borderRadius: '5px', fontSize: '10px', fontWeight: 700,
											background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color,
											minWidth: 'auto', letterSpacing: '0.04em', textTransform: 'none',
											'&:hover': { background: ss.bg, opacity: 0.8 },
										}}>
											{member.memberStatus}
										</Button>
										<Menu className={'menu-modal'} MenuListProps={{ 'aria-labelledby': 'fade-button' }}
											anchorEl={anchorEl[member._id]} open={Boolean(anchorEl[member._id])}
											onClose={menuIconCloseHandler} TransitionComponent={Fade}>
											{Object.values(MemberStatus).filter((e) => e !== member.memberStatus).map((status: string) => (
												<MenuItem key={status} onClick={() => updateMemberHandler({ _id: member._id, memberStatus: status })}>
													<Typography variant={'subtitle1'} component={'span'}>{status}</Typography>
												</MenuItem>
											))}
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