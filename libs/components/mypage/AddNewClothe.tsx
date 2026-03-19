import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import {
	ClotheCategory,
	ClotheMaterial,
	ClotheSize,
	ClotheGender,
	ClotheColor,
} from '../../enums/clothes.enum';
import { REACT_APP_API_URL } from '../../config';
import { ClotheInput } from '../../types/clothes/clothes.input';
import axios from 'axios';
import { getJwtToken } from '../../auth';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_CLOTHE } from '../../../apollo/user/query';
import { CREATE_CLOTHE, UPDATE_CLOTHE } from '../../../apollo/user/mutation';

const AddNewClothe = ({ initialValues, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const inputRef = useRef<any>(null);
	const [insertClotheData, setInsertClotheData] = useState<ClotheInput>(initialValues);
	const [clotheCategory] = useState<ClotheCategory[]>(Object.values(ClotheCategory));
	const [clotheMaterial] = useState<ClotheMaterial[]>(Object.values(ClotheMaterial));
	const [clotheSize] = useState<ClotheSize[]>(Object.values(ClotheSize));
	const [clotheGender] = useState<ClotheGender[]>(Object.values(ClotheGender));
	const [clotheColor] = useState<ClotheColor[]>(Object.values(ClotheColor));
	const token = getJwtToken();
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [createClothe] = useMutation(CREATE_CLOTHE);
	const [updateClothe] = useMutation(UPDATE_CLOTHE);

	const {
		loading: getClotheLoading,
		data: getClotheData,
		error: getClotheError,
		refetch: getClotheRefetch,
	} = useQuery(GET_CLOTHE, {
		fetchPolicy: 'network-only',
		variables: { input: router.query.clotheId },
	});

	/** LIFECYCLE **/
	useEffect(() => {
		const data = getClotheData?.getClothe;
		if (data) {
			setInsertClotheData({
				...insertClotheData,
				clotheCategory: data.clotheCategory || '',
				clotheName: data.clotheName || '',
				clotheBrand: data.clotheBrand || '',
				clothePrice: data.clothePrice || 0,
				clotheMaterial: data.clotheMaterial || '',
				clotheSize: data.clotheSize || '',
				clotheGender: data.clotheGender || '',
				clotheColor: data.clotheColor || '',
				clotheLeftCount: data.clotheLeftCount || 0,
				clotheDesc: data.clotheDesc || '',
				clotheImages: data.clotheImages || [],
				isBestseller: data.isBestseller || false,
			});
		}
	}, [getClotheLoading, getClotheData]);

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
						target: 'clothe',
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

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImages = response.data.data.imagesUploader;
			setInsertClotheData({ ...insertClotheData, clotheImages: responseImages });
		} catch (err: any) {
			console.log('err: ', err.message);
			await sweetMixinErrorAlert(err.message);
		}
	}

	const doDisabledCheck = () => {
		if (
			insertClotheData.clotheName === '' ||
			insertClotheData.clotheBrand === '' ||
			insertClotheData.clothePrice === 0 ||
			// @ts-ignore
			insertClotheData.clotheCategory === '' ||
			// @ts-ignore
			insertClotheData.clotheMaterial === '' ||
			// @ts-ignore
			insertClotheData.clotheSize === '' ||
			// @ts-ignore
			insertClotheData.clotheGender === '' ||
			// @ts-ignore
			insertClotheData.clotheColor === '' ||
			insertClotheData.clotheLeftCount === 0 ||
			insertClotheData.clotheImages.length === 0
		) {
			return true;
		}
	};

	const insertClotheHandler = useCallback(async () => {
		try {
			await createClothe({
				variables: {
					input: insertClotheData,
				},
			});
			await sweetMixinSuccessAlert('This clothing item has been created successfully');
			await router.push({
				pathname: '/mypage',
				query: { category: 'myClothes' },
			});
		} catch (err: any) {
			await sweetErrorHandling(err).then();
		}
	}, [insertClotheData]);

	const updateClotheHandler = useCallback(async () => {
		try {
			// @ts-ignore
			insertClotheData._id = getClotheData?.getClothe?._id;
			await updateClothe({
				variables: {
					input: insertClotheData,
				},
			});
			await sweetMixinSuccessAlert('This clothing item has been updated successfully');
			await router.push({
				pathname: '/mypage',
				query: { category: 'myClothes' },
			});
		} catch (err: any) {
			await sweetErrorHandling(err).then();
		}
	}, [insertClotheData]);

	if (user?.memberType !== 'SALESMANAGER') {
		router.back();
	}

	if (device === 'mobile') {
		return <div>ADD NEW CLOTHE MOBILE PAGE</div>;
	} else {
		return (
			<div id="add-clothe-page">
				<Stack className="main-title-box">
					<Typography className="main-title">Add New Clothing</Typography>
					<Typography className="sub-title">Add clothing to your inventory</Typography>
				</Stack>

				<div>
					<Stack className="config">
						<Stack className="description-box">
							{/* Row 1: Name + Brand */}
							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">Clothing Name</Typography>
									<input
										type="text"
										className="description-input"
										placeholder={'Clothing name'}
										value={insertClotheData.clotheName}
										onChange={({ target: { value } }) =>
											setInsertClotheData({ ...insertClotheData, clotheName: value })
										}
									/>
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">Brand</Typography>
									<input
										type="text"
										className="description-input"
										placeholder={'Brand name'}
										value={insertClotheData.clotheBrand}
										onChange={({ target: { value } }) =>
											setInsertClotheData({ ...insertClotheData, clotheBrand: value })
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
										value={insertClotheData.clothePrice}
										onChange={({ target: { value } }) =>
											setInsertClotheData({ ...insertClotheData, clothePrice: parseInt(value) || 0 })
										}
									/>
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">Category</Typography>
									<select
										className={'select-description'}
										value={insertClotheData.clotheCategory || 'select'}
										onChange={({ target: { value } }) =>
											// @ts-ignore
											setInsertClotheData({ ...insertClotheData, clotheCategory: value })
										}
									>
										<option disabled value={'select'}>
											Select
										</option>
										{clotheCategory.map((cat: any) => (
											<option value={cat} key={cat}>
												{cat.replace(/_/g, ' ')}
											</option>
										))}
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
							</Stack>

							{/* Row 3: Material + Size */}
							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">Material</Typography>
									<select
										className={'select-description'}
										value={insertClotheData.clotheMaterial || 'select'}
										onChange={({ target: { value } }) =>
											// @ts-ignore
											setInsertClotheData({ ...insertClotheData, clotheMaterial: value })
										}
									>
										<option disabled value={'select'}>
											Select
										</option>
										{clotheMaterial.map((mat: any) => (
											<option value={mat} key={mat}>
												{mat.replace(/_/g, ' ')}
											</option>
										))}
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">Size</Typography>
									<select
										className={'select-description'}
										value={insertClotheData.clotheSize || 'select'}
										onChange={({ target: { value } }) =>
											// @ts-ignore
											setInsertClotheData({ ...insertClotheData, clotheSize: value })
										}
									>
										<option disabled value={'select'}>
											Select
										</option>
										{clotheSize.map((size: any) => (
											<option value={size} key={size}>
												{size}
											</option>
										))}
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
							</Stack>

							{/* Row 4: Gender + Color */}
							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">Gender</Typography>
									<select
										className={'select-description'}
										value={insertClotheData.clotheGender || 'select'}
										onChange={({ target: { value } }) =>
											// @ts-ignore
											setInsertClotheData({ ...insertClotheData, clotheGender: value })
										}
									>
										<option disabled value={'select'}>
											Select
										</option>
										{clotheGender.map((gender: any) => (
											<option value={gender} key={gender}>
												{gender}
											</option>
										))}
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">Color</Typography>
									<select
										className={'select-description'}
										value={insertClotheData.clotheColor || 'select'}
										onChange={({ target: { value } }) =>
											// @ts-ignore
											setInsertClotheData({ ...insertClotheData, clotheColor: value })
										}
									>
										<option disabled value={'select'}>
											Select
										</option>
										{clotheColor.map((color: any) => (
											<option value={color} key={color}>
												{color}
											</option>
										))}
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
							</Stack>

							{/* Row 5: Left Count + Bestseller */}
							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">Left Count (Stock)</Typography>
									<input
										type="text"
										className="description-input"
										placeholder={'Stock count'}
										value={insertClotheData.clotheLeftCount}
										onChange={({ target: { value } }) =>
											setInsertClotheData({ ...insertClotheData, clotheLeftCount: parseInt(value) || 0 })
										}
									/>
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">Bestseller</Typography>
									<select
										className={'select-description'}
										value={insertClotheData.isBestseller ? 'yes' : 'no'}
										onChange={({ target: { value } }) =>
											setInsertClotheData({ ...insertClotheData, isBestseller: value === 'yes' })
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
							<Typography className="property-title">Clothing Description</Typography>
							<Stack className="config-column">
								<Typography className="title">Description</Typography>
								<textarea
									className="description-text"
									value={insertClotheData.clotheDesc}
									onChange={({ target: { value } }) =>
										setInsertClotheData({ ...insertClotheData, clotheDesc: value })
									}
								></textarea>
							</Stack>
						</Stack>

						<Typography className="upload-title">Upload photos of your clothing</Typography>
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
								{insertClotheData?.clotheImages.map((image: string, index: number) => {
									const imagePath: string = `${REACT_APP_API_URL}/${image}`;
									return (
										<Stack className="image-box" key={index}>
											<img src={imagePath} alt="" />
										</Stack>
									);
								})}
							</Stack>
						</Stack>

						<Stack className="buttons-row">
							{router.query.clotheId ? (
								<Button className="next-button" disabled={doDisabledCheck()} onClick={updateClotheHandler}>
									<Typography className="next-button-text">Save</Typography>
								</Button>
							) : (
								<Button className="next-button" disabled={doDisabledCheck()} onClick={insertClotheHandler}>
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

AddNewClothe.defaultProps = {
	initialValues: {
		clotheCategory: '',
		clotheName: '',
		clotheBrand: '',
		clothePrice: 0,
		clotheMaterial: '',
		clotheSize: '',
		clotheGender: '',
		clotheColor: '',
		clotheLeftCount: 0,
		clotheImages: [],
		clotheDesc: '',
		isBestseller: false,
	},
};

export default AddNewClothe;