import React, { useCallback, useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, List, ListItem, Stack, InputAdornment, OutlinedInput } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import TablePagination from '@mui/material/TablePagination';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { EquipmentPanelList } from '../../../libs/components/admin/equipments/EquipmentList';
import { AllEquipmentsInquiry } from '../../../libs/types/equipment/equipment.input';
import { Equipment } from '../../../libs/types/equipment/equipment';
import { EquipmentCategory, EquipmentStatus } from '../../../libs/enums/equipment.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { EquipmentUpdate } from '../../../libs/types/equipment/equipment.update';
import { REMOVE_EQUIPMENT_BY_ADMIN, UPDATE_EQUIPMENT_BY_ADMIN } from '../../../apollo/admin/mutation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_EQUIPMENTS_BY_ADMIN } from '../../../apollo/admin/query';
import { T } from '../../../libs/types/common';

const AdminEquipments: NextPage = ({ initialInquiry, ...props }: any) => {
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [equipmentsInquiry, setEquipmentsInquiry] = useState<AllEquipmentsInquiry>(initialInquiry);
	const [equipments, setEquipments] = useState<Equipment[]>([]);
	const [equipmentsTotal, setEquipmentsTotal] = useState<number>(0);
	const [value, setValue] = useState(
		equipmentsInquiry?.search?.equipmentStatus ? equipmentsInquiry?.search?.equipmentStatus : 'ALL',
	);
	const [searchText, setSearchText] = useState('');
	const [categoryType, setCategoryType] = useState('ALL');

	/** APOLLO REQUESTS **/
	const [updateEquipmentByAdmin] = useMutation(UPDATE_EQUIPMENT_BY_ADMIN);
	const [removeEquipmentByAdmin] = useMutation(REMOVE_EQUIPMENT_BY_ADMIN);

	const {
		data: getAllEquipmentsByAdminData,
		error: getAllEquipmentsByAdminError,
		refetch: getAllEquipmentsRefetch,
	} = useQuery(GET_ALL_EQUIPMENTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: equipmentsInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setEquipments(data?.getAllEquipmentsByAdmin?.list ?? []);
			setEquipmentsTotal(data?.getAllEquipmentsByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLE **/
	useEffect(() => {
		if (getAllEquipmentsByAdminError) sweetErrorHandling(getAllEquipmentsByAdminError).then();
	}, [getAllEquipmentsByAdminError]);

	useEffect(() => {
		getAllEquipmentsRefetch({ input: equipmentsInquiry }).then();
	}, [equipmentsInquiry]);

	/** HANDLERS **/
	const changePageHandler = async (event: unknown, newPage: number) => {
		equipmentsInquiry.page = newPage + 1;
		getAllEquipmentsRefetch({ input: equipmentsInquiry });
		setEquipmentsInquiry({ ...equipmentsInquiry });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		equipmentsInquiry.limit = parseInt(event.target.value, 10);
		equipmentsInquiry.page = 1;
		getAllEquipmentsRefetch({ input: equipmentsInquiry });
		setEquipmentsInquiry({ ...equipmentsInquiry });
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
		setEquipmentsInquiry((prev) => {
			const nextSearch = { ...prev.search };
			delete nextSearch.equipmentStatus;
			switch (newValue) {
				case 'ACTIVE': nextSearch.equipmentStatus = EquipmentStatus.ACTIVE; break;
				case 'SOLD':   nextSearch.equipmentStatus = EquipmentStatus.SOLD; break;
				case 'DELETE': nextSearch.equipmentStatus = EquipmentStatus.DELETE; break;
			}
			return { ...prev, page: 1, sort: 'createdAt', search: nextSearch };
		});
	};

	const removeEquipmentHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to remove?')) {
				await removeEquipmentByAdmin({ variables: { input: id } });
				await getAllEquipmentsRefetch({ input: equipmentsInquiry });
			}
			menuIconCloseHandler();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const categoryFilterHandler = async (newValue: string) => {
		try {
			setCategoryType(newValue);
			if (newValue !== 'ALL') {
				setEquipmentsInquiry((prev) => ({
					...prev, page: 1,
					search: { ...prev.search, categoryList: [newValue as EquipmentCategory] },
				}));
			} else {
				setEquipmentsInquiry((prev) => {
					const next = { ...prev.search };
					delete next.categoryList;
					return { ...prev, page: 1, search: next };
				});
			}
		} catch (err: any) {
			console.log('categoryFilterHandler:', err.message);
		}
	};

	const textHandler = useCallback((val: string) => setSearchText(val), []);

	const searchTextHandler = () => {
		setEquipmentsInquiry((prev) => ({ ...prev, search: { ...prev.search, text: searchText } }));
	};

	const updateEquipmentHandler = async (updateData: EquipmentUpdate) => {
		try {
			await updateEquipmentByAdmin({ variables: { input: updateData } });
			menuIconCloseHandler();
			await getAllEquipmentsRefetch({ input: equipmentsInquiry });
		} catch (err: any) {
			menuIconCloseHandler();
			sweetErrorHandling(err).then();
		}
	};

	return (
		<Box component={'div'} className={'content'}>
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '20px' }}>
				Equipment List
			</Typography>
			<Box component={'div'} className={'table-wrap'}>
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={value}>
						<Box component={'div'}>
							<List className={'tab-menu'}>
								{['ALL', 'ACTIVE', 'SOLD', 'DELETE'].map((tab) => (
									<ListItem key={tab} onClick={(e: any) => tabChangeHandler(e, tab)} value={tab}
										className={value === tab ? 'li on' : 'li'}>
										{tab === 'ALL' ? 'All' : tab === 'DELETE' ? 'Deleted' : tab.charAt(0) + tab.slice(1).toLowerCase()}
									</ListItem>
								))}
							</List>
							<Divider />
							<Stack className={'search-area'} sx={{ m: '0' }}>
								<OutlinedInput value={searchText} onChange={(e) => textHandler(e.target.value)}
									sx={{ width: '100%' }} placeholder="Search equipment name"
									onKeyDown={(e) => { if (e.key === 'Enter') searchTextHandler(); }}
									endAdornment={<>
										{searchText && <CancelRoundedIcon style={{ cursor: 'pointer' }} onClick={() => {
											setSearchText('');
											setEquipmentsInquiry((prev) => ({ ...prev, search: { ...prev.search, text: '' } }));
										}} />}
										<InputAdornment position="end" onClick={searchTextHandler}>
											<img src="/img/icons/search_icon.png" alt={'search'} style={{ cursor: 'pointer' }} />
										</InputAdornment>
									</>}
								/>
								<Select sx={{ width: '180px', ml: '12px' }} value={categoryType}>
									<MenuItem value={'ALL'} onClick={() => categoryFilterHandler('ALL')}>All Categories</MenuItem>
									{Object.values(EquipmentCategory).map((cat) => (
										<MenuItem key={cat} value={cat} onClick={() => categoryFilterHandler(cat)}>{cat}</MenuItem>
									))}
								</Select>
							</Stack>
							<Divider />
						</Box>
						<EquipmentPanelList equipments={equipments} anchorEl={anchorEl}
							menuIconClickHandler={menuIconClickHandler} menuIconCloseHandler={menuIconCloseHandler}
							updateEquipmentHandler={updateEquipmentHandler} removeEquipmentHandler={removeEquipmentHandler}
						/>
						<TablePagination rowsPerPageOptions={[10, 20, 40, 60]} component="div" count={equipmentsTotal}
							rowsPerPage={equipmentsInquiry?.limit} page={equipmentsInquiry?.page - 1}
							onPageChange={changePageHandler} onRowsPerPageChange={changeRowsPerPageHandler}
						/>
					</TabContext>
				</Box>
			</Box>
		</Box>
	);
};

AdminEquipments.defaultProps = {
	initialInquiry: { page: 1, limit: 10, sort: 'createdAt', direction: 'DESC', search: {} },
};

export default withAdminLayout(AdminEquipments);