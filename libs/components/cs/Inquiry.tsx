import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Button, CircularProgress, MenuItem, Stack, TextField } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { GET_INQUIRIES } from '../../../apollo/user/query';
import { CREATE_INQUIRY } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { Direction } from '../../enums/common.enum';
import { InquiryStatus, InquiryType } from '../../enums/inquiry.enum';
import { InquiriesInquiry, InquiryInput } from '../../types/inquiry/inquiry.input';
import { Inquiry as InquiryItem } from '../../types/inquiry/inquiry';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { NEXT_PUBLIC_API_URL } from '../../config';
import ImageUploader from '../common/ImageUploader';

const INQUIRY_TYPES: { label: string; value: InquiryType }[] = [
	{ label: 'General', value: InquiryType.GENERAL },
	{ label: 'Membership', value: InquiryType.MEMBERSHIP },
	{ label: 'Training', value: InquiryType.TRAINING },
	{ label: 'Product', value: InquiryType.PRODUCT },
	{ label: 'Equipment', value: InquiryType.EQUIPMENT },
	{ label: 'Payment', value: InquiryType.PAYMENT },
];

const formatDate = (date?: Date | string) => {
	if (!date) return '-';
	try {
		return new Intl.DateTimeFormat('en-GB', {
			year: 'numeric',
			month: 'short',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		}).format(new Date(date));
	} catch {
		return '-';
	}
};

const toImageUrl = (src: string) => {
	if (!src) return '';
	if (src.startsWith('http')) return src;
	return `${NEXT_PUBLIC_API_URL}/${src}`;
};

const Inquiry = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const [input, setInput] = useState<InquiryInput>({
		inquiryType: InquiryType.GENERAL,
		inquiryTitle: '',
		inquiryContent: '',
	});
	const [uploadedImages, setUploadedImages] = useState<string[]>([]);

	const inquiry = useMemo<InquiriesInquiry>(() => ({
		page: 1,
		limit: 20,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	}), []);

	const [createInquiry, { loading: createLoading }] = useMutation(CREATE_INQUIRY);
	const { data, loading, refetch } = useQuery(GET_INQUIRIES, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
	});

	const inquiries: InquiryItem[] = data?.getInquiries?.list ?? [];

	const submitHandler = async () => {
		try {
			if (!user?._id) throw new Error('Please login first');
			if (!input.inquiryTitle?.trim() || input.inquiryTitle.trim().length < 3) {
				throw new Error('Title must be at least 3 characters');
			}
			if (!input.inquiryContent?.trim() || input.inquiryContent.trim().length < 5) {
				throw new Error('Content must be at least 5 characters');
			}

			await createInquiry({
				variables: {
					input: {
						...input,
						inquiryTitle: input.inquiryTitle.trim(),
						inquiryContent: input.inquiryContent.trim(),
						inquiryImages: uploadedImages,
					},
				},
			});
			await sweetTopSmallSuccessAlert('Inquiry submitted successfully', 1000);
			setInput((prev) => ({ ...prev, inquiryTitle: '', inquiryContent: '' }));
			setUploadedImages([]);
			await refetch({ input: inquiry });
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message ?? 'Failed to submit inquiry');
		}
	};

	if (device === 'mobile') {
		return <div>Inquiry MOBILE</div>;
	} else {
		return (
			<div className={'inquiry-panel'}>
				<div className={'inquiry-compose'}>
					<span className={'compose-eyebrow'}>Write to support</span>
					<h3 className={'compose-title'}>Create a new inquiry</h3>
					<p className={'compose-subtitle'}>Share your issue in detail and we will respond as soon as possible.</p>

					<Stack className={'compose-form'} gap={1.2}>
						<TextField
							size={'small'}
							select
							label={'Inquiry type'}
							value={input.inquiryType}
							onChange={(e) => setInput((prev) => ({ ...prev, inquiryType: e.target.value as InquiryType }))}
						>
							{INQUIRY_TYPES.map((type) => (
								<MenuItem key={type.value} value={type.value}>
									{type.label}
								</MenuItem>
							))}
						</TextField>

						<TextField
							size={'small'}
							label={'Title'}
							placeholder={'Enter inquiry title'}
							value={input.inquiryTitle}
							onChange={(e) => setInput((prev) => ({ ...prev, inquiryTitle: e.target.value }))}
							inputProps={{ maxLength: 100 }}
						/>

						<TextField
							size={'small'}
							label={'Content'}
							placeholder={'Describe your issue'}
							value={input.inquiryContent}
							onChange={(e) => setInput((prev) => ({ ...prev, inquiryContent: e.target.value }))}
							inputProps={{ maxLength: 2000 }}
							minRows={5}
							maxRows={8}
							multiline
						/>

						<ImageUploader
							target={'inquiry'}
							value={uploadedImages}
							onChange={setUploadedImages}
							label={'Attach images (optional)'}
						/>

						<Button
							className={'compose-submit'}
							variant={'contained'}
							onClick={submitHandler}
							disabled={createLoading}
						>
							{createLoading ? 'Submitting...' : 'Submit Inquiry'}
						</Button>
					</Stack>
				</div>

				<div className={'inquiry-feed'}>
					<div className={'feed-head'}>
						<span className={'feed-eyebrow'}>History</span>
						<h3 className={'feed-title'}>Your inquiries</h3>
					</div>

					{loading ? (
						<div className={'feed-loading'}>
							<CircularProgress size={22} />
						</div>
					) : inquiries.length === 0 ? (
						<div className={'feed-empty'}>
							No inquiries yet. Create your first inquiry from the left panel.
						</div>
					) : (
						<div className={'feed-list'}>
							{inquiries.map((item: InquiryItem) => (
								<div key={item._id} className={'inquiry-card'}>
									<div className={'card-top'}>
										<span className={'type-chip'}>{item.inquiryType}</span>
										<span className={`status-chip ${item.inquiryStatus?.toLowerCase() || InquiryStatus.PENDING.toLowerCase()}`}>
											{item.inquiryStatus}
										</span>
									</div>
									<h4 className={'card-title'}>{item.inquiryTitle}</h4>
									<p className={'card-content'}>{item.inquiryContent}</p>
									{!!item.inquiryImages?.length && (
										<div className={'card-images'}>
											{item.inquiryImages.slice(0, 3).map((src, idx) => (
												<img key={`${item._id}-img-${idx}`} src={toImageUrl(src)} alt={'inquiry-image'} />
											))}
										</div>
									)}
									<div className={'card-meta'}>
										<span>{formatDate(item.createdAt)}</span>
										{item.respondedAt && <span>Answered: {formatDate(item.respondedAt)}</span>}
									</div>
									{item.adminResponse && (
										<div className={'admin-response'}>
											<span className={'admin-label'}>Admin response</span>
											<p>{item.adminResponse}</p>
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		);
	}
};

export default Inquiry;
