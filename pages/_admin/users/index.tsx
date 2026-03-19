import React, { useCallback, useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { MemberPanelList } from '../../../libs/components/admin/users/MemberList';
import { Box, InputAdornment, List, ListItem, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import OutlinedInput from '@mui/material/OutlinedInput';
import TablePagination from '@mui/material/TablePagination';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { MembersInquiry } from '../../../libs/types/member/member.input';
import { Member } from '../../../libs/types/member/member';
import { MemberStatus, MemberType } from '../../../libs/enums/member.enum';
import { sweetErrorHandling } from '../../../libs/sweetAlert';
import { MemberUpdate } from '../../../libs/types/member/member.update';
import { UPDATE_MEMBER_BY_ADMIN } from '../../../apollo/admin/mutation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../../apollo/admin/query';
import { T } from '../../../libs/types/common';

const AdminUsers: NextPage = ({ initialInquiry, ...props }: any) => {
	const router = useRouter();
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [membersInquiry, setMembersInquiry] = useState<MembersInquiry>(initialInquiry);
	const [members, setMembers] = useState<Member[]>([]);
	const [membersTotal, setMembersTotal] = useState<number>(0);
	const [value, setValue] = useState(
		membersInquiry?.search?.memberStatus ? membersInquiry?.search?.memberStatus : 'ALL',
	);
	const [searchText, setSearchText] = useState('');
	const [searchType, setSearchType] = useState('ALL');

	/** APOLLO REQUESTS **/
	const [updateMemberByAdmin] = useMutation(UPDATE_MEMBER_BY_ADMIN);

	const {
		data: getAllMembersByAdminData,
		error: getAllMembersByAdminError,
		refetch: getAllMembersRefetch,
	} = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: membersInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMembers(data?.getAllMembersByAdmin?.list);
			setMembersTotal(data?.getAllMembersByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLE **/
	useEffect(() => {
		if (!router.isReady) return;
		const pageParam = Array.isArray(router.query.page) ? router.query.page[0] : router.query.page;
		const limitParam = Array.isArray(router.query.limit) ? router.query.limit[0] : router.query.limit;
		const nextPage = pageParam ? Math.max(parseInt(pageParam as string, 10), 1) : undefined;
		const nextLimit = limitParam ? Math.max(parseInt(limitParam as string, 10), 1) : undefined;
		if (nextPage || nextLimit) {
			setMembersInquiry((prev) => ({ ...prev, page: nextPage ?? prev.page, limit: nextLimit ?? prev.limit }));
		}
	}, [router.isReady, router.query.page, router.query.limit]);

	useEffect(() => {
		setMembers(getAllMembersByAdminData?.getAllMembersByAdmin?.list ?? []);
		setMembersTotal(getAllMembersByAdminData?.getAllMembersByAdmin?.metaCounter?.[0]?.total ?? 0);
	}, [getAllMembersByAdminData]);

	useEffect(() => {
		if (getAllMembersByAdminError) sweetErrorHandling(getAllMembersByAdminError).then();
	}, [getAllMembersByAdminError]);

	useEffect(() => {
		getAllMembersRefetch({ input: membersInquiry }).then();
	}, [membersInquiry]);

	/** HANDLERS **/
	const changePageHandler = async (event: unknown, newPage: number) => {
		await getAllMembersRefetch({ input: membersInquiry });
		setMembersInquiry((prev) => ({ ...prev, page: newPage + 1 }));
		router.push({ pathname: router.pathname, query: { ...router.query, page: newPage + 1, limit: membersInquiry.limit } }, undefined, { shallow: true });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const nextLimit = parseInt(event.target.value, 10);
		await getAllMembersRefetch({ input: membersInquiry });
		setMembersInquiry((prev) => ({ ...prev, limit: nextLimit, page: 1 }));
		router.push({ pathname: router.pathname, query: { ...router.query, page: 1, limit: nextLimit } }, undefined, { shallow: true });
	};

	const menuIconClickHandler = (e: any, index: number) => {
		const tempAnchor = anchorEl.slice();
		tempAnchor[index] = e.currentTarget;
		setAnchorEl(tempAnchor);
	};

	const menuIconCloseHandler = () => setAnchorEl([]);

	const tabChangeHandler = async (event: any, newValue: string) => {
		setValue(newValue);
		setSearchText('');
		setMembersInquiry((prev) => {
			const nextSearch = { ...prev.search };
			delete nextSearch.memberStatus;
			switch (newValue) {
				case 'ACTIVE': nextSearch.memberStatus = MemberStatus.ACTIVE; break;
				case 'BLOCK':  nextSearch.memberStatus = MemberStatus.BLOCK; break;
				case 'DELETE': nextSearch.memberStatus = MemberStatus.DELETE; break;
			}
			return { ...prev, page: 1, sort: 'createdAt', search: nextSearch };
		});
	};

	const updateMemberHandler = async (updateData: MemberUpdate) => {
		try {
			await updateMemberByAdmin({ variables: { input: updateData } });
			menuIconCloseHandler();
			await getAllMembersRefetch({ input: membersInquiry });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const textHandler = useCallback((value: string) => setSearchText(value), []);

	const searchTextHandler = () => {
		setMembersInquiry((prev) => ({ ...prev, search: { ...prev.search, text: searchText } }));
	};

	const searchTypeHandler = async (newValue: string) => {
		try {
			setSearchType(newValue);
			if (newValue !== 'ALL') {
				setMembersInquiry((prev) => ({ ...prev, page: 1, sort: 'createdAt', search: { ...prev.search, memberType: newValue as MemberType } }));
			} else {
				setMembersInquiry((prev) => {
					const nextSearch = { ...prev.search };
					delete nextSearch.memberType;
					return { ...prev, search: nextSearch };
				});
			}
		} catch (err: any) {
			console.log('searchTypeHandler: ', err.message);
		}
	};

	return (
		<Box component={'div'} className={'content'}>
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '20px' }}>
				Member List
			</Typography>
			<Box component={'div'} className={'table-wrap'}>
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={value}>
						<Box component={'div'}>
							<List className={'tab-menu'}>
								{['ALL', 'ACTIVE', 'BLOCK', 'DELETE'].map((tab) => (
									<ListItem
										key={tab}
										onClick={(e: any) => tabChangeHandler(e, tab)}
										value={tab}
										className={value === tab ? 'li on' : 'li'}
									>
										{tab === 'ALL' ? 'All' : tab === 'BLOCK' ? 'Blocked' : tab === 'DELETE' ? 'Deleted' : 'Active'}
									</ListItem>
								))}
							</List>
							<Divider />
							<Stack className={'search-area'} sx={{ m: '0' }}>
								<OutlinedInput
									value={searchText}
									onChange={(e: any) => textHandler(e.target.value)}
									sx={{ width: '100%' }}
									className={'search'}
									placeholder="Search user name"
									onKeyDown={(event) => { if (event.key === 'Enter') searchTextHandler(); }}
									endAdornment={
										<>
											{searchText && (
												<CancelRoundedIcon
													style={{ cursor: 'pointer' }}
													onClick={() => {
														setSearchText('');
														setMembersInquiry((prev) => ({ ...prev, search: { ...prev.search, text: '' } }));
													}}
												/>
											)}
											<InputAdornment position="end" onClick={() => searchTextHandler()}>
												<img src="/img/icons/search_icon.png" alt={'searchIcon'} />
											</InputAdornment>
										</>
									}
								/>
								<Select sx={{ width: '160px', ml: '12px' }} value={searchType}>
									<MenuItem value={'ALL'} onClick={() => searchTypeHandler('ALL')}>All</MenuItem>
									<MenuItem value={'USER'} onClick={() => searchTypeHandler('USER')}>User</MenuItem>
									<MenuItem value={'AGENT'} onClick={() => searchTypeHandler('AGENT')}>Agent</MenuItem>
									<MenuItem value={'ADMIN'} onClick={() => searchTypeHandler('ADMIN')}>Admin</MenuItem>
								</Select>
							</Stack>
							<Divider />
						</Box>
						<MemberPanelList
							members={members}
							anchorEl={anchorEl}
							menuIconClickHandler={menuIconClickHandler}
							menuIconCloseHandler={menuIconCloseHandler}
							updateMemberHandler={updateMemberHandler}
						/>
						<TablePagination
							rowsPerPageOptions={[10, 20, 40, 60]}
							component="div"
							count={membersTotal}
							rowsPerPage={membersInquiry?.limit}
							page={membersInquiry?.page - 1}
							onPageChange={changePageHandler}
							onRowsPerPageChange={changeRowsPerPageHandler}
						/>
					</TabContext>
				</Box>
			</Box>
		</Box>
	);
};

AdminUsers.defaultProps = {
	initialInquiry: { page: 1, limit: 10, sort: 'createdAt', direction: 'DESC', search: {} },
};

export default withAdminLayout(AdminUsers);