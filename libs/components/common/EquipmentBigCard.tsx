import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Equipment } from '../../types/equipment/equipment';
import Link from 'next/link';
import { formatterStr } from '../../utils';
import { REACT_APP_API_URL, topEquipmentRank } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import BuildIcon from '@mui/icons-material/Build';
import InventoryIcon from '@mui/icons-material/Inventory';

interface EquipmentBigCardType {
  equipment: Equipment;
  likeEquipmentHandler?: any;
}

const EquipmentBigCard = (props: EquipmentBigCardType) => {
  const { equipment, likeEquipmentHandler } = props;
  const device = useDeviceDetect();
  const user = useReactiveVar(userVar);
  const imagePath: string = equipment?.equipmentImages[0]
    ? `${REACT_APP_API_URL}/${equipment?.equipmentImages[0]}`
    : '/img/banner/header1.svg';

  if (device === 'mobile') {
    return <div>EQUIPMENT BIG CARD</div>;
  } else {
    return (
      <Stack className="equipment-big-card">
        <Stack className="card-img">
          <Link
            href={{
              pathname: '/equipment/detail',
              query: { id: equipment?._id },
            }}
          >
            <img src={imagePath} alt="" />
          </Link>
          {equipment && equipment?.equipmentRank > topEquipmentRank && (
            <Box component={'div'} className={'status-badge'}>
              TOP
            </Box>
          )}
          {equipment?.isBestseller && (
            <Box component={'div'} className={'bestseller-badge'}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Bestseller
            </Box>
          )}
          <Box component={'div'} className={'price-box'}>
            <Typography>${formatterStr(equipment?.equipmentPrice)}</Typography>
          </Box>
        </Stack>
        <Stack className="card-info">
          <Stack className="name-brand">
            <Stack className="name">
              <Link
                href={{
                  pathname: '/equipment/detail',
                  query: { id: equipment?._id },
                }}
              >
                <Typography>{equipment.equipmentName}</Typography>
              </Link>
            </Stack>
            <Stack className="brand">
              <Typography>{equipment.equipmentBrand}</Typography>
            </Stack>
          </Stack>
          <Stack className="options">
            <Stack className="option">
              <BuildIcon fontSize="small" />
              <Typography>{equipment.equipmentMaterial}</Typography>
            </Stack>
            <Stack className="option">
              <FitnessCenterIcon fontSize="small" />
              <Typography>{equipment.equipmentWeight ? `${equipment.equipmentWeight} kg` : 'N/A'}</Typography>
            </Stack>
            <Stack className="option">
              <InventoryIcon fontSize="small" />
              <Typography>{equipment.equipmentLeftCount} in stock</Typography>
            </Stack>
          </Stack>
          <Stack className="divider"></Stack>
          <Stack className="type-buttons">
            <Stack className="type">
              <Typography className="category-tag">{equipment.equipmentCategory}</Typography>
              <Typography className="location-tag">{equipment.equipmentLocation}</Typography>
            </Stack>
            <Stack className="buttons">
              <Stack className="button-box">
                <IconButton color={'default'} size="small">
                  <RemoveRedEyeIcon />
                </IconButton>
                <Typography>{equipment?.equipmentViews}</Typography>
              </Stack>
              <Stack className="button-box">
                <IconButton
                  color={'default'}
                  size="small"
                  onClick={() => likeEquipmentHandler(user, equipment?._id)}
                >
                  {equipment?.meLiked && equipment?.meLiked[0]?.myFavorite ? (
                    <FavoriteIcon color="primary" />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </IconButton>
                <Typography>{equipment?.equipmentLikes}</Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    );
  }
};

export default EquipmentBigCard;