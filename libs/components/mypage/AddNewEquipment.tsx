import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import {
	EquipmentCategory,
	EquipmentMaterial,
	EquipmentWeightCapacity,
	EquipmentWeightCapacityLabel,
	EquipmentLocation,
} from '../../enums/equipment.enum';
import { REACT_APP_API_URL } from '../../config';
import { EquipmentInput } from '../../types/equipment/equipment.input';
import axios from 'axios';
import { getJwtToken } from '../../auth';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_EQUIPMENT } from '../../../apollo/user/query';
import { CREATE_EQUIPMENT, UPDATE_EQUIPMENT } from '../../../apollo/user/mutation';

const AddNewEquipment = ({ initialValues }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const inputRef = useRef<any>(null);
	const [insertEquipmentData, setInsertEquipmentData] = useState<EquipmentInput>(initialValues);
	const [equipmentCategory] = useState<EquipmentCategory[]>(Object.values(EquipmentCategory));
	const [equipmentMaterial] = useState<EquipmentMaterial[]>(Object.values(EquipmentMaterial));
	const [equipmentWeightCapacity] = useState<EquipmentWeightCapacity[]>(Object.values(EquipmentWeightCapacity));
	const [equipmentLocation] = useState<EquipmentLocation[]>(Object.values(EquipmentLocation));
	const token = getJwtToken();
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [createEquipment] = useMutation(CREATE_EQUIPMENT);
	const [updateEquipment] = useMutation(UPDATE_EQUIPMENT);

	const {
		loading: getEquipmentLoading,
		data: getEquipmentData,
	} = useQuery(GET_EQUIPMENT, {
		fetchPolicy: 'network-only',
		variables: { input: router.query.equipmentId },
		skip: !router.query.equipmentId,
	});

	/** LIFECYCLE **/
	useEffect(() => {
		const data = getEquipmentData?.getEquipment;
		if (data) {
			setInsertEquipmentData({
				...insertEquipmentData,
				equipmentCategory: data.equipmentCategory || '',
				equipmentName: data.equipmentName || '',
				equipmentBrand: data.equipmentBrand || '',
				equipmentPrice: data.equipmentPrice || 0,
				equipmentMaterial: data.equipmentMaterial || '',
				equipmentLocation: data.equipmentLocation || '',
				equipmentLeftCount: data.equipmentLeftCount || 0,
				equipmentWeightCapacity: data.equipmentWeightCapacity || undefined,
				equipmentWeight: data.equipmentWeight ?? 0,
				equipmentDesc: data.equipmentDesc || '',
				equipmentImages: data.equipmentImages || [],
				isBestseller: data.isBestseller || false,
			});
		}
	}, [getEquipmentLoading, getEquipmentData]);

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
						target: 'equipment',
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
			setInsertEquipmentData({ ...insertEquipmentData, equipmentImages: responseImages });
		} catch (err: any) {
			console.log('err: ', err.message);
			await sweetMixinErrorAlert(err.message);
		}
	}

	const doDisabledCheck = () => {
		if (
			insertEquipmentData.equipmentName === '' ||
			insertEquipmentData.equipmentBrand === '' ||
			insertEquipmentData.equipmentPrice === 0 ||
			// @ts-ignore
			insertEquipmentData.equipmentCategory === '' ||
			// @ts-ignore
			insertEquipmentData.equipmentMaterial === '' ||
			// @ts-ignore
			insertEquipmentData.equipmentLocation === '' ||
			insertEquipmentData.equipmentLeftCount === 0 ||
			insertEquipmentData.equipmentImages.length === 0
		) {
			return true;
		}
	};

	const insertEquipmentHandler = useCallback(async () => {
		try {
			await createEquipment({
				variables: {
					input: insertEquipmentData,
				},
			});
			await sweetMixinSuccessAlert('This equipment has been created successfully');
			await router.push({
				pathname: '/mypage',
				query: { category: 'myEquipments' },
			});
		} catch (err: any) {
			await sweetErrorHandling(err).then();
		}
	}, [insertEquipmentData]);

	const updateEquipmentHandler = useCallback(async () => {
		try {
			// @ts-ignore
			insertEquipmentData._id = getEquipmentData?.getEquipment?._id;
			await updateEquipment({
				variables: {
					input: insertEquipmentData,
				},
			});
			await sweetMixinSuccessAlert('This equipment has been updated successfully');
			await router.push({
				pathname: '/mypage',
				query: { category: 'myEquipments' },
			});
		} catch (err: any) {
			await sweetErrorHandling(err).then();
		}
	}, [insertEquipmentData]);

	if (user?.memberType !== 'SALESMANAGER') {
		router.back();
	}

	if (device === 'mobile') {
		return <div>ADD NEW EQUIPMENT MOBILE PAGE</div>;
	} else {
		return (
			<div id="add-equipment-page">
				<Stack className="main-title-box">
					<Typography className="main-title">Add New Equipment</Typography>
					<Typography className="sub-title">Add gym equipment to your inventory</Typography>
				</Stack>

				<div>
					<Stack className="config">
						<Stack className="description-box">
							{/* Row 1: Name + Brand */}
							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">Equipment Name</Typography>
									<input
										type="text"
										className="description-input"
										placeholder={'Equipment name'}
										value={insertEquipmentData.equipmentName}
										onChange={({ target: { value } }) =>
											setInsertEquipmentData({ ...insertEquipmentData, equipmentName: value })
										}
									/>
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">Brand</Typography>
									<input
										type="text"
										className="description-input"
										placeholder={'Brand name'}
										value={insertEquipmentData.equipmentBrand}
										onChange={({ target: { value } }) =>
											setInsertEquipmentData({ ...insertEquipmentData, equipmentBrand: value })
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
										value={insertEquipmentData.equipmentPrice}
										onChange={({ target: { value } }) =>
											setInsertEquipmentData({ ...insertEquipmentData, equipmentPrice: parseInt(value) || 0 })
										}
									/>
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">Category</Typography>
									<select
										className={'select-description'}
										value={insertEquipmentData.equipmentCategory || 'select'}
										onChange={({ target: { value } }) =>
											// @ts-ignore
											setInsertEquipmentData({ ...insertEquipmentData, equipmentCategory: value })
										}
									>
										<option disabled value={'select'}>
											Select
										</option>
										{equipmentCategory.map((cat: any) => (
											<option value={cat} key={cat}>
												{cat.replace(/_/g, ' ')}
											</option>
										))}
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
							</Stack>

							{/* Row 3: Material + Weight Capacity */}
							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">Material</Typography>
									<select
										className={'select-description'}
										value={insertEquipmentData.equipmentMaterial || 'select'}
										onChange={({ target: { value } }) =>
											// @ts-ignore
											setInsertEquipmentData({ ...insertEquipmentData, equipmentMaterial: value })
										}
									>
										<option disabled value={'select'}>
											Select
										</option>
										{equipmentMaterial.map((mat: any) => (
											<option value={mat} key={mat}>
												{mat.replace(/_/g, ' ')}
											</option>
										))}
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">Weight Capacity</Typography>
									<select
										className={'select-description'}
										value={insertEquipmentData.equipmentWeightCapacity || 'select'}
										onChange={({ target: { value } }) =>
											// @ts-ignore
											setInsertEquipmentData({ ...insertEquipmentData, equipmentWeightCapacity: value })
										}
									>
										<option disabled value={'select'}>
											Select
										</option>
										{equipmentWeightCapacity.map((wc: any) => (
											<option value={wc} key={wc}>
												{EquipmentWeightCapacityLabel[wc as EquipmentWeightCapacity] || wc}
											</option>
										))}
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
							</Stack>

							{/* Row 4: Location + Left Count */}
							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">Location</Typography>
									<select
										className={'select-description'}
										value={insertEquipmentData.equipmentLocation || 'select'}
										onChange={({ target: { value } }) =>
											// @ts-ignore
											setInsertEquipmentData({ ...insertEquipmentData, equipmentLocation: value })
										}
									>
										<option disabled value={'select'}>
											Select
										</option>
										{equipmentLocation.map((loc: any) => (
											<option value={loc} key={loc}>
												{loc}
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
										value={insertEquipmentData.equipmentLeftCount}
										onChange={({ target: { value } }) =>
											setInsertEquipmentData({ ...insertEquipmentData, equipmentLeftCount: parseInt(value) || 0 })
										}
									/>
								</Stack>
							</Stack>

							{/* Row 5: Weight + Bestseller */}
							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">Weight (kg)</Typography>
									<input
										type="text"
										className="description-input"
										placeholder={'Weight in kg'}
										value={insertEquipmentData.equipmentWeight}
										onChange={({ target: { value } }) =>
											setInsertEquipmentData({ ...insertEquipmentData, equipmentWeight: parseInt(value) || 0 })
										}
									/>
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">Bestseller</Typography>
									<select
										className={'select-description'}
										value={insertEquipmentData.isBestseller ? 'yes' : 'no'}
										onChange={({ target: { value } }) =>
											setInsertEquipmentData({ ...insertEquipmentData, isBestseller: value === 'yes' })
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
							<Typography className="property-title">Equipment Description</Typography>
							<Stack className="config-column">
								<Typography className="title">Description</Typography>
								<textarea
									className="description-text"
									value={insertEquipmentData.equipmentDesc}
									onChange={({ target: { value } }) =>
										setInsertEquipmentData({ ...insertEquipmentData, equipmentDesc: value })
									}
								></textarea>
							</Stack>
						</Stack>

						<Typography className="upload-title">Upload photos of your equipment</Typography>
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
								{insertEquipmentData?.equipmentImages.map((image: string, index: number) => {
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
							{router.query.equipmentId ? (
								<Button className="next-button" disabled={doDisabledCheck()} onClick={updateEquipmentHandler}>
									<Typography className="next-button-text">Save</Typography>
								</Button>
							) : (
								<Button className="next-button" disabled={doDisabledCheck()} onClick={insertEquipmentHandler}>
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

AddNewEquipment.defaultProps = {
	initialValues: {
		equipmentCategory: '',
		equipmentName: '',
		equipmentBrand: '',
		equipmentPrice: 0,
		equipmentMaterial: '',
		equipmentLocation: '',
		equipmentLeftCount: 0,
		equipmentWeightCapacity: undefined,
		equipmentWeight: 0,
		equipmentImages: [],
		equipmentDesc: '',
		isBestseller: false,
	},
};

export default AddNewEquipment;