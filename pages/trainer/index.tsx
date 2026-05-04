import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Box, Pagination, Typography } from '@mui/material';
import TrainerCard from '../../libs/components/common/TrainerCard';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Member } from '../../libs/types/member/member';
import { GET_TRAINERS } from '../../apollo/user/query';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { T } from '../../libs/types/common';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { Messages } from '../../libs/config';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import SearchIcon from '@mui/icons-material/Search';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const TrainerList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [activeSort, setActiveSort] = useState('recent');
	const [searchFilter, setSearchFilter] = useState<any>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [trainers, setTrainers] = useState<Member[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchText, setSearchText] = useState<string>('');

	/** APOLLO REQUESTS **/

	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	const {
		loading: getTrainersLoading,
		data: getTrainersData,
		error: getTrainersError,
		refetch: getTrainersRefetch,
	} = useQuery(GET_TRAINERS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTrainers(data?.getTrainers?.list);
			setTotal(data?.getTrainers?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLE **/

	useEffect(() => {
		if (router.query.input) {
			const input_obj = JSON.parse(router?.query?.input as string);
			setSearchFilter(input_obj);
		} else {
			router.replace(
				`/trainer?input=${JSON.stringify(searchFilter)}`,
				`/trainer?input=${JSON.stringify(searchFilter)}`,
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
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeMemberHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const subscribeHandler = async (id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await subscribe({ variables: { input: id } });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, subscribeHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const unsubscribeHandler = async (id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await unsubscribe({ variables: { input: id } });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, unsubscribeHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const sortingHandler = (sortId: string) => {
		setActiveSort(sortId);
		switch (sortId) {
			case 'recent':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: 'DESC' });
				break;
			case 'oldest':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: 'ASC' });
				break;
			case 'likes':
				setSearchFilter({ ...searchFilter, sort: 'memberLikes', direction: 'DESC' });
				break;
			case 'views':
				setSearchFilter({ ...searchFilter, sort: 'memberViews', direction: 'DESC' });
				break;
		}
	};

	const handleSearch = () => {
		setSearchFilter({
			...searchFilter,
			search: { ...searchFilter.search, text: searchText },
		});
	};

	const paginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		await router.push(
			`/trainer?input=${JSON.stringify(searchFilter)}`,
			`/trainer?input=${JSON.stringify(searchFilter)}`,
			{ scroll: false },
		);
		setCurrentPage(value);
	};

	const sortTabs = [
		{ id: 'recent', label: 'Recent' },
		{ id: 'oldest', label: 'Oldest' },
		{ id: 'likes', label: 'Most Liked' },
		{ id: 'views', label: 'Most Viewed' },
	];

	if (device === 'mobile') {
		return <h1>TRAINERS PAGE MOBILE</h1>;
	} else {
		return (
			<Stack className={'trainer-list-page'}>
				<Stack className={'container'}>
					{/* ─── Hero Section ─── */}
					<Box className={'page-hero'}>
						<Typography className="hero-title">Our Trainers</Typography>
						<Typography className="hero-subtitle">
							Find the perfect trainer to guide your fitness journey
						</Typography>
					</Box>

					{/* ─── Search & Sort Toolbar ─── */}
					<Stack className={'toolbar'}>
						<div className={'search-box'}>
							<SearchIcon className="search-icon" />
							<input
								type="text"
								placeholder={'Search trainers by name...'}
								value={searchText}
								onChange={(e: any) => setSearchText(e.target.value)}
								onKeyDown={(event: any) => {
									if (event.key === 'Enter') handleSearch();
								}}
							/>
						</div>

						<div className={'sort-tabs'}>
							{sortTabs.map((tab) => (
								<button
									key={tab.id}
									className={`sort-tab ${activeSort === tab.id ? 'active' : ''}`}
									onClick={() => sortingHandler(tab.id)}
								>
									{tab.label}
								</button>
							))}
						</div>
					</Stack>

					{/* ─── Results info ─── */}
					{trainers?.length > 0 && (
						<div className={'results-info'}>
							<span>
								Showing <strong>{trainers.length}</strong> of <strong>{total}</strong> trainers
							</span>
						</div>
					)}

					{/* ─── Cards Grid ─── */}
					<Stack className={'card-wrap'}>
						{getTrainersLoading ? (
							<div className={'loading-state'}>
								<div className="loader" />
								<p>Loading trainers...</p>
							</div>
						) : trainers?.length === 0 ? (
							<div className={'no-data'}>
								<div className="empty-icon">
									<svg width="64" height="64" viewBox="0 0 64 64" fill="none">
										<circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
										<path d="M24 26C24 23.8 25.8 22 28 22C30.2 22 32 23.8 32 26C32 28.2 30.2 30 28 30C25.8 30 24 28.2 24 26Z" stroke="currentColor" strokeWidth="2" />
										<path d="M32 34C32 31.8 33.8 30 36 30C38.2 30 40 31.8 40 34C40 36.2 38.2 38 36 38C33.8 38 32 36.2 32 34Z" stroke="currentColor" strokeWidth="2" />
										<path d="M20 42C20 38 23.6 36 28 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
										<path d="M36 44C40.4 44 44 42 44 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
									</svg>
								</div>
								<p className="empty-title">No trainers found</p>
								<p className="empty-desc">Try adjusting your search or filters</p>
							</div>
						) : (
							trainers.map((trainer: Member) => (
								<TrainerCard
									trainer={trainer}
									key={trainer._id}
									likeMemberHandler={likeMemberHandler}
									subscribeHandler={subscribeHandler}
									unsubscribeHandler={unsubscribeHandler}
								/>
							))
						)}
					</Stack>

					{/* ─── Pagination ─── */}
					{trainers.length !== 0 && Math.ceil(total / searchFilter.limit) > 1 && (
						<Stack className={'pagination'}>
							<Pagination
								page={currentPage}
								count={Math.ceil(total / searchFilter.limit)}
								onChange={paginationChangeHandler}
								shape="rounded"
								color="primary"
								size="large"
							/>
						</Stack>
					)}
				</Stack>
			</Stack>
		);
	}
};

TrainerList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 12,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withLayoutBasic(TrainerList);
