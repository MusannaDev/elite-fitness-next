import React, { useState } from 'react';
import { Box, Stack, Pagination } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';

interface NoticeItem {
	_id: string;
	noticeTitle: string;
	noticeContent: string;
	noticeType: 'EVENT' | 'NOTICE';
	createdAt: string;
}

const SAMPLE_DATA: NoticeItem[] = [
	{
		_id: '1',
		noticeType: 'EVENT',
		noticeTitle: 'Register to use and get discounts',
		noticeContent: 'Sign up now and enjoy exclusive discounts on your first property listing!',
		createdAt: '2024-03-01T00:00:00.000Z',
	},
	{
		_id: '2',
		noticeType: 'NOTICE',
		noticeTitle: "It's absolutely free to upload and trade properties",
		noticeContent: 'Our platform allows you to list and trade properties completely free of charge.',
		createdAt: '2024-03-31T00:00:00.000Z',
	},
	{
		_id: '3',
		noticeType: 'EVENT',
		noticeTitle: 'Spring Sale: Up to 20% off on premium listings',
		noticeContent: 'For a limited time, premium property listings are available at a discounted rate.',
		createdAt: '2024-04-05T00:00:00.000Z',
	},
	{
		_id: '4',
		noticeType: 'NOTICE',
		noticeTitle: 'New features added to the property search',
		noticeContent: 'We have added advanced filtering and map view to improve your search experience.',
		createdAt: '2024-04-10T00:00:00.000Z',
	},
	{
		_id: '5',
		noticeType: 'NOTICE',
		noticeTitle: 'Scheduled maintenance on April 20, 2024',
		noticeContent: 'Our platform will undergo maintenance from 2:00 AM to 4:00 AM. Services may be temporarily unavailable.',
		createdAt: '2024-04-15T00:00:00.000Z',
	},
];

const formatDate = (isoString: string): string => {
	const d = new Date(isoString);
	const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
	return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const Notice = () => {
	const device = useDeviceDetect();
	const [page, setPage] = useState<number>(1);
	const [expandedId, setExpandedId] = useState<string | null>(null);

	// TODO: replace with Apollo query
	const notices: NoticeItem[] = SAMPLE_DATA;
	const totalCount: number = SAMPLE_DATA.length;

	const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => setPage(value);
	const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);

	if (device === 'mobile') return <div>NOTICE MOBILE</div>;

	return (
		<Stack className={'timeline-notice'}>
			<div className={'timeline-track'}>
				{notices.map((item, index) => (
					<div
						key={item._id}
						className={`timeline-entry ${item.noticeType === 'EVENT' ? 'is-event' : 'is-notice'} ${expandedId === item._id ? 'is-expanded' : ''}`}
						style={{ animationDelay: `${index * 80}ms` }}
					>
						{/* Left: date column */}
						<div className={'entry-date'}>
							<span className={'date-text'}>{formatDate(item.createdAt)}</span>
						</div>

						{/* Center: dot + line */}
						<div className={'entry-spine'}>
							<div className={'spine-dot'}>
								{item.noticeType === 'EVENT' && <div className={'dot-pulse'} />}
							</div>
							{index < notices.length - 1 && <div className={'spine-line'} />}
						</div>

						{/* Right: content */}
						<div className={'entry-content'} onClick={() => toggleExpand(item._id)}>
							<div className={'content-header'}>
								<span className={'type-badge'}>{item.noticeType}</span>
								<span className={'expand-icon'}>{expandedId === item._id ? '−' : '+'}</span>
							</div>
							<h3 className={'content-title'}>{item.noticeTitle}</h3>
							{expandedId === item._id && (
								<p className={'content-body'}>{item.noticeContent}</p>
							)}
						</div>
					</div>
				))}
			</div>

			{totalCount > 10 && (
				<Box className={'timeline-pagination'} component={'div'}>
					<Pagination
						count={Math.ceil(totalCount / 10)}
						page={page}
						onChange={handlePageChange}
						shape="rounded"
						color="primary"
					/>
				</Box>
			)}
		</Stack>
	);
};

export default Notice;