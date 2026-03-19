import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { ClotheCard } from './ClotheCard';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Clothe } from '../../types/clothes/clothes';
import { SalesManagerClotheInquiry } from '../../types/clothes/clothes.input';
import { T } from '../../types/common';
import { ClotheStatus } from '../../enums/clothes.enum';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import { GET_SALES_MANAGER_CLOTHES } from '../../../apollo/user/query';
import { UPDATE_CLOTHE } from '../../../apollo/user/mutation';
import { sweetConfirmAlert, sweetErrorHandling } from '../../sweetAlert';

const MyClothes: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const [searchFilter, setSearchFilter] = useState<SalesManagerClotheInquiry>(initialInput);
	const [salesManagerClothes, setSalesManagerClothes] = useState<Clothe[]>([]);
	const [total, setTotal] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** APOLLO REQUESTS **/
	const [updateClothe] = useMutation(UPDATE_CLOTHE);

	const {
		loading: getSalesManagerClothesLoading,
		data: getSalesManagerClothesData,
		error: getSalesManagerClothesError,
		refetch: getSalesManagerClothesRefetch,
	} = useQuery(GET_SALES_MANAGER_CLOTHES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setSalesManagerClothes(data?.getSalesManagerClothes?.list);
			setTotal(data?.getSalesManagerClothes?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const changeStatusHandler = (value: ClotheStatus) => {
		setSearchFilter({ ...searchFilter, search: { clotheStatus: value } });
	};

	const deleteClotheHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to delete this clothing item?')) {
				await updateClothe({
					variables: {
						input: {
							_id: id,
							clotheStatus: 'DELETE',
						},
					},
				});
				await getSalesManagerClothesRefetch({ input: searchFilter });
			}
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const updateClotheHandler = async (status: string, id: string) => {
		try {
			if (await sweetConfirmAlert(`Are you sure to change to ${status} status?`)) {
				await updateClothe({
					variables: {
						input: {
							_id: id,
							clotheStatus: status,
						},
					},
				});
				await getSalesManagerClothesRefetch({ input: searchFilter });
			}
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	if (user?.memberType !== 'SALESMANAGER') {
		router.back();
	}

	if (device === 'mobile') {
		return <div>MY CLOTHES MOBILE</div>;
	} else {
		return (
			<div id="my-clothes-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">My Clothes</Typography>
						<Typography className="sub-title">Manage your clothing inventory</Typography>
					</Stack>
				</Stack>
				<Stack className="clothe-list-box">
					<Stack className="tab-name-box">
						<Typography
							onClick={() => changeStatusHandler(ClotheStatus.ACTIVE)}
							className={searchFilter.search.clotheStatus === 'ACTIVE' ? 'active-tab-name' : 'tab-name'}
						>
							Active
						</Typography>
						<Typography
							onClick={() => changeStatusHandler(ClotheStatus.SOLD)}
							className={searchFilter.search.clotheStatus === 'SOLD' ? 'active-tab-name' : 'tab-name'}
						>
							Sold
						</Typography>
					</Stack>
					<Stack className="list-box">
						<Stack className="listing-title-box">
							<Typography className="title-text">Clothing</Typography>
							<Typography className="title-text">Size</Typography>
							<Typography className="title-text">Gender</Typography>
							<Typography className="title-text">Color</Typography>
							<Typography className="title-text">Status</Typography>
							<Typography className="title-text">Views</Typography>
							{searchFilter.search.clotheStatus === 'ACTIVE' && (
								<Typography className="title-text">Action</Typography>
							)}
						</Stack>

						{salesManagerClothes?.length === 0 ? (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>No Clothing found!</p>
							</div>
						) : (
							salesManagerClothes.map((clothe: Clothe) => {
								return (
									<ClotheCard
										clothe={clothe}
										deleteClotheHandler={deleteClotheHandler}
										updateClotheHandler={updateClotheHandler}
										key={clothe._id}
									/>
								);
							})
						)}

						{salesManagerClothes.length !== 0 && (
							<Stack className="pagination-config">
								<Stack className="pagination-box">
									<Pagination
										count={Math.ceil(total / searchFilter.limit)}
										page={searchFilter.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
									/>
								</Stack>
								<Stack className="total-result">
									<Typography>{total} clothing available</Typography>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		);
	}
};

MyClothes.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		search: {
			clotheStatus: 'ACTIVE',
		},
	},
};

export default MyClothes;