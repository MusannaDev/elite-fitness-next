import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Button, CircularProgress, MenuItem, Stack, TextField } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { GET_NOTICES } from '../../../apollo/user/query';
import { CREATE_NOTICE } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { Direction } from '../../enums/common.enum';
import { NoticeCategory } from '../../enums/notice.enum';
import { NoticeInput, NoticesInquiry } from '../../types/notice/notice.input';
import { Notice as NoticeItem } from '../../types/notice/notice';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import ImageUploader from '../common/ImageUploader';
import { NEXT_PUBLIC_API_URL } from '../../config';

const NOTICE_IMAGE_MARKER = '[notice-images]:';

const NOTICE_CATEGORIES: { label: string; value: NoticeCategory }[] = [
	{ label: 'FAQ', value: NoticeCategory.FAQ },
	{ label: 'Terms', value: NoticeCategory.TERMS },
	{ label: 'Announcement', value: NoticeCategory.ANNOUNCEMENT },
	{ label: 'Update', value: NoticeCategory.UPDATE },
	{ label: 'Maintenance', value: NoticeCategory.MAINTENANCE },
	{ label: 'Promotion', value: NoticeCategory.PROMOTION },
	{ label: 'Policy', value: NoticeCategory.POLICY },
	{ label: 'Event', value: NoticeCategory.EVENT },
	{ label: 'Alert', value: NoticeCategory.ALERT },
];

const formatDate = (date?: Date | string): string => {
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

const serializeNoticeContent = (text: string, images: string[]) => {
	const normalized = text.trim();
	if (!images.length) return normalized;
	return `${normalized}\n\n${NOTICE_IMAGE_MARKER}${images.join(',')}`;
};

const parseNoticeContent = (raw?: string) => {
	const content = raw || '';
	const markerIndex = content.indexOf(NOTICE_IMAGE_MARKER);
	if (markerIndex < 0) {
		return { text: content, images: [] as string[] };
	}
	const text = content.slice(0, markerIndex).trim();
	const imageRaw = content.slice(markerIndex + NOTICE_IMAGE_MARKER.length);
	const images = imageRaw
		.split(',')
		.map((item) => item.trim())
		.filter((item) => Boolean(item));

	return { text, images };
};

const Notice = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const [uploadedImages, setUploadedImages] = useState<string[]>([]);
	const [input, setInput] = useState<NoticeInput>({
		noticeCategory: NoticeCategory.ANNOUNCEMENT,
		noticeTitle: '',
		noticeContent: '',
	});

	const inquiry = useMemo<NoticesInquiry>(() => ({
		page: 1,
		limit: 20,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	}), []);

	const [createNotice, { loading: createLoading }] = useMutation(CREATE_NOTICE);
	const { data, loading, refetch } = useQuery(GET_NOTICES, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
	});

	const notices: NoticeItem[] = data?.getNotices?.list ?? [];

	const submitHandler = async () => {
		try {
			if (!user?._id) throw new Error('Please login first');
			if (!input.noticeTitle?.trim() || input.noticeTitle.trim().length < 3) {
				throw new Error('Title must be at least 3 characters');
			}
			if (!input.noticeContent?.trim() || input.noticeContent.trim().length < 5) {
				throw new Error('Content must be at least 5 characters');
			}

			await createNotice({
				variables: {
					input: {
						...input,
						noticeTitle: input.noticeTitle.trim(),
						noticeContent: serializeNoticeContent(input.noticeContent, uploadedImages),
					},
				},
			});
			await sweetTopSmallSuccessAlert('Notice published successfully', 1000);
			setInput((prev) => ({ ...prev, noticeTitle: '', noticeContent: '' }));
			setUploadedImages([]);
			await refetch({ input: inquiry });
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message ?? 'Failed to create notice');
		}
	};

	if (device === 'mobile') return <div>NOTICE MOBILE</div>;

	return (
		<div className={'notice-studio'}>
			<div className={'notice-write'}>
				<span className={'notice-eyebrow'}>Editorial board</span>
				<h3 className={'notice-title'}>Post a notice</h3>
				<p className={'notice-sub'}>Publish updates, terms, or support announcements.</p>

				<Stack gap={1.2}>
					<TextField
						size={'small'}
						select
						label={'Category'}
						value={input.noticeCategory}
						onChange={(e) => setInput((prev) => ({ ...prev, noticeCategory: e.target.value as NoticeCategory }))}
					>
						{NOTICE_CATEGORIES.map((cat) => (
							<MenuItem key={cat.value} value={cat.value}>
								{cat.label}
							</MenuItem>
						))}
					</TextField>

					<TextField
						size={'small'}
						label={'Title'}
						placeholder={'Enter notice title'}
						value={input.noticeTitle}
						onChange={(e) => setInput((prev) => ({ ...prev, noticeTitle: e.target.value }))}
						inputProps={{ maxLength: 120 }}
					/>

					<TextField
						size={'small'}
						label={'Content'}
						placeholder={'Write the notice content'}
						value={input.noticeContent}
						onChange={(e) => setInput((prev) => ({ ...prev, noticeContent: e.target.value }))}
						inputProps={{ maxLength: 2200 }}
						minRows={5}
						maxRows={8}
						multiline
					/>

					<ImageUploader
						target={'notice'}
						value={uploadedImages}
						onChange={setUploadedImages}
						label={'Notice images (optional)'}
					/>

					<Button className={'notice-submit'} variant={'contained'} onClick={submitHandler} disabled={createLoading}>
						{createLoading ? 'Publishing...' : 'Publish Notice'}
					</Button>
				</Stack>
			</div>

			<div className={'notice-board'}>
				<div className={'board-head'}>
					<span className={'board-eyebrow'}>Published</span>
					<h3 className={'board-title'}>Notice archive</h3>
				</div>

				{loading ? (
					<div className={'board-loading'}>
						<CircularProgress size={22} />
					</div>
				) : !notices.length ? (
					<div className={'board-empty'}>No notices yet.</div>
				) : (
					<div className={'board-list'}>
						{notices.map((item) => {
							const parsed = parseNoticeContent(item.noticeContent);
							return (
								<div key={item._id} className={'notice-card'}>
									<div className={'card-row'}>
										<span className={'cat-chip'}>{item.noticeCategory}</span>
										<span className={'date-chip'}>{formatDate(item.createdAt)}</span>
									</div>
									<h4>{item.noticeTitle}</h4>
									<p>{parsed.text}</p>
									{!!parsed.images.length && (
										<div className={'notice-images'}>
											{parsed.images.slice(0, 3).map((src, idx) => (
												<img key={`${item._id}-img-${idx}`} src={toImageUrl(src)} alt={'notice-image'} />
											))}
										</div>
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export default Notice;
