import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Box, Pagination, Stack, Typography } from '@mui/material';
import EquipmentCard from '../../libs/components/equipments/EquipmentCard';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Filter from '../../libs/components/equipments/Filter';
import { useRouter } from 'next/router';
import { EquipmentsInquiry } from '../../libs/types/equipment/equipment.input';
import { Equipment } from '../../libs/types/equipment/equipment';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Direction, Message } from '../../libs/enums/common.enum';
import { useMutation, useQuery } from '@apollo/client';
import { GET_EQUIPMENTS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_EQUIPMENT } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const EquipmentList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<EquipmentsInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [equipments, setEquipments] = useState<Equipment[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [filterSortName, setFilterSortName] = useState('New');

	/** APOLLO REQUESTS **/

	const [likeTargetEquipment] = useMutation(LIKE_TARGET_EQUIPMENT);

	const {
		loading: getEquipmentsLoading,
		data: getEquipmentsData,
		error: getEquipmentsError,
		refetch: getEquipmentsRefetch,
	} = useQuery(GET_EQUIPMENTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setEquipments(data?.getEquipments?.list);
			setTotal(data?.getEquipments?.metaCounter[0]?.total);
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
		console.log('searchFilter:', searchFilter);
	}, [searchFilter]);

	/** HANDLERS **/
	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		await router.push(
			`/equipment?input=${JSON.stringify(searchFilter)}`,
			`/equipment?input=${JSON.stringify(searchFilter)}`,
			{
				scroll: false,
			},
		);
		setCurrentPage(value);
	};

	const likeEquipmentHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetEquipment({
				variables: {
					input: id,
				},
			});

			await getEquipmentsRefetch({ input: initialInput });

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeEquipmentHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const sortingHandler = (id: string) => {
		switch (id) {
			case 'new':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: Direction.ASC });
				setFilterSortName('New');
				break;
			case 'lowest':
				setSearchFilter({ ...searchFilter, sort: 'equipmentPrice', direction: Direction.ASC });
				setFilterSortName('Lowest Price');
				break;
			case 'highest':
				setSearchFilter({ ...searchFilter, sort: 'equipmentPrice', direction: Direction.DESC });
				setFilterSortName('Highest Price');
				break;
		}
	};

	if (device === 'mobile') {
		return <h1>EQUIPMENTS MOBILE</h1>;
	} else {
		return (
			<div id="equipment-list-page" style={{ position: 'relative' }}>
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
					<Stack className={'equipment-page'}>
						<Stack className={'filter-config'}>
							{/* @ts-ignore */}
							<Filter searchFilter={searchFilter} setSearchFilter={setSearchFilter} initialInput={initialInput} />
						</Stack>
						<Stack className="main-config" mb={'76px'}>
							<Stack className={'list-config'}>
								{equipments?.length === 0 ? (
									<div className={'no-data'}>
										<img src="/img/icons/icoAlert.svg" alt="" />
										<p>No Equipments found!</p>
									</div>
								) : (
									equipments.map((equipment: Equipment) => {
										return (
											<EquipmentCard
												equipment={equipment}
												likeEquipmentHandler={likeEquipmentHandler}
												key={equipment?._id}
											/>
										);
									})
								)}
							</Stack>
							<Stack className="pagination-config">
								{equipments.length !== 0 && (
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

								{equipments.length !== 0 && (
									<Stack className="total-result">
										<Typography>
											Total {total} equipment{total > 1 ? 's' : ''} available
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

EquipmentList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			pricesRange: {
				start: 0,
				end: 2000000,
			},
		},
	},
};

export default withLayoutBasic(EquipmentList);