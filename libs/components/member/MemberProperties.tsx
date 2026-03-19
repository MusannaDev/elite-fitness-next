import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography, Chip, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { PropertyCard } from '../mypage/PropertyCard';
import { Property } from '../../types/property/property';
import { PropertiesInquiry } from '../../types/property/property.input';
import { T } from '../../types/common';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { GET_PROPERTIES } from '../../../apollo/user/query';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';

const MemberProperties: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { memberId } = router.query;
	const [searchFilter, setSearchFilter] = useState<PropertiesInquiry>({ ...initialInput });
	const [agentProperties, setAgentProperties] = useState<Property[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

	/** APOLLO REQUESTS **/
	const {
		loading: getPropertiesLoading,
		data: getPropertiesData,
		error: getPropertiesError,
		refetch: getPropertiesRefetch,
	} = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgentProperties(data?.getProperties?.list);
			setTotal(data?.getProperties?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLE **/
	useEffect(() => {
		getPropertiesRefetch().then();
	}, [searchFilter]);

	useEffect(() => {
		if (memberId)
			setSearchFilter({ ...initialInput, search: { ...initialInput.search, memberId: memberId as string } });
	}, [memberId]);

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	if (device === 'mobile') {
		return <div>MEMBER PROPERTIES MOBILE</div>;
	} else {
		return (
			<div id="member-properties-page">
				{/* HEADER */}
				<Stack className="mp-header">
					<Stack className="mp-header-left">
						<HomeWorkOutlinedIcon className="mp-header-icon" />
						<Box>
							<Typography className="mp-main-title">Listed Properties</Typography>
							<Typography className="mp-sub-title">
								{total > 0 ? `${total} properties available` : 'No listings yet'}
							</Typography>
						</Box>
					</Stack>
					<Stack className="mp-header-right">
						<Chip
							label={`${total} Total`}
							className="mp-total-chip"
							size="small"
						/>
						<Stack className="mp-view-toggle">
							<button
								className={`mp-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
								onClick={() => setViewMode('list')}
							>
								<ViewListRoundedIcon fontSize="small" />
							</button>
							<button
								className={`mp-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
								onClick={() => setViewMode('grid')}
							>
								<GridViewRoundedIcon fontSize="small" />
							</button>
						</Stack>
					</Stack>
				</Stack>

				{/* TABLE HEADER */}
				<Stack className="mp-properties-container">
					{agentProperties?.length > 0 && (
						<Stack className="mp-table-header">
							<Typography className="mp-col-title col-listing">Listing</Typography>
							<Typography className="mp-col-title col-date">Published</Typography>
							<Typography className="mp-col-title col-status">Status</Typography>
							<Typography className="mp-col-title col-views">Views</Typography>
						</Stack>
					)}

					{/* EMPTY STATE */}
					{agentProperties?.length === 0 && (
						<Stack className="mp-empty-state">
							<Box className="mp-empty-icon-wrap">
								<HomeWorkOutlinedIcon className="mp-empty-icon" />
							</Box>
							<Typography className="mp-empty-title">No Properties Listed</Typography>
							<Typography className="mp-empty-desc">This agent hasn't listed any properties yet.</Typography>
						</Stack>
					)}

					{/* PROPERTY LIST */}
					<Stack className={`mp-list ${viewMode}`}>
						{agentProperties?.map((property: Property) => (
							<PropertyCard property={property} memberPage={true} key={property?._id} />
						))}
					</Stack>

					{/* PAGINATION */}
					{agentProperties.length !== 0 && (
						<Stack className="mp-pagination-wrap">
							<Pagination
								count={Math.ceil(total / searchFilter.limit)}
								page={searchFilter.page}
								shape="rounded"
								color="primary"
								onChange={paginationHandler}
							/>
							<Typography className="mp-pagination-label">
								Page {searchFilter.page} of {Math.ceil(total / searchFilter.limit)}
							</Typography>
						</Stack>
					)}
				</Stack>
			</div>
		);
	}
};

MemberProperties.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		search: { memberId: '' },
	},
};

export default MemberProperties;