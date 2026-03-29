import React, { useState } from 'react';
import { Stack, Box, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper';
import TopClothesCard from './TopClotheCard';
import { Clothe } from '../../types/clothes/clothes';
import { ClotheInquiry } from '../../types/clothes/clothes.input';
import { useMutation, useQuery } from '@apollo/client';
import { GET_CLOTHES } from '../../../apollo/user/query';
import { LIKE_TARGET_CLOTHE } from '../../../apollo/user/mutation';
import { T } from '../../types/common';
import { Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import Link from 'next/link';

interface TopClothesProps {
	initialInput: ClotheInquiry;
}

const TopClothes = (props: TopClothesProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [topClothes, setTopClothes] = useState<Clothe[]>([]);

	const [likeTargetClothe] = useMutation(LIKE_TARGET_CLOTHE);

	const { refetch } = useQuery(GET_CLOTHES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTopClothes(data?.getClothes?.list);
		},
	});

	const likeHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetClothe({ variables: { input: id } });
			await refetch({ input: initialInput });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (!topClothes) return null;

	// 1 → 1 col (full width), 2-3 → exact count cols, 4-6 → 3 cols (max 2 rows)
	const colCount = topClothes.length <= 3 ? topClothes.length || 1 : 3;

	if (device === 'mobile') {
		return (
			<Stack className="top-clothes">
				<Stack className="container">
					<Stack className="info-box">
						<Typography className="section-label">PERFORMANCE WEAR</Typography>
						<Typography className="section-title">Athletic Wear</Typography>
					</Stack>
					<Stack className="card-box">
						<Swiper
							className="top-clothes-swiper"
							slidesPerView={'auto'}
							centeredSlides
							spaceBetween={16}
							modules={[Autoplay]}
						>
							{topClothes.map((clothe) => (
								<SwiperSlide key={clothe._id} className="top-clothes-slide">
									<TopClothesCard clothe={clothe} likeHandler={likeHandler} />
								</SwiperSlide>
							))}
						</Swiper>
					</Stack>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className="top-clothes">
			<Stack className="container">
				<Stack className="info-box">
					<Stack className="info-row-top">
						<Typography className="section-label">— SPORT FASHION</Typography>
						<Link href="/clothes">
							<Box className="more-box">
								<Typography>All Clothes</Typography>
								<img src="/img/icons/rightup.svg" alt="" />
							</Box>
						</Link>
					</Stack>
					<Box className="info-divider" />
					<Typography className="section-title">Athletic Wear</Typography>
					<Typography className="section-sub">Premium activewear for every session</Typography>
				</Stack>

				{/* Dynamic grid — no swiper */}
				<Box
					className="clothes-grid"
					style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
				>
					{topClothes.map((clothe) => (
						<TopClothesCard key={clothe._id} clothe={clothe} likeHandler={likeHandler} />
					))}
				</Box>
			</Stack>
		</Stack>
	);
};

TopClothes.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'clotheRank',
		direction: 'DESC',
		search: {},
	},
};

export default TopClothes;
