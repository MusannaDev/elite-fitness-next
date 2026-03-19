import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Box, Pagination } from '@mui/material';
import SalesManagerCard from '../../libs/components/common/SalesManagerCard';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Member } from '../../libs/types/member/member';
import { GET_SALES_MANAGERS } from '../../apollo/user/query';
import { useMutation, useQuery } from '@apollo/client';
import { T } from '../../libs/types/common';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { Messages } from '../../libs/config';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const SORT_OPTIONS = [
	{ id: 'recent', label: 'Recent', sort: 'createdAt', direction: 'DESC' },
	{ id: 'old', label: 'Oldest', sort: 'createdAt', direction: 'ASC' },
	{ id: 'likes', label: 'Most Liked', sort: 'memberLikes', direction: 'DESC' },
	{ id: 'views', label: 'Most Viewed', sort: 'memberViews', direction: 'DESC' },
];

const SalesManagerList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [activeSortId, setActiveSortId] = useState<string>('recent');
	const [searchFilter, setSearchFilter] = useState<any>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [salesManagers, setSalesManagers] = useState<Member[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchText, setSearchText] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	const {
		loading: getSalesManagersLoading,
		data: getSalesManagersData,
		error: getSalesManagersError,
		refetch: getSalesManagersRefetch,
	} = useQuery(GET_SALES_MANAGERS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setSalesManagers(data?.getSalesManagers?.list);
			setTotal(data?.getSalesManagers?.metaCounter[0]?.total);
		},
	});

	/** LIFECYCLE **/
	useEffect(() => {
		if (router.query.input) {
			const input_obj = JSON.parse(router?.query?.input as string);
			setSearchFilter(input_obj);
		} else {
			router.replace(
				`/sales-manager?input=${JSON.stringify(searchFilter)}`,
				`/sales-manager?input=${JSON.stringify(searchFilter)}`,
			);
		}
		setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
	}, [router]);

	/** HANDLERS **/
	const likeMemberHandler = async (user: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetMember({ variables: { input: id } });
			await getSalesManagersRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeMemberHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const sortingHandler = (option: typeof SORT_OPTIONS[0]) => {
		setActiveSortId(option.id);
		setSearchFilter({
			...searchFilter,
			sort: option.sort,
			direction: option.direction,
		});
	};

	const paginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		await router.push(
			`/sales-manager?input=${JSON.stringify(searchFilter)}`,
			`/sales-manager?input=${JSON.stringify(searchFilter)}`,
			{ scroll: false },
		);
		setCurrentPage(value);
	};

	if (device === 'mobile') {
		return <h1>SALES MANAGERS PAGE MOBILE</h1>;
	} else {
		return (
			<Stack className={'sales-manager-list-page'}>
				<Stack className={'container'}>

					{/* Page header */}
					<Box component={'div'} className={'page-header'}>
						<h1 className={'page-title'}>Sales Managers</h1>
						<p className={'page-subtitle'}>
							{total > 0 ? `${total} manager${total > 1 ? 's' : ''} available` : 'No managers found'}
						</p>
					</Box>

					<Stack className={'content-layout'}>

						{/* Sticky Sidebar Filter */}
						<Box component={'div'} className={'sidebar-filter'}>
							{/* Search */}
							<div className={'sidebar-section'}>
								<span className={'sidebar-label'}>Search</span>
								<div className={'sidebar-search-wrap'}>
									<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
										<circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
										<path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
									</svg>
									<input
										type="text"
										placeholder="Search..."
										className={'sidebar-search'}
										value={searchText}
										onChange={(e) => setSearchText(e.target.value)}
										onKeyDown={(e: any) => {
											if (e.key === 'Enter') {
												setSearchFilter({
													...searchFilter,
													search: { ...searchFilter.search, text: searchText },
												});
											}
										}}
									/>
								</div>
							</div>

							{/* Sort */}
							<div className={'sidebar-section'}>
								<span className={'sidebar-label'}>Sort by</span>
								<div className={'sidebar-sort-list'}>
									{SORT_OPTIONS.map((option) => (
										<button
											key={option.id}
											className={`sidebar-sort-item ${activeSortId === option.id ? 'active' : ''}`}
											onClick={() => sortingHandler(option)}
										>
											<span className={'sort-dot'} />
											{option.label}
										</button>
									))}
								</div>
							</div>
						</Box>

						{/* Cards Grid */}
						<Stack className={'cards-area'}>
							{getSalesManagersLoading ? (
								<div className={'loading-state'}>
									{[1,2,3,4,5,6].map((i) => (
										<div key={i} className={'skeleton-blob'} />
									))}
								</div>
							) : salesManagers?.length === 0 ? (
								<div className={'no-data'}>
									<img src="/img/icons/icoAlert.svg" alt="" />
									<p>No Sales Managers found!</p>
								</div>
							) : (
								<div className={'card-grid'}>
									{salesManagers.map((salesManager: Member) => (
										<SalesManagerCard
											salesManager={salesManager}
											key={salesManager._id}
											likeMemberHandler={likeMemberHandler}
											refetch={() => getSalesManagersRefetch({ input: searchFilter })}
										/>
									))}
								</div>
							)}

							{/* Pagination */}
							{salesManagers.length !== 0 && Math.ceil(total / searchFilter.limit) > 1 && (
								<Stack className={'pagination-wrap'}>
									<Pagination
										page={currentPage}
										count={Math.ceil(total / searchFilter.limit)}
										onChange={paginationChangeHandler}
										shape="circular"
										color="primary"
									/>
								</Stack>
							)}
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

SalesManagerList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withLayoutBasic(SalesManagerList);