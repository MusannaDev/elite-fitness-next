import React, { useState } from 'react';
import { Stack, Box, Typography, IconButton } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CloseIcon from '@mui/icons-material/Close';

const Advertisement = () => {
	const device = useDeviceDetect();
	const [videoVisible, setVideoVisible] = useState(false);

	const stats = [
		{ num: '5K+', label: 'Active Members' },
		{ num: '200+', label: 'Products' },
		{ num: '50+', label: 'Pro Trainers' },
		{ num: '98%', label: 'Satisfaction' },
	];

	if (device === 'mobile') {
		return (
			<Stack className="advertisement">
				<Stack className="container">
					<Box className="ad-content-mobile">
						<Typography className="ad-eyebrow">Spring 2026 — Limited Offer</Typography>
						<Typography className="ad-title">Train Hard. Look Sharp.</Typography>
						<Typography className="ad-sub">
							Premium supplements, professional equipment and curated apparel.
						</Typography>
						<Box className="ad-cta-btn">
							<Typography>Shop the Collection</Typography>
						</Box>
					</Box>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className="advertisement">
			<Stack className="container">
				<Stack className="ad-inner" direction="row">
					{/* LEFT: Text content */}
					<Box className="ad-left">
						<Box className="ad-eyebrow-wrap">
							<Box className="ad-eyebrow-dot" />
							<Typography className="ad-eyebrow">Spring 2026 Collection</Typography>
						</Box>

						<Typography className="ad-title">
							Peak Performance<br />Starts Here
						</Typography>

						<Typography className="ad-sub">
							Everything a serious athlete needs — premium supplements,
							professional equipment and performance apparel — all under one roof.
						</Typography>

						<Stack direction="row" gap="12px" mt="32px" alignItems="center">
							<Box className="ad-btn-primary">
								<Typography>Shop Now</Typography>
							</Box>
							<Box
								className="ad-btn-play"
								onClick={() => setVideoVisible(true)}
							>
								<PlayCircleOutlineIcon style={{ fontSize: 18 }} />
								<Typography>Watch Video</Typography>
							</Box>
						</Stack>

						<Stack direction="row" gap="24px" mt="40px" className="ad-stats-row">
							{stats.map((s) => (
								<Box key={s.label} className="ad-stat-block">
									<Box className="ad-stat-divider" />
									<Typography className="ad-stat-num">{s.num}</Typography>
									<Typography className="ad-stat-label">{s.label}</Typography>
								</Box>
							))}
						</Stack>
					</Box>

					{/* RIGHT: Video / Poster */}
					<Box className="ad-right">
						{videoVisible ? (
							<Box className="ad-video-wrap">
								<IconButton
									className="ad-video-close"
									onClick={() => setVideoVisible(false)}
								>
									<CloseIcon />
								</IconButton>
								<video
									autoPlay
									muted
									loop
									playsInline
									preload="auto"
									style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
								>
									<source src="/video/Fitness_intro.mp4" type="video/mp4" />
								</video>
							</Box>
						) : (
							<Box className="ad-poster-wrap">
								<Box className="ad-poster-bg" />
								<Box className="ad-poster-overlay">
									<Box
										className="ad-play-circle"
										onClick={() => setVideoVisible(true)}
									>
										<PlayCircleOutlineIcon style={{ fontSize: 36 }} />
									</Box>
									<Typography className="ad-poster-label">Watch Our Story</Typography>
								</Box>
							</Box>
						)}
					</Box>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default Advertisement;