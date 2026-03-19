import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { EquipmentCard } from './EquipmentCard';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Equipment } from '../../types/equipment/equipment';
import { SalesManagerEquipmentsInquiry } from '../../types/equipment/equipment.input';
import { T } from '../../types/common';
import { EquipmentStatus } from '../../enums/equipment.enum';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import { GET_SALES_MANAGER_EQUIPMENTS } from '../../../apollo/user/query';
import { UPDATE_EQUIPMENT } from '../../../apollo/user/mutation';
import { sweetConfirmAlert, sweetErrorHandling } from '../../sweetAlert';

const MyEquipments: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const [searchFilter, setSearchFilter] = useState<SalesManagerEquipmentsInquiry>(initialInput);
	const [salesManagerEquipments, setSalesManagerEquipments] = useState<Equipment[]>([]);
	const [total, setTotal] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** APOLLO REQUESTS **/
	const [updateEquipment] = useMutation(UPDATE_EQUIPMENT);

	const {
		loading: getSalesManagerEquipmentsLoading,
		data: getSalesManagerEquipmentsData,
		error: getSalesManagerEquipmentsError,
		refetch: getSalesManagerEquipmentsRefetch,
	} = useQuery(GET_SALES_MANAGER_EQUIPMENTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setSalesManagerEquipments(data?.getSalesManagerEquipments?.list);
			setTotal(data?.getSalesManagerEquipments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const changeStatusHandler = (value: EquipmentStatus) => {
		setSearchFilter({ ...searchFilter, search: { equipmentStatus: value } });
	};

	const deleteEquipmentHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to delete this equipment?')) {
				await updateEquipment({
					variables: {
						input: {
							_id: id,
							equipmentStatus: 'DELETE',
						},
					},
				});
				await getSalesManagerEquipmentsRefetch({ input: searchFilter });
			}
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const updateEquipmentHandler = async (status: string, id: string) => {
		try {
			if (await sweetConfirmAlert(`Are you sure to change to ${status} status?`)) {
				await updateEquipment({
					variables: {
						input: {
							_id: id,
							equipmentStatus: status,
						},
					},
				});
				await getSalesManagerEquipmentsRefetch({ input: searchFilter });
			}
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	if (user?.memberType !== 'SALESMANAGER') {
		router.back();
	}

	if (device === 'mobile') {
		return <div>MY EQUIPMENTS MOBILE</div>;
	} else {
		return (
			<div id="my-equipments-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">My Equipments</Typography>
						<Typography className="sub-title">Manage your gym equipment inventory</Typography>
					</Stack>
				</Stack>
				<Stack className="equipment-list-box">
					<Stack className="tab-name-box">
						<Typography
							onClick={() => changeStatusHandler(EquipmentStatus.ACTIVE)}
							className={searchFilter.search.equipmentStatus === 'ACTIVE' ? 'active-tab-name' : 'tab-name'}
						>
							Active
						</Typography>
						<Typography
							onClick={() => changeStatusHandler(EquipmentStatus.SOLD)}
							className={searchFilter.search.equipmentStatus === 'SOLD' ? 'active-tab-name' : 'tab-name'}
						>
							Sold
						</Typography>
					</Stack>
					<Stack className="list-box">
						<Stack className="listing-title-box">
							<Typography className="title-text">Equipment</Typography>
							<Typography className="title-text">Category</Typography>
							<Typography className="title-text">Material</Typography>
							<Typography className="title-text">Status</Typography>
							<Typography className="title-text">Views</Typography>
							{searchFilter.search.equipmentStatus === 'ACTIVE' && (
								<Typography className="title-text">Action</Typography>
							)}
						</Stack>

						{salesManagerEquipments?.length === 0 ? (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>No Equipment found!</p>
							</div>
						) : (
							salesManagerEquipments.map((equipment: Equipment) => {
								return (
									<EquipmentCard
										equipment={equipment}
										deleteEquipmentHandler={deleteEquipmentHandler}
										updateEquipmentHandler={updateEquipmentHandler}
										key={equipment._id}
									/>
								);
							})
						)}

						{salesManagerEquipments.length !== 0 && (
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
									<Typography>{total} equipment available</Typography>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		);
	}
};

MyEquipments.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		search: {
			equipmentStatus: 'ACTIVE',
		},
	},
};

export default MyEquipments;