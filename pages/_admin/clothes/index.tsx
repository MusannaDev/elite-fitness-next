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
import { ClothePanelList } from '../../../libs/components/admin/clothes/ClotheList';
import { AllClotheInquiry } from '../../../libs/types/clothes/clothes.input';
import { Clothe } from '../../../libs/types/clothes/clothes';
import { ClotheCategory, ClotheStatus } from '../../../libs/enums/clothes.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { ClotheUpdate } from '../../../libs/types/clothes/clothes.update';
import { REMOVE_CLOTHE_BY_ADMIN, UPDATE_CLOTHE_BY_ADMIN } from '../../../apollo/admin/mutation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_CLOTHES_BY_ADMIN } from '../../../apollo/admin/query';
import { T } from '../../../libs/types/common';

const AdminClothes: NextPage = ({ initialInquiry, ...props }: any) => {
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [clothesInquiry, setClothesInquiry] = useState<AllClotheInquiry>(initialInquiry);
	const [clothes, setClothes] = useState<Clothe[]>([]);
	const [clothesTotal, setClothesTotal] = useState<number>(0);
	const [value, setValue] = useState(
		clothesInquiry?.search?.clotheStatus ? clothesInquiry?.search?.clotheStatus : 'ALL',
	);
	const [searchText, setSearchText] = useState('');
	const [categoryType, setCategoryType] = useState('ALL');

	/** APOLLO REQUESTS **/
	const [updateClotheByAdmin] = useMutation(UPDATE_CLOTHE_BY_ADMIN);
	const [removeClotheByAdmin] = useMutation(REMOVE_CLOTHE_BY_ADMIN);

	const {
		data: getAllClothesByAdminData,
		error: getAllClothesByAdminError,
		refetch: getAllClothesRefetch,
	} = useQuery(GET_ALL_CLOTHES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: clothesInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setClothes(data?.getAllClothesByAdmin?.list ?? []);
			setClothesTotal(data?.getAllClothesByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLE **/
	useEffect(() => {
		if (getAllClothesByAdminError) sweetErrorHandling(getAllClothesByAdminError).then();
	}, [getAllClothesByAdminError]);

	useEffect(() => {
		getAllClothesRefetch({ input: clothesInquiry }).then();
	}, [clothesInquiry]);

	/** HANDLERS **/
	const changePageHandler = async (event: unknown, newPage: number) => {
		clothesInquiry.page = newPage + 1;
		getAllClothesRefetch({ input: clothesInquiry });
		setClothesInquiry({ ...clothesInquiry });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		clothesInquiry.limit = parseInt(event.target.value, 10);
		clothesInquiry.page = 1;
		getAllClothesRefetch({ input: clothesInquiry });
		setClothesInquiry({ ...clothesInquiry });
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
		setClothesInquiry((prev) => {
			const nextSearch = { ...prev.search };
			delete nextSearch.clotheStatus;
			switch (newValue) {
				case 'ACTIVE': nextSearch.clotheStatus = ClotheStatus.ACTIVE; break;
				case 'SOLD':   nextSearch.clotheStatus = ClotheStatus.SOLD; break;
				case 'DELETE': nextSearch.clotheStatus = ClotheStatus.DELETE; break;
			}
			return { ...prev, page: 1, sort: 'createdAt', search: nextSearch };
		});
	};

	const removeClotheHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to remove?')) {
				await removeClotheByAdmin({ variables: { input: id } });
				await getAllClothesRefetch({ input: clothesInquiry });
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
				setClothesInquiry((prev) => ({
					...prev, page: 1,
					search: { ...prev.search, categoryList: [newValue as ClotheCategory] },
				}));
			} else {
				setClothesInquiry((prev) => {
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
		setClothesInquiry((prev) => ({ ...prev, search: { ...prev.search, text: searchText } }));
	};

	const updateClotheHandler = async (updateData: ClotheUpdate) => {
		try {
			await updateClotheByAdmin({ variables: { input: updateData } });
			menuIconCloseHandler();
			await getAllClothesRefetch({ input: clothesInquiry });
		} catch (err: any) {
			menuIconCloseHandler();
			sweetErrorHandling(err).then();
		}
	};

	return (
		<Box component={'div'} className={'content'}>
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '20px' }}>
				Clothe List
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
									sx={{ width: '100%' }} placeholder="Search clothe name or brand"
									onKeyDown={(e) => { if (e.key === 'Enter') searchTextHandler(); }}
									endAdornment={<>
										{searchText && <CancelRoundedIcon style={{ cursor: 'pointer' }} onClick={() => {
											setSearchText('');
											setClothesInquiry((prev) => ({ ...prev, search: { ...prev.search, text: '' } }));
										}} />}
										<InputAdornment position="end" onClick={searchTextHandler}>
											<img src="/img/icons/search_icon.png" alt={'search'} style={{ cursor: 'pointer' }} />
										</InputAdornment>
									</>}
								/>
								<Select sx={{ width: '180px', ml: '12px' }} value={categoryType}>
									<MenuItem value={'ALL'} onClick={() => categoryFilterHandler('ALL')}>All Categories</MenuItem>
									{Object.values(ClotheCategory).map((cat) => (
										<MenuItem key={cat} value={cat} onClick={() => categoryFilterHandler(cat)}>{cat}</MenuItem>
									))}
								</Select>
							</Stack>
							<Divider />
						</Box>
						<ClothePanelList clothes={clothes} anchorEl={anchorEl}
							menuIconClickHandler={menuIconClickHandler} menuIconCloseHandler={menuIconCloseHandler}
							updateClotheHandler={updateClotheHandler} removeClotheHandler={removeClotheHandler}
						/>
						<TablePagination rowsPerPageOptions={[10, 20, 40, 60]} component="div" count={clothesTotal}
							rowsPerPage={clothesInquiry?.limit} page={clothesInquiry?.page - 1}
							onPageChange={changePageHandler} onRowsPerPageChange={changeRowsPerPageHandler}
						/>
					</TabContext>
				</Box>
			</Box>
		</Box>
	);
};

AdminClothes.defaultProps = {
	initialInquiry: { page: 1, limit: 10, sort: 'createdAt', direction: 'DESC', search: {} },
};

export default withAdminLayout(AdminClothes);