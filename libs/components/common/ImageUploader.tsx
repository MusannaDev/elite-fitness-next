import React, { useRef, useState } from 'react';
import axios from 'axios';
import { Button, CircularProgress, Stack, Typography } from '@mui/material';
import { getJwtToken } from '../../auth';
import { NEXT_PUBLIC_API_URL } from '../../config';
import { sweetMixinErrorAlert } from '../../sweetAlert';

interface ImageUploaderProps {
	target: string;
	value: string[];
	onChange: (images: string[]) => void;
	maxFiles?: number;
	label?: string;
}

const toImageUrl = (src: string) => {
	if (!src) return '';
	if (src.startsWith('http')) return src;
	return `${NEXT_PUBLIC_API_URL}/${src}`;
};

const ImageUploader = (props: ImageUploaderProps) => {
	const { target, value, onChange, maxFiles = 5, label = 'Attach images' } = props;
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [uploading, setUploading] = useState(false);

	const uploadHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
		try {
			const files = Array.from(e.target.files ?? []);
			if (!files.length) return;
			if (files.length > maxFiles) {
				throw new Error(`Cannot upload more than ${maxFiles} images!`);
			}

			setUploading(true);
			const token = getJwtToken();
			const headers: Record<string, string | boolean> = {
				'Content-Type': 'multipart/form-data',
				'apollo-require-preflight': true,
			};
			if (token) headers.Authorization = `Bearer ${token}`;

			const uploaded = await Promise.all(
				files.map(async (file) => {
					const formData = new FormData();
					formData.append(
						'operations',
						JSON.stringify({
							query: `mutation ImageUploader($file: Upload!, $target: String!) {
								imageUploader(file: $file, target: $target)
							}`,
							variables: {
								file: null,
								target,
							},
						}),
					);
					formData.append('map', JSON.stringify({ '0': ['variables.file'] }));
					formData.append('0', file);

					const response = await axios.post(`${process.env.NEXT_PUBLIC_API_GRAPHQL_URL}`, formData, { headers });
					return response?.data?.data?.imageUploader;
				}),
			);

			onChange(uploaded.filter((img): img is string => Boolean(img)));
			if (inputRef.current) inputRef.current.value = '';
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message ?? 'Image upload failed');
		} finally {
			setUploading(false);
		}
	};

	return (
		<Stack className={'image-uploader'} gap={1}>
			<Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
				<Typography className={'uploader-label'}>{label}</Typography>
				<Stack direction={'row'} gap={0.8} className={'uploader-actions'}>
					<input
						ref={inputRef}
						type={'file'}
						accept={'image/jpg,image/jpeg,image/png,image/webp'}
						multiple
						hidden
						id={`image-uploader-${target}`}
						onChange={uploadHandler}
					/>
					<label htmlFor={`image-uploader-${target}`}>
						<Button className={'uploader-upload-btn'} component={'span'} size={'small'} variant={'outlined'} disabled={uploading}>
							{uploading ? <CircularProgress size={14} /> : 'Upload'}
						</Button>
					</label>
					{!!value.length && (
						<Button className={'uploader-clear-btn'} size={'small'} color={'error'} onClick={() => onChange([])}>
							Clear
						</Button>
					)}
				</Stack>
			</Stack>

			{!!value.length && (
				<div className={'uploader-preview'}>
					{value.map((src, idx) => (
						<img key={`${target}-${idx}`} src={toImageUrl(src)} alt={'uploaded'} />
					))}
				</div>
			)}
		</Stack>
	);
};

export default ImageUploader;
