import React, { useState } from 'react';
import { Stack, Box, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import TopSalesManagerCard from './TopSalesManagerCard';
import { Member } from '../../types/member/member';
import { MembersInquiry } from '../../types/member/member.input';
import { useMutation, useQuery } from '@apollo/client';
import { GET_SALES_MANAGERS } from '../../../apollo/user/query';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { T } from '../../types/common';
import { Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import Link from 'next/link';

interface TopSalesManagersProps {
	initialInput: MembersInquiry;
}

const TopSalesManagers = (props: TopSalesManagersProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [managers, setManagers] = useState<Member[]>([]);

	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	const { refetch } = useQuery(GET_SALES_MANAGERS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setManagers(data?.getSalesManagers?.list);
		},
	});

	const likeManagerHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetMember({ variables: { input: id } });
			await refetch({ input: initialInput });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const followManagerHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			const isFollowing = managers.find((m) => m._id === id)?.meFollowed?.[0]?.myFollowing;
			if (isFollowing) {
				await unsubscribe({ variables: { input: id } });
			} else {
				await subscribe({ variables: { input: id } });
			}
			await refetch({ input: initialInput });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (device === 'mobile') {
		return (
			<Stack className="top-sales-managers">
				<Stack className="container">
					<Stack className="info-box">
						<Typography className="section-label">SALES PROS</Typography>
						<Typography className="section-title">Our Sales Team</Typography>
					</Stack>
					<Stack className="managers-list">
						{managers.map((m) => (
							<TopSalesManagerCard
								key={m._id}
								manager={m}
								likeManagerHandler={likeManagerHandler}
								followManagerHandler={followManagerHandler}
							/>
						))}
					</Stack>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className="top-sales-managers">
			<Stack className="container">
				<Stack className="info-box">
					<Stack className="info-row-top">
						<Typography className="section-label">— SALES PROS</Typography>
						<Link href="/member?memberType=SALES_MANAGER">
							<Box className="more-box">
								<Typography>All Managers</Typography>
								<img src="/img/icons/rightup.svg" alt="" />
							</Box>
						</Link>
					</Stack>
					<Box className="info-divider" />
					<Typography className="section-title">Our Sales Team</Typography>
					<Typography className="section-sub">Your go-to gear advisors</Typography>
				</Stack>

				<Stack className="managers-strip">
					{managers.map((m) => (
						<TopSalesManagerCard
							key={m._id}
							manager={m}
							likeManagerHandler={likeManagerHandler}
							followManagerHandler={followManagerHandler}
						/>
					))}
				</Stack>
			</Stack>
		</Stack>
	);
};

TopSalesManagers.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'memberRank',
		direction: 'DESC',
		search: {},
	},
};

export default TopSalesManagers;