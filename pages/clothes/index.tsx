import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Box, Pagination, Stack, Typography } from '@mui/material';
import ClotheCard from '../../libs/components/clothes/ClothesCard';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Filter from '../../libs/components/clothes/Filter';
import { useRouter } from 'next/router';
import { ClotheInquiry } from '../../libs/types/clothes/clothes.input';
import { Clothe } from '../../libs/types/clothes/clothes';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Direction, Message } from '../../libs/enums/common.enum';
import { useMutation, useQuery } from '@apollo/client';
import { GET_CLOTHES } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_CLOTHE } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const ClotheList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<ClotheInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [clothes, setClothes] = useState<Clothe[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [filterSortName, setFilterSortName] = useState('New');

	// likedMap: { [clotheId]: { liked: boolean, count: number } }
	const [likedMap, setLikedMap] = useState<Record<string, { liked: boolean; count: number }>>({});

	/** APOLLO **/
	const [likeTargetClothe] = useMutation(LIKE_TARGET_CLOTHE);

	const { refetch: getClothesRefetch } = useQuery(GET_CLOTHES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			const list: Clothe[] = data?.getClothes?.list ?? [];
			setClothes(list);
			setTotal(data?.getClothes?.metaCounter[0]?.total ?? 0);

			// ── DEBUG: meLiked serverdan to'g'ri kelayotganini tekshirish ──
			console.log('=== SERVER DATA ===');
			list.forEach((c) => {
				console.log(`${c.clotheName} | likes: ${c.clotheLikes} | meLiked:`, c.meLiked);
			});
			console.log('==================');

			// Serverdan kelgan like holatini likedMap ga to'liq yuklaymiz
			// (reload qilganda likedMap bo'sh bo'ladi, shuning uchun server data ishlatiladi)
			setLikedMap((prev) => {
				const next = { ...prev };
				list.forEach((c) => {
					// Faqat likedMap da YO'Q itemlarni serverdan yuklaymiz
					// Bor itemlarni override qilmaymiz (like bosgandan keyin refetch bo'lsa)
					if (!(c._id in next)) {
						next[c._id] = {
							liked: !!(c.meLiked && c.meLiked[0]?.myFavorite),
							count: c.clotheLikes ?? 0,
						};
					}
				});
				return next;
			});
		},
	});

	/** LIFECYCLE **/
	useEffect(() => {
		if (router.query.input) {
			const inputObj = JSON.parse(router?.query?.input as string);
			setSearchFilter(inputObj);
		}
		setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
	}, [router]);

	useEffect(() => {
		// Filter o'zgarganda likedMap ni TOZALAYMIZ — yangi list keladi
		setLikedMap({});
		getClothesRefetch({ input: searchFilter }).then();
	}, [searchFilter]);

	/** HANDLERS **/
	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		await router.push(
			`/clothes?input=${JSON.stringify(searchFilter)}`,
			`/clothes?input=${JSON.stringify(searchFilter)}`,
			{ scroll: false },
		);
		setCurrentPage(value);
	};

	const likeClotheHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			// Optimistic update
			setLikedMap((prev) => {
				const current = prev[id] ?? { liked: false, count: 0 };
				return {
					...prev,
					[id]: {
						liked: !current.liked,
						count: current.liked ? current.count - 1 : current.count + 1,
					},
				};
			});

			// Mutation — refetch CHAQIRMAYMIZ
			await likeTargetClothe({ variables: { input: id } });

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			// Xato bo'lsa orqaga qaytaramiz
			setLikedMap((prev) => {
				const current = prev[id];
				if (!current) return prev;
				return {
					...prev,
					[id]: {
						liked: !current.liked,
						count: current.liked ? current.count - 1 : current.count + 1,
					},
				};
			});
			console.log('ERROR, likeClotheHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const sortingHandler = (id: string) => {
		switch (id) {
			case 'new':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: Direction.DESC });
				setFilterSortName('New');
				break;
			case 'lowest':
				setSearchFilter({ ...searchFilter, sort: 'clothePrice', direction: Direction.ASC });
				setFilterSortName('Lowest Price');
				break;
			case 'highest':
				setSearchFilter({ ...searchFilter, sort: 'clothePrice', direction: Direction.DESC });
				setFilterSortName('Highest Price');
				break;
		}
	};

	if (device === 'mobile') {
		return <h1>CLOTHES MOBILE</h1>;
	} else {
		return (
			<div id="clothe-list-page" style={{ position: 'relative' }}>
				<div className="container">
					<Box component={'div'} className={'right'}>
						<div className={'sort-rail'}>
							<span className={'sort-rail__label'}>Sort</span>
							<div className={'sort-rail__options'}>
								<button
									className={`sort-rail__pill${filterSortName === 'New' ? ' active' : ''}`}
									onClick={() => sortingHandler('new')}
								>
									New
								</button>
								<button
									className={`sort-rail__pill${filterSortName === 'Lowest Price' ? ' active' : ''}`}
									onClick={() => sortingHandler('lowest')}
								>
									Low Price
								</button>
								<button
									className={`sort-rail__pill${filterSortName === 'Highest Price' ? ' active' : ''}`}
									onClick={() => sortingHandler('highest')}
								>
									High Price
								</button>
							</div>
						</div>
					</Box>
					<Stack className={'clothe-page'}>
						<Stack className={'filter-config'}>
							{/* @ts-ignore */}
							<Filter searchFilter={searchFilter} setSearchFilter={setSearchFilter} initialInput={initialInput} />
						</Stack>
						<Stack className="main-config" mb={'76px'}>
							<Stack className={'list-config'}>
								{clothes?.length === 0 ? (
									<div className={'no-data'}>
										<img src="/img/icons/icoAlert.svg" alt="" />
										<p>No Clothes found!</p>
									</div>
								) : (
									clothes.map((clothe: Clothe) => (
										<ClotheCard
											clothe={clothe}
											likeClotheHandler={likeClotheHandler}
											likedOverride={likedMap[clothe._id]}
											key={clothe?._id}
										/>
									))
								)}
							</Stack>
							<Stack className="pagination-config">
								{clothes.length !== 0 && (
									<Stack className="pagination-box">
										<Pagination
											page={currentPage}
											count={Math.ceil(total / searchFilter.limit)}
											onChange={handlePaginationChange}
											shape="circular"
											color="primary"
										/>
									</Stack>
								)}
								{clothes.length !== 0 && (
									<Stack className="total-result">
										<Typography>
											Total {total} item{total > 1 ? 's' : ''} available
										</Typography>
									</Stack>
								)}
							</Stack>
						</Stack>
					</Stack>
				</div>
			</div>
		);
	}
};

ClotheList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			pricesRange: { start: 0, end: 2000000 },
		},
	},
};

export default withLayoutBasic(ClotheList);
