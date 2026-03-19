import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, List, ListItem, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import TablePagination from '@mui/material/TablePagination';
import { PropertyPanelList } from '../../../libs/components/admin/properties/PropertyList';
import { AllPropertiesInquiry } from '../../../libs/types/property/property.input';
import { Property } from '../../../libs/types/property/property';
import { PropertyLocation, PropertyStatus } from '../../../libs/enums/property.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { PropertyUpdate } from '../../../libs/types/property/property.update';
import { REMOVE_PROPERTY_BY_ADMIN, UPDATE_PROPERTY_BY_ADMIN } from '../../../apollo/admin/mutation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_PROPERTIES_BY_ADMIN } from '../../../apollo/admin/query';
import { T } from '../../../libs/types/common';

const AdminProperties: NextPage = ({ initialInquiry, ...props }: any) => {
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [propertiesInquiry, setPropertiesInquiry] = useState<AllPropertiesInquiry>(initialInquiry);
	const [properties, setProperties] = useState<Property[]>([]);
	const [propertiesTotal, setPropertiesTotal] = useState<number>(0);
	const [value, setValue] = useState(
		propertiesInquiry?.search?.propertyStatus ? propertiesInquiry?.search?.propertyStatus : 'ALL',
	);
	const [searchType, setSearchType] = useState('ALL');

	/** APOLLO REQUESTS **/
	const [updatePropertyByAdmin] = useMutation(UPDATE_PROPERTY_BY_ADMIN);
	const [removePropertyByAdmin] = useMutation(REMOVE_PROPERTY_BY_ADMIN);

	const {
		data: getAllPropertiesByAdminData,
		error: getAllPropertiesByAdminError,
		refetch: getAllPropertiesRefetch,
	} = useQuery(GET_ALL_PROPERTIES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: propertiesInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProperties(data?.getAllPropertiesByAdmin?.list);
			setPropertiesTotal(data?.getAllPropertiesByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLE **/
	useEffect(() => {
		getAllPropertiesRefetch({ input: propertiesInquiry }).then();
	}, [propertiesInquiry]);

	/** HANDLERS **/
	const changePageHandler = async (event: unknown, newPage: number) => {
		propertiesInquiry.page = newPage + 1;
		getAllPropertiesRefetch({ input: propertiesInquiry });
		setPropertiesInquiry({ ...propertiesInquiry });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		propertiesInquiry.limit = parseInt(event.target.value, 10);
		propertiesInquiry.page = 1;
		getAllPropertiesRefetch({ input: propertiesInquiry });
		setPropertiesInquiry({ ...propertiesInquiry });
	};

	const menuIconClickHandler = (e: any, index: number) => {
		const tempAnchor = anchorEl.slice();
		tempAnchor[index] = e.currentTarget;
		setAnchorEl(tempAnchor);
	};

	const menuIconCloseHandler = () => setAnchorEl([]);

	const tabChangeHandler = async (event: any, newValue: string) => {
		setValue(newValue);
		setPropertiesInquiry((prev) => {
			const nextSearch = { ...prev.search };
			delete nextSearch.propertyStatus;
			switch (newValue) {
				case 'ACTIVE': nextSearch.propertyStatus = PropertyStatus.ACTIVE; break;
				case 'SOLD':   nextSearch.propertyStatus = PropertyStatus.SOLD; break;
				case 'DELETE': nextSearch.propertyStatus = PropertyStatus.DELETE; break;
			}
			return { ...prev, page: 1, sort: 'createdAt', search: nextSearch };
		});
	};

	const removePropertyHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to remove?')) {
				await removePropertyByAdmin({ variables: { input: id } });
				await getAllPropertiesRefetch({ input: propertiesInquiry });
			}
			menuIconCloseHandler();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const searchTypeHandler = async (newValue: string) => {
		try {
			setSearchType(newValue);
			if (newValue !== 'ALL') {
				setPropertiesInquiry((prev) => ({
					...prev, page: 1, sort: 'createdAt',
					search: { ...prev.search, propertyLocationList: [newValue as PropertyLocation] },
				}));
			} else {
				setPropertiesInquiry((prev) => {
					const next = { ...prev.search };
					delete next.propertyLocationList;
					return { ...prev, search: next };
				});
			}
		} catch (err: any) {
			console.log('searchTypeHandler: ', err.message);
		}
	};

	const updatePropertyHandler = async (updateData: PropertyUpdate) => {
		try {
			await updatePropertyByAdmin({ variables: { input: updateData } });
			menuIconCloseHandler();
			await getAllPropertiesRefetch({ input: propertiesInquiry });
		} catch (err: any) {
			menuIconCloseHandler();
			sweetErrorHandling(err).then();
		}
	};

	return (
		<Box component={'div'} className={'content'}>
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '20px' }}>
				Property List
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
								<Select sx={{ width: '160px' }} value={searchType}>
									<MenuItem value={'ALL'} onClick={() => searchTypeHandler('ALL')}>All</MenuItem>
									{Object.values(PropertyLocation).map((location: string) => (
										<MenuItem value={location} onClick={() => searchTypeHandler(location)} key={location}>{location}</MenuItem>
									))}
								</Select>
							</Stack>
							<Divider />
						</Box>
						<PropertyPanelList
							properties={properties} anchorEl={anchorEl}
							menuIconClickHandler={menuIconClickHandler} menuIconCloseHandler={menuIconCloseHandler}
							updatePropertyHandler={updatePropertyHandler} removePropertyHandler={removePropertyHandler}
						/>
						<TablePagination rowsPerPageOptions={[10, 20, 40, 60]} component="div" count={propertiesTotal}
							rowsPerPage={propertiesInquiry?.limit} page={propertiesInquiry?.page - 1}
							onPageChange={changePageHandler} onRowsPerPageChange={changeRowsPerPageHandler}
						/>
					</TabContext>
				</Box>
			</Box>
		</Box>
	);
};

AdminProperties.defaultProps = {
	initialInquiry: { page: 1, limit: 10, sort: 'createdAt', direction: 'DESC', search: {} },
};

export default withAdminLayout(AdminProperties);