import React, { useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Button, Stack, Typography, LinearProgress } from '@mui/material';
import axios from 'axios';
import { Messages, REACT_APP_API_URL } from '../../config';
import { getJwtToken, updateStorage, updateUserInfo } from '../../auth';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberUpdate } from '../../types/member/member.update';
import { UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../sweetAlert';
import {
	CameraAltOutlined,
	DeleteOutlineOutlined,
	SaveOutlined,
	PersonOutlineOutlined,
	PhoneOutlined,
	LocationOnOutlined,
	InfoOutlined,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { MemberType } from '../../enums/member.enum';

const MyProfile: NextPage = ({ initialValues, ...props }: any) => {
	const device = useDeviceDetect();
	const token = getJwtToken();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const [updateData, setUpdateData] = useState<MemberUpdate>(initialValues);
	const [uploading, setUploading] = useState(false);

	/** APOLLO REQUESTS **/
	const [updateMember] = useMutation(UPDATE_MEMBER);

	/** LIFECYCLE **/
	useEffect(() => {
		setUpdateData({
			...updateData,
			memberNick: user.memberNick,
			memberPhone: user.memberPhone,
			memberAddress: user.memberAddress,
			memberImage: user.memberImage,
			memberDesc: user.memberDesc,
		});
	}, [user]);

	/** HANDLERS **/
	const adminRedirectHandler = () => {
		if (user.memberType === MemberType.ADMIN) {
			router.push('/_admin/users');
		}
	};

	const uploadImage = async (e: any) => {
		try {
			const image = e.target.files[0];
			if (!image) return;

			setUploading(true);
			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target) 
				  }`,
					variables: {
						file: null,
						target: 'member',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.file'],
				}),
			);
			formData.append('0', image);

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImage = response.data.data.imageUploader;
			updateData.memberImage = responseImage;
			setUpdateData({ ...updateData });
			setUploading(false);

			return `${REACT_APP_API_URL}/${responseImage}`;
		} catch (err) {
			console.log('Error, uploadImage:', err);
			setUploading(false);
		}
	};

	const removeImage = () => {
		setUpdateData({ ...updateData, memberImage: '' });
	};

	const updatePropertyHandler = useCallback(async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			updateData._id = user._id;
			const result = await updateMember({
				variables: {
					input: updateData,
				},
			});

			//@ts-ignore
			const jwtToken = result.data.updateMember?.accessToken;
			await updateStorage({ jwtToken });
			updateUserInfo(result.data.updateMember?.accessToken);
			await sweetMixinSuccessAlert('Profile updated successfully!');
		} catch (err: any) {
			console.log('ERROR:', err);
			sweetErrorHandling(err.message);
		}
	}, [updateData]);

	const doDisabledCheck = () => {
		if (
			updateData.memberNick === '' ||
			updateData.memberPhone === '' ||
			updateData.memberAddress === '' ||
			updateData.memberImage === ''
		) {
			return true;
		}
		return false;
	};

	if (device === 'mobile') {
		return <>MY PROFILE PAGE MOBILE</>;
	} else
		return (
			<div id="my-profile-page">
				{/* ====== HERO: Profile Image + Info ====== */}
				<Stack className="profile-hero-card">
					<Stack className="hero-inner">
						<Stack className="hero-avatar">
							<img
								src={
									updateData?.memberImage
										? `${REACT_APP_API_URL}/${updateData.memberImage}`
										: `/img/profile/defaultUser.svg`
								}
								alt="Profile"
							/>
							{uploading && (
								<Stack className="upload-overlay">
									<LinearProgress color="inherit" />
								</Stack>
							)}
						</Stack>
						<Stack className="hero-info">
							<Typography className="hero-name">
								{updateData.memberNick || user.memberNick || 'User'}
							</Typography>
							<Typography className="hero-role">
								<span
									onClick={adminRedirectHandler}
									style={{
										cursor: user.memberType === MemberType.ADMIN ? 'pointer' : 'default',
										color: user.memberType === MemberType.ADMIN ? '#534AB7' : 'inherit',
										fontWeight: user.memberType === MemberType.ADMIN ? 600 : 'inherit',
									}}
								>
									{user.memberType || 'Agent'}
								</span>
								{' · '}
								{updateData.memberAddress || 'No address'}
							</Typography>
							<Stack className="hero-actions">
								<input
									type="file"
									hidden
									id="profile-image-upload"
									onChange={uploadImage}
									accept="image/jpg, image/jpeg, image/png"
								/>
								<label htmlFor="profile-image-upload">
									<Button
										component="span"
										className="btn-upload"
										startIcon={<CameraAltOutlined />}
									>
										Upload photo
									</Button>
								</label>
								<Button
									className="btn-remove"
									startIcon={<DeleteOutlineOutlined />}
									onClick={removeImage}
								>
									Remove
								</Button>
							</Stack>
						</Stack>
					</Stack>
				</Stack>

				{/* ====== Personal Details Card ====== */}
				<Stack className="profile-card details-card">
					<Typography className="card-title">Personal details</Typography>
					<Stack className="form-grid">
						<Stack className="form-field">
							<Stack className="field-label">
								<PersonOutlineOutlined className="field-icon" />
								<Typography>Username</Typography>
							</Stack>
							<input
								type="text"
								placeholder="Enter your username"
								value={updateData.memberNick}
								onChange={({ target: { value } }) =>
									setUpdateData({ ...updateData, memberNick: value })
								}
							/>
						</Stack>
						<Stack className="form-field">
							<Stack className="field-label">
								<PhoneOutlined className="field-icon" />
								<Typography>Phone</Typography>
							</Stack>
							<input
								type="text"
								placeholder="Enter your phone number"
								value={updateData.memberPhone}
								onChange={({ target: { value } }) =>
									setUpdateData({ ...updateData, memberPhone: value })
								}
							/>
						</Stack>
					</Stack>
					<Stack className="form-field full-width">
						<Stack className="field-label">
							<LocationOnOutlined className="field-icon" />
							<Typography>Address</Typography>
						</Stack>
						<input
							type="text"
							placeholder="Enter your address"
							value={updateData.memberAddress}
							onChange={({ target: { value } }) =>
								setUpdateData({ ...updateData, memberAddress: value })
							}
						/>
					</Stack>
				</Stack>

				{/* ====== About Me Card ====== */}
				<Stack className="profile-card about-card">
					<Typography className="card-title">About me</Typography>
					<Stack className="form-field full-width">
						<Stack className="field-label">
							<InfoOutlined className="field-icon" />
							<Typography>Bio</Typography>
						</Stack>
						<textarea
							placeholder="Write something about yourself..."
							value={updateData.memberDesc || ''}
							onChange={({ target: { value } }) =>
								setUpdateData({ ...updateData, memberDesc: value })
							}
						/>
					</Stack>
					<Stack className="save-section">
						<Button
							className="btn-save"
							onClick={updatePropertyHandler}
							disabled={doDisabledCheck()}
							startIcon={<SaveOutlined />}
						>
							Save changes
						</Button>
					</Stack>
				</Stack>
			</div>
		);
};

MyProfile.defaultProps = {
	initialValues: {
		_id: '',
		memberImage: '',
		memberNick: '',
		memberPhone: '',
		memberAddress: '',
		memberDesc: '',
	},
};

export default MyProfile;