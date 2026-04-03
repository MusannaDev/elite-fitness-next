import React, { useState } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CheckroomOutlinedIcon from '@mui/icons-material/CheckroomOutlined';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import { useRouter } from 'next/router';

const AddItemMenuButton = (): JSX.Element => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const goTo = async (href: string) => {
    closeMenu();
    await router.push(href);
  };

  return (
    <>
      <Button className="btn-oc-add" startIcon={<AddShoppingCartIcon />} onClick={openMenu}>
        Add Item
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            mt: 0.8,
            borderRadius: 2,
            border: '1px solid #e5e7eb',
            minWidth: 180,
          },
        }}
      >
        <MenuItem onClick={() => goTo('/product')}>
          <Inventory2OutlinedIcon sx={{ mr: 1, fontSize: 18 }} />
          Product
        </MenuItem>
        <MenuItem onClick={() => goTo('/clothes')}>
          <CheckroomOutlinedIcon sx={{ mr: 1, fontSize: 18 }} />
          Clothes
        </MenuItem>
        <MenuItem onClick={() => goTo('/equipment')}>
          <FitnessCenterOutlinedIcon sx={{ mr: 1, fontSize: 18 }} />
          Equipment
        </MenuItem>
      </Menu>
    </>
  );
};

export default AddItemMenuButton;

