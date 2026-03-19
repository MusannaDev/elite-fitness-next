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
import { ProductPanelList } from '../../../libs/components/admin/products/ProductList';
import { AllProductsInquiry } from '../../../libs/types/product/product.input';
import { Product } from '../../../libs/types/product/product';
import { ProductCategory, ProductStatus } from '../../../libs/enums/product.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { ProductUpdate } from '../../../libs/types/product/product.update';
import { REMOVE_PRODUCT_BY_ADMIN, UPDATE_PRODUCT_BY_ADMIN } from '../../../apollo/admin/mutation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_PRODUCTS_BY_ADMIN } from '../../../apollo/admin/query';
import { T } from '../../../libs/types/common';

const AdminProducts: NextPage = ({ initialInquiry, ...props }: any) => {
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [productsInquiry, setProductsInquiry] = useState<AllProductsInquiry>(initialInquiry);
	const [products, setProducts] = useState<Product[]>([]);
	const [productsTotal, setProductsTotal] = useState<number>(0);
	const [value, setValue] = useState(
		productsInquiry?.search?.productStatus ? productsInquiry?.search?.productStatus : 'ALL',
	);
	const [searchText, setSearchText] = useState('');
	const [categoryType, setCategoryType] = useState('ALL');

	/** APOLLO REQUESTS **/
	const [updateProductByAdmin] = useMutation(UPDATE_PRODUCT_BY_ADMIN);
	const [removeProductByAdmin] = useMutation(REMOVE_PRODUCT_BY_ADMIN);

	const {
		data: getAllProductsByAdminData,
		error: getAllProductsByAdminError,
		refetch: getAllProductsRefetch,
	} = useQuery(GET_ALL_PRODUCTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: productsInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getAllProductsByAdmin?.list ?? []);
			setProductsTotal(data?.getAllProductsByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLE **/
	useEffect(() => {
		if (getAllProductsByAdminError) sweetErrorHandling(getAllProductsByAdminError).then();
	}, [getAllProductsByAdminError]);

	useEffect(() => {
		getAllProductsRefetch({ input: productsInquiry }).then();
	}, [productsInquiry]);

	/** HANDLERS **/
	const changePageHandler = async (event: unknown, newPage: number) => {
		productsInquiry.page = newPage + 1;
		getAllProductsRefetch({ input: productsInquiry });
		setProductsInquiry({ ...productsInquiry });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		productsInquiry.limit = parseInt(event.target.value, 10);
		productsInquiry.page = 1;
		getAllProductsRefetch({ input: productsInquiry });
		setProductsInquiry({ ...productsInquiry });
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
		setProductsInquiry((prev) => {
			const nextSearch = { ...prev.search };
			delete nextSearch.productStatus;
			switch (newValue) {
				case 'ACTIVE': nextSearch.productStatus = ProductStatus.ACTIVE; break;
				case 'SOLD':   nextSearch.productStatus = ProductStatus.SOLD; break;
				case 'DELETE': nextSearch.productStatus = ProductStatus.DELETE; break;
			}
			return { ...prev, page: 1, sort: 'createdAt', search: nextSearch };
		});
	};

	const removeProductHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to remove?')) {
				await removeProductByAdmin({ variables: { input: id } });
				await getAllProductsRefetch({ input: productsInquiry });
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
				setProductsInquiry((prev) => ({
					...prev, page: 1,
					search: { ...prev.search, categoryList: [newValue as ProductCategory] },
				}));
			} else {
				setProductsInquiry((prev) => {
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
		setProductsInquiry((prev) => ({ ...prev, search: { ...prev.search, text: searchText } }));
	};

	const updateProductHandler = async (updateData: ProductUpdate) => {
		try {
			await updateProductByAdmin({ variables: { input: updateData } });
			menuIconCloseHandler();
			await getAllProductsRefetch({ input: productsInquiry });
		} catch (err: any) {
			menuIconCloseHandler();
			sweetErrorHandling(err).then();
		}
	};

	return (
		<Box component={'div'} className={'content'}>
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '20px' }}>
				Product List
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
									sx={{ width: '100%' }} placeholder="Search product name or brand"
									onKeyDown={(e) => { if (e.key === 'Enter') searchTextHandler(); }}
									endAdornment={<>
										{searchText && <CancelRoundedIcon style={{ cursor: 'pointer' }} onClick={() => {
											setSearchText('');
											setProductsInquiry((prev) => ({ ...prev, search: { ...prev.search, text: '' } }));
										}} />}
										<InputAdornment position="end" onClick={searchTextHandler}>
											<img src="/img/icons/search_icon.png" alt={'search'} style={{ cursor: 'pointer' }} />
										</InputAdornment>
									</>}
								/>
								<Select sx={{ width: '180px', ml: '12px' }} value={categoryType}>
									<MenuItem value={'ALL'} onClick={() => categoryFilterHandler('ALL')}>All Categories</MenuItem>
									{Object.values(ProductCategory).map((cat) => (
										<MenuItem key={cat} value={cat} onClick={() => categoryFilterHandler(cat)}>{cat}</MenuItem>
									))}
								</Select>
							</Stack>
							<Divider />
						</Box>
						<ProductPanelList products={products} anchorEl={anchorEl}
							menuIconClickHandler={menuIconClickHandler} menuIconCloseHandler={menuIconCloseHandler}
							updateProductHandler={updateProductHandler} removeProductHandler={removeProductHandler}
						/>
						<TablePagination rowsPerPageOptions={[10, 20, 40, 60]} component="div" count={productsTotal}
							rowsPerPage={productsInquiry?.limit} page={productsInquiry?.page - 1}
							onPageChange={changePageHandler} onRowsPerPageChange={changeRowsPerPageHandler}
						/>
					</TabContext>
				</Box>
			</Box>
		</Box>
	);
};

AdminProducts.defaultProps = {
	initialInquiry: { page: 1, limit: 10, sort: 'createdAt', direction: 'DESC', search: {} },
};

export default withAdminLayout(AdminProducts);