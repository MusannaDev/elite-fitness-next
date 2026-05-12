import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { PropertyLocation, PropertyType } from '../../enums/property.enum';
import { NEXT_PUBLIC_API_URL, propertySquare } from '../../config';
import { PropertyInput } from '../../types/property/property.input';
import axios from 'axios';
import { getJwtToken } from '../../auth';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_PROPERTY } from '../../../apollo/user/query';
import { CREATE_PROPERTY, UPDATE_PROPERTY } from '../../../apollo/user/mutation';

const AddNewProperty = ({ initialValues }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const inputRef = useRef<any>(null);
	const [insertPropertyData, setInsertPropertyData] = useState<PropertyInput>(initialValues);
	const [propertyTypeOptions] = useState<PropertyType[]>(Object.values(PropertyType));
	const [propertyLocationOptions] = useState<PropertyLocation[]>(Object.values(PropertyLocation));
	const token = getJwtToken();
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [createProperty] = useMutation(CREATE_PROPERTY);
	const [updateProperty] = useMutation(UPDATE_PROPERTY);

	const {
		loading: getPropertyLoading,
		data: getPropertyData,
	} = useQuery(GET_PROPERTY, {
		fetchPolicy: 'network-only',
		variables: { input: router.query.propertyId },
		skip: !router.query.propertyId,
	});

	/** LIFECYCLE **/
	useEffect(() => {
		const data = getPropertyData?.getProperty;
		if (data) {
			setInsertPropertyData({
				...insertPropertyData,
				propertyTitle: data.propertyTitle || '',
				propertyPrice: data.propertyPrice || 0,
				propertyType: data.propertyType || '',
				propertyLocation: data.propertyLocation || '',
				propertyAddress: data.propertyAddress || '',
				propertyBarter: data.propertyBarter || false,
				propertyRent: data.propertyRent || false,
				propertyRooms: data.propertyRooms || 0,
				propertyBaths: data.propertyBaths || 0,
				propertySquare: data.propertySquare || 0,
				propertyDesc: data.propertyDesc || '',
				propertyImages: data.propertyImages || [],
			});
		}
	}, [getPropertyLoading, getPropertyData]);

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
						target: 'property',
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
			setInsertPropertyData({ ...insertPropertyData, propertyImages: responseImages });
		} catch (err: any) {
			console.log('err: ', err.message);
			await sweetMixinErrorAlert(err.message);
		}
	}

	const doDisabledCheck = () => {
		if (
			insertPropertyData.propertyTitle === '' ||
			insertPropertyData.propertyPrice === 0 ||
			// @ts-ignore
			insertPropertyData.propertyType === '' ||
			// @ts-ignore
			insertPropertyData.propertyLocation === '' ||
			insertPropertyData.propertyAddress === '' ||
			insertPropertyData.propertyRooms === 0 ||
			insertPropertyData.propertyBaths === 0 ||
			insertPropertyData.propertySquare === 0 ||
			insertPropertyData.propertyImages.length === 0
		) {
			return true;
		}
	};

	const insertPropertyHandler = useCallback(async () => {
		try {
			await createProperty({
				variables: {
					input: insertPropertyData,
				},
			});
			await sweetMixinSuccessAlert('This property has been created successfully');
			await router.push({
				pathname: '/mypage',
				query: { category: 'myProperties' },
			});
		} catch (err: any) {
			await sweetErrorHandling(err).then();
		}
	}, [insertPropertyData]);

	const updatePropertyHandler = useCallback(async () => {
		try {
			// @ts-ignore
			insertPropertyData._id = getPropertyData?.getProperty?._id;
			await updateProperty({
				variables: {
					input: insertPropertyData,
				},
			});
			await sweetMixinSuccessAlert('This property has been updated successfully');
			await router.push({
				pathname: '/mypage',
				query: { category: 'myProperties' },
			});
		} catch (err: any) {
			await sweetErrorHandling(err).then();
		}
	}, [insertPropertyData]);

	if (user?.memberType !== 'AGENT') {
		router.back();
	}

	if (device === 'mobile') {
		return <div>ADD NEW PROPERTY MOBILE PAGE</div>;
	} else {
		return (
			<div id="add-property-page">
				<Stack className="main-title-box">
					<Typography className="main-title">Add New Property</Typography>
					<Typography className="sub-title">Create a new gym facility listing</Typography>
				</Stack>

				<div>
					<Stack className="config">
						<Stack className="description-box">
							{/* Row 1: Title + Price */}
							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">Title</Typography>
									<input
										type="text"
										className="description-input"
										placeholder={'Property title'}
										value={insertPropertyData.propertyTitle}
										onChange={({ target: { value } }) =>
											setInsertPropertyData({ ...insertPropertyData, propertyTitle: value })
										}
									/>
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">Price</Typography>
									<input
										type="text"
										className="description-input"
										placeholder={'Price'}
										value={insertPropertyData.propertyPrice}
										onChange={({ target: { value } }) =>
											setInsertPropertyData({ ...insertPropertyData, propertyPrice: parseInt(value) || 0 })
										}
									/>
								</Stack>
							</Stack>

							{/* Row 2: Type + Location */}
							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">Type</Typography>
									<select
										className={'select-description'}
										value={insertPropertyData.propertyType || 'select'}
										onChange={({ target: { value } }) =>
											// @ts-ignore
											setInsertPropertyData({ ...insertPropertyData, propertyType: value })
										}
									>
										<option disabled value={'select'}>
											Select
										</option>
										{propertyTypeOptions.map((type: any) => (
											<option value={type} key={type}>
												{type.replace(/_/g, ' ')}
											</option>
										))}
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">Location</Typography>
									<select
										className={'select-description'}
										value={insertPropertyData.propertyLocation || 'select'}
										onChange={({ target: { value } }) =>
											// @ts-ignore
											setInsertPropertyData({ ...insertPropertyData, propertyLocation: value })
										}
									>
										<option disabled value={'select'}>
											Select
										</option>
										{propertyLocationOptions.map((location: any) => (
											<option value={location} key={location}>
												{location}
											</option>
										))}
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
							</Stack>

							{/* Row 3: Address */}
							<Stack className="config-row">
								<Stack className="price-year-after-price" style={{ flex: 1 }}>
									<Typography className="title">Address</Typography>
									<input
										type="text"
										className="description-input"
										placeholder={'Full address'}
										value={insertPropertyData.propertyAddress}
										onChange={({ target: { value } }) =>
											setInsertPropertyData({ ...insertPropertyData, propertyAddress: value })
										}
									/>
								</Stack>
							</Stack>

							{/* Row 4: Barter + Rent */}
							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">Barter</Typography>
									<select
										className={'select-description'}
										value={insertPropertyData.propertyBarter ? 'yes' : 'no'}
										onChange={({ target: { value } }) =>
											setInsertPropertyData({ ...insertPropertyData, propertyBarter: value === 'yes' })
										}
									>
										<option value={'no'}>No</option>
										<option value={'yes'}>Yes</option>
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">Rent</Typography>
									<select
										className={'select-description'}
										value={insertPropertyData.propertyRent ? 'yes' : 'no'}
										onChange={({ target: { value } }) =>
											setInsertPropertyData({ ...insertPropertyData, propertyRent: value === 'yes' })
										}
									>
										<option value={'no'}>No</option>
										<option value={'yes'}>Yes</option>
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
							</Stack>

							{/* Row 5: Training Rooms + Shower Rooms + Area */}
							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">Training Rooms</Typography>
									<select
										className={'select-description'}
										value={insertPropertyData.propertyRooms || 'select'}
										onChange={({ target: { value } }) =>
											setInsertPropertyData({ ...insertPropertyData, propertyRooms: parseInt(value) })
										}
									>
										<option disabled value={'select'}>
											Select
										</option>
										{[1, 2, 3, 4, 5].map((room: number) => (
											<option value={`${room}`} key={room}>
												{room}
											</option>
										))}
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">Shower Rooms</Typography>
									<select
										className={'select-description'}
										value={insertPropertyData.propertyBaths || 'select'}
										onChange={({ target: { value } }) =>
											setInsertPropertyData({ ...insertPropertyData, propertyBaths: parseInt(value) })
										}
									>
										<option disabled value={'select'}>
											Select
										</option>
										{[1, 2, 3, 4, 5].map((bath: number) => (
											<option value={`${bath}`} key={bath}>
												{bath}
											</option>
										))}
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">Area (sqm)</Typography>
									<select
										className={'select-description'}
										value={insertPropertyData.propertySquare || 'select'}
										onChange={({ target: { value } }) =>
											setInsertPropertyData({ ...insertPropertyData, propertySquare: parseInt(value) })
										}
									>
										<option disabled value={'select'}>
											Select
										</option>
										{propertySquare.map((square: number) => {
											if (square !== 0) {
												return (
													<option value={`${square}`} key={square}>
														{square} sqm
													</option>
												);
											}
										})}
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
							</Stack>

							{/* Description */}
							<Typography className="property-title">Property Description</Typography>
							<Stack className="config-column">
								<Typography className="title">Description</Typography>
								<textarea
									className="description-text"
									value={insertPropertyData.propertyDesc}
									onChange={({ target: { value } }) =>
										setInsertPropertyData({ ...insertPropertyData, propertyDesc: value })
									}
								></textarea>
							</Stack>
						</Stack>

						<Typography className="upload-title">Upload photos of your property</Typography>
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
								{insertPropertyData?.propertyImages.map((image: string, index: number) => {
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
							{router.query.propertyId ? (
								<Button className="next-button" disabled={doDisabledCheck()} onClick={updatePropertyHandler}>
									<Typography className="next-button-text">Save</Typography>
								</Button>
							) : (
								<Button className="next-button" disabled={doDisabledCheck()} onClick={insertPropertyHandler}>
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

AddNewProperty.defaultProps = {
	initialValues: {
		propertyTitle: '',
		propertyPrice: 0,
		propertyType: '',
		propertyLocation: '',
		propertyAddress: '',
		propertyBarter: false,
		propertyRent: false,
		propertyRooms: 0,
		propertyBaths: 0,
		propertySquare: 0,
		propertyDesc: '',
		propertyImages: [],
	},
};

export default AddNewProperty;
