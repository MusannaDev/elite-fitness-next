import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import {
	ProductCategory,
	ProductWeight,
	ProductWeightLabel,
	ProductFlavor,
	ProductBenefits,
} from '../../enums/product.enum';
import { NEXT_PUBLIC_API_URL } from '../../config';
import { ProductInput } from '../../types/product/product.input';
import axios from 'axios';
import { getJwtToken } from '../../auth';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_PRODUCT } from '../../../apollo/user/query';
import { CREATE_PRODUCT, UPDATE_PRODUCT } from '../../../apollo/user/mutation';

const AddNewProduct = ({ initialValues }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const inputRef = useRef<any>(null);
	const [insertProductData, setInsertProductData] = useState<ProductInput>(initialValues);
	const [productCategory] = useState<ProductCategory[]>(Object.values(ProductCategory));
	const [productWeight] = useState<ProductWeight[]>(Object.values(ProductWeight));
	const [productFlavor] = useState<ProductFlavor[]>(Object.values(ProductFlavor));
	const [productBenefits] = useState<ProductBenefits[]>(Object.values(ProductBenefits));
	const token = getJwtToken();
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [createProduct] = useMutation(CREATE_PRODUCT);
	const [updateProduct] = useMutation(UPDATE_PRODUCT);

	const {
		loading: getProductLoading,
		data: getProductData,
	} = useQuery(GET_PRODUCT, {
		fetchPolicy: 'network-only',
		variables: { input: router.query.productId },
		skip: !router.query.productId,
	});

	/** LIFECYCLE **/
	useEffect(() => {
		const data = getProductData?.getProduct;
		if (data) {
			setInsertProductData({
				...insertProductData,
				productCategory: data.productCategory || '',
				productName: data.productName || '',
				productBrand: data.productBrand || '',
				productPrice: data.productPrice || 0,
				productWeight: data.productWeight || '',
				productLeftCount: data.productLeftCount || 0,
				productBenefits: data.productBenefits || '',
				productFlavor: data.productFlavor || '',
				productCalories: data.productCalories || 0,
				productProteinPerServing: data.productProteinPerServing || 0,
				productDesc: data.productDesc || '',
				productImages: data.productImages || [],
				isBestseller: data.isBestseller || false,
			});
		}
	}, [getProductLoading, getProductData]);

	/** HANDLERS **/
	async function uploadImages() {
		try {
			const formData = new FormData();
			const selectedFiles = inputRef.current.files;

			if (selectedFiles.length === 0) return false;
			if (selectedFiles.length > 5) throw new Error('Cannot upload more than 5 images!');

			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) { 
						imagesUploader(files: $files, target: $target)
				  }`,
					variables: {
						files: [null, null, null, null, null],
						target: 'product',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.files.0'],
					'1': ['variables.files.1'],
					'2': ['variables.files.2'],
					'3': ['variables.files.3'],
					'4': ['variables.files.4'],
				}),
			);
			for (const key in selectedFiles) {
				if (/^\d+$/.test(key)) formData.append(`${key}`, selectedFiles[key]);
			}

			const response = await axios.post(`${process.env.NEXT_PUBLIC_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImages = response.data.data.imagesUploader;
			setInsertProductData({ ...insertProductData, productImages: responseImages });
		} catch (err: any) {
			console.log('err: ', err.message);
			await sweetMixinErrorAlert(err.message);
		}
	}

	const doDisabledCheck = () => {
		if (
			insertProductData.productName === '' ||
			insertProductData.productBrand === '' ||
			insertProductData.productPrice === 0 ||
			// @ts-ignore
			insertProductData.productCategory === '' ||
			// @ts-ignore
			insertProductData.productWeight === '' ||
			insertProductData.productLeftCount === 0 ||
			// @ts-ignore
			insertProductData.productBenefits === '' ||
			// @ts-ignore
			insertProductData.productFlavor === '' ||
			insertProductData.productCalories === 0 ||
			insertProductData.productProteinPerServing === 0 ||
			insertProductData.productImages.length === 0
		) {
			return true;
		}
	};

	const insertProductHandler = useCallback(async () => {
		try {
			await createProduct({
				variables: {
					input: insertProductData,
				},
			});
			await sweetMixinSuccessAlert('This product has been created successfully');
			await router.push({
				pathname: '/mypage',
				query: { category: 'myProducts' },
			});
		} catch (err: any) {
			await sweetErrorHandling(err).then();
		}
	}, [insertProductData]);

	const updateProductHandler = useCallback(async () => {
		try {
			// @ts-ignore
			insertProductData._id = getProductData?.getProduct?._id;
			await updateProduct({
				variables: {
					input: insertProductData,
				},
			});
			await sweetMixinSuccessAlert('This product has been updated successfully');
			await router.push({
				pathname: '/mypage',
				query: { category: 'myProducts' },
			});
		} catch (err: any) {
			await sweetErrorHandling(err).then();
		}
	}, [insertProductData]);

	if (user?.memberType !== 'TRAINER') {
		router.back();
	}

	if (device === 'mobile') {
		return <div>ADD NEW PRODUCT MOBILE PAGE</div>;
	} else {
		return (
			<div id="add-product-page">
				<Stack className="main-title-box">
					<Typography className="main-title">Add New Product</Typography>
					<Typography className="sub-title">Create a new training product listing</Typography>
				</Stack>

				<div>
					<Stack className="config">
						<Stack className="description-box">
							{/* Row 1: Name + Brand */}
							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">Product Name</Typography>
									<input
										type="text"
										className="description-input"
										placeholder={'Product name'}
										value={insertProductData.productName}
										onChange={({ target: { value } }) =>
											setInsertProductData({ ...insertProductData, productName: value })
										}
									/>
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">Brand</Typography>
									<input
										type="text"
										className="description-input"
										placeholder={'Brand name'}
										value={insertProductData.productBrand}
										onChange={({ target: { value } }) =>
											setInsertProductData({ ...insertProductData, productBrand: value })
										}
									/>
								</Stack>
							</Stack>

							{/* Row 2: Price + Category */}
							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">Price</Typography>
									<input
										type="text"
										className="description-input"
										placeholder={'Price'}
										value={insertProductData.productPrice}
										onChange={({ target: { value } }) =>
											setInsertProductData({ ...insertProductData, productPrice: parseInt(value) || 0 })
										}
									/>
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">Category</Typography>
									<select
										className={'select-description'}
										value={insertProductData.productCategory || 'select'}
										onChange={({ target: { value } }) =>
											// @ts-ignore
											setInsertProductData({ ...insertProductData, productCategory: value })
										}
									>
										<option disabled value={'select'}>
											Select
										</option>
										{productCategory.map((cat: any) => (
											<option value={cat} key={cat}>
												{cat.replace(/_/g, ' ')}
											</option>
										))}
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
							</Stack>

							{/* Row 3: Weight + Left Count */}
							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">Weight</Typography>
									<select
										className={'select-description'}
										value={insertProductData.productWeight || 'select'}
										onChange={({ target: { value } }) =>
											// @ts-ignore
											setInsertProductData({ ...insertProductData, productWeight: value })
										}
									>
										<option disabled value={'select'}>
											Select
										</option>
										{productWeight.map((w: any) => (
											<option value={w} key={w}>
												{ProductWeightLabel[w as ProductWeight] || w}
											</option>
										))}
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">Left Count (Stock)</Typography>
									<input
										type="text"
										className="description-input"
										placeholder={'Stock count'}
										value={insertProductData.productLeftCount}
										onChange={({ target: { value } }) =>
											setInsertProductData({ ...insertProductData, productLeftCount: parseInt(value) || 0 })
										}
									/>
								</Stack>
							</Stack>

							{/* Row 4: Flavor + Benefits */}
							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">Flavor</Typography>
									<select
										className={'select-description'}
										value={insertProductData.productFlavor || 'select'}
										onChange={({ target: { value } }) =>
											// @ts-ignore
											setInsertProductData({ ...insertProductData, productFlavor: value })
										}
									>
										<option disabled value={'select'}>
											Select
										</option>
										{productFlavor.map((f: any) => (
											<option value={f} key={f}>
												{f.replace(/_/g, ' ')}
											</option>
										))}
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">Benefits</Typography>
									<select
										className={'select-description'}
										value={insertProductData.productBenefits || 'select'}
										onChange={({ target: { value } }) =>
											// @ts-ignore
											setInsertProductData({ ...insertProductData, productBenefits: value })
										}
									>
										<option disabled value={'select'}>
											Select
										</option>
										{productBenefits.map((b: any) => (
											<option value={b} key={b}>
												{b.replace(/_/g, ' ')}
											</option>
										))}
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
							</Stack>

							{/* Row 5: Calories + Protein Per Serving + Bestseller */}
							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">Calories</Typography>
									<input
										type="text"
										className="description-input"
										placeholder={'Calories'}
										value={insertProductData.productCalories}
										onChange={({ target: { value } }) =>
											setInsertProductData({ ...insertProductData, productCalories: parseInt(value) || 0 })
										}
									/>
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">Protein Per Serving (g)</Typography>
									<input
										type="text"
										className="description-input"
										placeholder={'Protein per serving'}
										value={insertProductData.productProteinPerServing}
										onChange={({ target: { value } }) =>
											setInsertProductData({
												...insertProductData,
												productProteinPerServing: parseInt(value) || 0,
											})
										}
									/>
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">Bestseller</Typography>
									<select
										className={'select-description'}
										value={insertProductData.isBestseller ? 'yes' : 'no'}
										onChange={({ target: { value } }) =>
											setInsertProductData({ ...insertProductData, isBestseller: value === 'yes' })
										}
									>
										<option value={'no'}>No</option>
										<option value={'yes'}>Yes</option>
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
							</Stack>

							{/* Description */}
							<Typography className="property-title">Product Description</Typography>
							<Stack className="config-column">
								<Typography className="title">Description</Typography>
								<textarea
									className="description-text"
									value={insertProductData.productDesc}
									onChange={({ target: { value } }) =>
										setInsertProductData({ ...insertProductData, productDesc: value })
									}
								></textarea>
							</Stack>
						</Stack>

						<Typography className="upload-title">Upload photos of your product</Typography>
						<Stack className="images-box">
							<Stack className="upload-box">
								<Stack className="text-box">
									<Typography className="drag-title">Drag and drop images here</Typography>
									<Typography className="format-title">
										Photos must be JPEG or PNG format and at least 2048x768
									</Typography>
								</Stack>
								<Button
									className="browse-button"
									onClick={() => {
										inputRef.current.click();
									}}
								>
									<Typography className="browse-button-text">Browse Files</Typography>
									<input
										ref={inputRef}
										type="file"
										hidden={true}
										onChange={uploadImages}
										multiple={true}
										accept="image/jpg, image/jpeg, image/png"
									/>
								</Button>
							</Stack>
							<Stack className="gallery-box">
								{insertProductData?.productImages.map((image: string, index: number) => {
									const imagePath: string = `${NEXT_PUBLIC_API_URL}/${image}`;
									return (
										<Stack className="image-box" key={index}>
											<img src={imagePath} alt="" />
										</Stack>
									);
								})}
							</Stack>
						</Stack>

						<Stack className="buttons-row">
							{router.query.productId ? (
								<Button className="next-button" disabled={doDisabledCheck()} onClick={updateProductHandler}>
									<Typography className="next-button-text">Save</Typography>
								</Button>
							) : (
								<Button className="next-button" disabled={doDisabledCheck()} onClick={insertProductHandler}>
									<Typography className="next-button-text">Save</Typography>
								</Button>
							)}
						</Stack>
					</Stack>
				</div>
			</div>
		);
	}
};

AddNewProduct.defaultProps = {
	initialValues: {
		productCategory: '',
		productName: '',
		productBrand: '',
		productPrice: 0,
		productWeight: '',
		productLeftCount: 0,
		productBenefits: '',
		productFlavor: '',
		productCalories: 0,
		productProteinPerServing: 0,
		productImages: [],
		productDesc: '',
		isBestseller: false,
	},
};

export default AddNewProduct;