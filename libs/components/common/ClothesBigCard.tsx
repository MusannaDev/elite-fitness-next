import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Clothe } from '../../types/clothes/clothes';
import { REACT_APP_API_URL, topClotheRank } from '../../config';
import { formatterStr } from '../../utils';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

interface ClothesBigCardProps {
	clothe: Clothe;
	likeClotheHandler: any;
}

const ClothesBigCard = (props: ClothesBigCardProps) => {
	const { clothe, likeClotheHandler } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** HANDLERS **/
	const goClotheDetailPage = (clotheId: string) => {
		router.push(`/clothes/detail?id=${clotheId}`);
	};

	if (device === 'mobile') {
		return <div>CLOTHES BIG CARD</div>;
	} else {
		return (
			<Stack className="clothes-big-card-box" onClick={() => goClotheDetailPage(clothe?._id)}>
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${REACT_APP_API_URL}/${clothe?.clotheImages?.[0]})` }}
				>
					{clothe && clothe?.clotheRank >= topClotheRank && (
						<div className={'status'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<span>top</span>
						</div>
					)}

					<div className={'price'}>${formatterStr(clothe?.clothePrice)}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong className={'title'}>{clothe?.clotheName}</strong>
					<p className={'desc'}>{clothe?.clotheBrand}</p>
					<div className={'options'}>
						<div>
							<img src="/img/icons/size.svg" alt="" />
							<span>{clothe?.clotheSize}</span>
						</div>
						<div>
							<img src="/img/icons/color.svg" alt="" />
							<span>{clothe?.clotheColor}</span>
						</div>
						<div>
							<img src="/img/icons/material.svg" alt="" />
							<span>{clothe?.clotheMaterial}</span>
						</div>
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<div>
							{clothe?.clotheGender ? <p>{clothe.clotheGender}</p> : <span>Gender</span>}
							{clothe?.clotheCategory ? <p>{clothe.clotheCategory}</p> : <span>Category</span>}
						</div>
						<div className="buttons-box">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{clothe?.clotheViews}</Typography>
							<IconButton
								color={'default'}
								onClick={(e: any) => {
									e.stopPropagation();
									likeClotheHandler(user, clothe._id);
								}}
							>
								{clothe?.meLiked && clothe?.meLiked[0]?.myFavorite ? (
									<FavoriteIcon style={{ color: 'red' }} />
								) : (
									<FavoriteIcon />
								)}
							</IconButton>
							<Typography className="view-cnt">{clothe?.clotheLikes}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	}
};

export default ClothesBigCard;