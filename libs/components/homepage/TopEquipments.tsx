import React, { useState } from 'react';
import { Stack, Box, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import TopEquipmentCard from './TopEquipmentCard';
import { Equipment } from '../../types/equipment/equipment';
import { EquipmentsInquiry } from '../../types/equipment/equipment.input';
import { useMutation, useQuery } from '@apollo/client';
import { GET_EQUIPMENTS } from '../../../apollo/user/query';
import { LIKE_TARGET_EQUIPMENT } from '../../../apollo/user/mutation';
import { T } from '../../types/common';
import { Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';

interface TopEquipmentsProps {
	initialInput: EquipmentsInquiry;
}

const TopEquipments = (props: TopEquipmentsProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [topEquipments, setTopEquipments] = useState<Equipment[]>([]);

	const [likeTargetEquipment] = useMutation(LIKE_TARGET_EQUIPMENT);

	const { refetch } = useQuery(GET_EQUIPMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTopEquipments(data?.getEquipments?.list);
		},
	});

	const likeHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetEquipment({ variables: { input: id } });
			await refetch({ input: initialInput });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (!topEquipments) return null;

	if (device === 'mobile') {
		return (
			<Stack className="top-equipments">
				<Stack className="container">
					<Stack className="info-box">
						<Typography className="section-label">PRO GEAR</Typography>
						<Typography className="section-title">Beast Machines</Typography>
					</Stack>
					<Stack className="card-box">
						<Swiper
							className="top-equipment-swiper"
							slidesPerView={'auto'}
							centeredSlides
							spaceBetween={16}
							modules={[Autoplay]}
						>
							{topEquipments.map((eq) => (
								<SwiperSlide key={eq._id} className="top-equipment-slide">
									<TopEquipmentCard equipment={eq} likeHandler={likeHandler} />
								</SwiperSlide>
							))}
						</Swiper>
					</Stack>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className="top-equipments">
			<Stack className="container">
				<Stack className="info-box">
					<Box className="left">
						<Typography className="section-label">— PRO GRADE</Typography>
						<Typography className="section-title">Beast Machines</Typography>
						<Typography className="section-sub">Heavy-duty gear for serious athletes</Typography>
					</Box>
					<Box className="right">
						<Box className="pagination-box">
							<WestIcon className="swiper-equip-prev" />
							<Box className="swiper-equip-pagination" />
							<EastIcon className="swiper-equip-next" />
						</Box>
					</Box>
				</Stack>

				<Stack className="card-box">
					<Swiper
						className="top-equipment-swiper"
						slidesPerView={'auto'}
						spaceBetween={16}
						modules={[Autoplay, Navigation, Pagination]}
						navigation={{
							nextEl: '.swiper-equip-next',
							prevEl: '.swiper-equip-prev',
						}}
						pagination={{ el: '.swiper-equip-pagination' }}
					>
						{topEquipments.map((eq) => (
							<SwiperSlide key={eq._id} className="top-equipment-slide">
								<TopEquipmentCard equipment={eq} likeHandler={likeHandler} />
							</SwiperSlide>
						))}
					</Swiper>
				</Stack>
			</Stack>
		</Stack>
	);
};

TopEquipments.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'equipmentRank',
		direction: 'DESC',
		search: {},
	},
};

export default TopEquipments;