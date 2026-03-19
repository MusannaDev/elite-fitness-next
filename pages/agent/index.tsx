import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Box, Pagination } from '@mui/material';
import AgentCard from '../../libs/components/common/AgentCard';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Member } from '../../libs/types/member/member';
import { GET_AGENTS } from '../../apollo/user/query';
import { useMutation, useQuery } from '@apollo/client';
import { T } from '../../libs/types/common';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { Messages } from '../../libs/config';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const SORT_OPTIONS = [
	{
		key: 'recent',
		sort: 'createdAt',
		direction: 'DESC',
		label: 'New',
		icon: (
			<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
				<path d="M8 2v12M4 10l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
			</svg>
		),
	},
	{
		key: 'old',
		sort: 'createdAt',
		direction: 'ASC',
		label: 'Old',
		icon: (
			<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
				<path d="M8 14V2M4 6l4-4 4 4" strokeLinecap="round" strokeLinejoin="round"/>
			</svg>
		),
	},
	{
		key: 'likes',
		sort: 'memberLikes',
		direction: 'DESC',
		label: 'Like',
		icon: (
			<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
				<path d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.6 3.1 2 5 2c1.1 0 2.1.5 2.8 1.3L8 4l.2-.7C8.9 2.5 9.9 2 11 2c1.9 0 3.5 1.6 3.5 3.5 0 4-6.5 8-6.5 8z" strokeLinecap="round" strokeLinejoin="round"/>
			</svg>
		),
	},
	{
		key: 'views',
		sort: 'memberViews',
		direction: 'DESC',
		label: "Views",
		icon: (
			<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
				<path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/>
				<circle cx="8" cy="8" r="2"/>
			</svg>
		),
	},
	{
		key: 'followings',
		sort: 'memberFollowings',
		direction: 'DESC',
		label: 'Follow',
		icon: (
			<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
				<circle cx="6" cy="5" r="3"/>
				<path d="M1 13c0-2.8 2.2-5 5-5"/>
				<path d="M12 9v4M10 11h4" strokeLinecap="round"/>
			</svg>
		),
	},
];

const AgentList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [activeSort, setActiveSort] = useState<string>('recent');
	const [searchFilter, setSearchFilter] = useState<any>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [agents, setAgents] = useState<Member[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchText, setSearchText] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);
	const [followMember] = useMutation(SUBSCRIBE);

	const {
		loading: getAgentsLoading,
		data: getAgentsData,
		error: getAgentsError,
		refetch: getAgentsRefetch,
	} = useQuery(GET_AGENTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgents(data?.getAgents?.list);
			setTotal(data?.getAgents?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLE **/
	useEffect(() => {
		if (router.query.input) {
			const input_obj = JSON.parse(router?.query?.input as string);
			setSearchFilter(input_obj);
		} else {
			router.replace(
				`/agent?input=${JSON.stringify(searchFilter)}`,
				`/agent?input=${JSON.stringify(searchFilter)}`,
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
			await getAgentsRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeMemberHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const followMemberHandler = async (user: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			await followMember({ variables: { input: id } });
			await getAgentsRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, followMemberHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const sortingHandler = (option: typeof SORT_OPTIONS[0]) => {
		setActiveSort(option.key);
		setSearchFilter({ ...searchFilter, sort: option.sort, direction: option.direction });
	};

	const paginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		await router.push(
			`/agent?input=${JSON.stringify(searchFilter)}`,
			`/agent?input=${JSON.stringify(searchFilter)}`,
			{ scroll: false },
		);
		setCurrentPage(value);
	};

	if (device === 'mobile') {
		return <h1>AGENTS PAGE MOBILE</h1>;
	}

	return (
		<Stack className="agent-list-page">
			<Stack className="container">
				{/* Header */}
				<Box className="page-header">
					<h1 className="page-title">Agentlar</h1>
					<p className="page-sub">Sertifikatlangan ko'chmas mulk mutaxassislari</p>
				</Box>

				{/* Toolbar */}
				<Box className="toolbar">
					{/* Search */}
					<Box className="search-wrap">
						<svg className="search-icon" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
							<circle cx="6.5" cy="6.5" r="4.5"/>
							<path d="M11 11l3 3" strokeLinecap="round"/>
						</svg>
						<input
							type="text"
							className="search-input"
							placeholder="Agent qidirish..."
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									setSearchFilter({
										...searchFilter,
										search: { ...searchFilter.search, text: searchText },
									});
								}
							}}
						/>
					</Box>

					{/* Sort icon buttons */}
					<Box className="sort-icon-group">
						{SORT_OPTIONS.map((opt) => (
							<button
								key={opt.key}
								className={`sort-icon-btn ${activeSort === opt.key ? 'active' : ''}`}
								onClick={() => sortingHandler(opt)}
							>
								<span className="sico">{opt.icon}</span>
								<span className="slbl">{opt.label}</span>
							</button>
						))}
					</Box>

					{/* Count */}
					{total > 0 && (
						<span className="agents-count">{total} ta agent</span>
					)}
				</Box>

				{/* Cards */}
				<Box className="hex-grid">
					{agents?.length === 0 ? (
						<Box className="no-data">
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>Agent topilmadi</p>
						</Box>
					) : (
						agents.map((agent: Member, index: number) => (
							<AgentCard
								agent={agent}
								key={agent._id}
								likeMemberHandler={likeMemberHandler}
								followMemberHandler={followMemberHandler}
								colorIndex={index}
							/>
						))
					)}
				</Box>

				{/* Pagination */}
				<Stack className="pagination">
					{agents.length !== 0 && Math.ceil(total / searchFilter.limit) > 1 && (
						<Pagination
							page={currentPage}
							count={Math.ceil(total / searchFilter.limit)}
							onChange={paginationChangeHandler}
							shape="rounded"
							color="primary"
						/>
					)}
					{agents.length !== 0 && (
						<span className="total-label">
							Jami {total} ta agent
						</span>
					)}
				</Stack>
			</Stack>
		</Stack>
	);
};

AgentList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withLayoutBasic(AgentList);