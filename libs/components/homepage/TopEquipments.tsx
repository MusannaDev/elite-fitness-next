import React, { useState } from 'react';
import { Stack, Box, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper';
import TopEquipmentCard from './TopEquipmentCard';
import { Equipment } from '../../types/equipment/equipment';
import { EquipmentsInquiry } from '../../types/equipment/equipment.input';
import { useMutation, useQuery } from '@apollo/client';
import { GET_EQUIPMENTS } from '../../../apollo/user/query';
import { LIKE_TARGET_EQUIPMENT } from '../../../apollo/user/mutation';
import { T } from '../../types/common';
import { Direction, Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import Link from 'next/link';
import { sortByEngagement } from '../../utils/ranking';

interface TopEquipmentsProps {
	initialInput: EquipmentsInquiry;
}

const TopEquipments = (props: TopEquipmentsProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [topEquipments, setTopEquipments] = useState<Equipment[]>([]);
	const equipmentsInput: EquipmentsInquiry = {
		...initialInput,
		sort: 'equipmentLikes',
		direction: Direction.DESC,
	};

	const [likeTargetEquipment] = useMutation(LIKE_TARGET_EQUIPMENT);

	const { refetch } = useQuery(GET_EQUIPMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: equipmentsInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTopEquipments(
				sortByEngagement(
					data?.getEquipments?.list ?? [],
					(equipment: Equipment) => ({
						likes: equipment.equipmentLikes,
						views: equipment.equipmentViews,
						comments: equipment.equipmentComments,
						rank: equipment.equipmentRank,
					}),
					equipmentsInput.limit,
				),
			);
		},
	});

	const likeHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetEquipment({ variables: { input: id } });
			await refetch({ input: equipmentsInput });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (!topEquipments) return null;

	// 1 → full width, 2-3 → exact count, 4-6 → 3 cols max
	const colCount = topEquipments.length <= 3 ? topEquipments.length || 1 : 3;

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
					<Stack className="info-row-top">
						<Typography className="section-label">— PRO GRADE</Typography>
						<Link href="/equipment">
							<Box className="more-box">
								<Typography>All Equipments</Typography>
								<img src="/img/icons/rightup.svg" alt="" />
							</Box>
						</Link>
					</Stack>
					<Box className="info-divider" />
					<Typography className="section-title">Beast Machines</Typography>
					<Typography className="section-sub">Heavy-duty gear for serious athletes</Typography>
				</Stack>

				{/* Dynamic grid — no swiper */}
				<Box
					className="equipment-grid"
					style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
				>
					{topEquipments.map((eq) => (
						<TopEquipmentCard key={eq._id} equipment={eq} likeHandler={likeHandler} />
					))}
				</Box>
			</Stack>
		</Stack>
	);
};

TopEquipments.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'equipmentLikes',
		direction: 'DESC',
		search: {},
	},
};

export default TopEquipments;
