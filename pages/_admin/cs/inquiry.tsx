import React, { useCallback, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, InputAdornment, Stack } from '@mui/material';
import { List, ListItem } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import OutlinedInput from '@mui/material/OutlinedInput';
import TablePagination from '@mui/material/TablePagination';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { InquiryList } from '../../../libs/components/admin/cs/InquiryList';

const InquiryArticles: NextPage = (props: any) => {
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [value, setValue] = useState('ALL');
	const [searchCategory, setSearchCategory] = useState('ALL');
	const [searchInput, setSearchInput] = useState('');

	/** APOLLO REQUESTS **/
	/** LIFECYCLE **/
	/** HANDLERS **/
	const tabChangeHandler = (event: any, newValue: string) => setValue(newValue);
	const textHandler = useCallback((val: string) => setSearchInput(val), []);

	return (
		<Box component={'div'} className={'content'}>
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '20px' }}>
				1:1 Inquiry Management
			</Typography>
			<Box component={'div'} className={'table-wrap'}>
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={value}>
						<Box component={'div'}>
							<List className={'tab-menu'}>
								{['ALL', 'ACTIVE', 'BLOCKED', 'DELETED'].map((tab) => (
									<ListItem key={tab} onClick={(e: any) => tabChangeHandler(e, tab)} value={tab}
										className={value === tab ? 'li on' : 'li'}>
										{tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()} (0)
									</ListItem>
								))}
							</List>
							<Divider />
							<Stack className={'search-area'} sx={{ m: '0' }}>
								<Select sx={{ width: '160px', mr: '12px' }} value={searchCategory}
									onChange={(e) => setSearchCategory(e.target.value)}>
									<MenuItem value={'ALL'}>All</MenuItem>
									<MenuItem value={'mb_nick'}>Nickname</MenuItem>
									<MenuItem value={'mb_id'}>ID</MenuItem>
								</Select>
								<OutlinedInput value={searchInput} onChange={(e) => textHandler(e.target.value)}
									sx={{ width: '100%' }} placeholder="Search inquiry"
									onKeyDown={(event) => { if (event.key === 'Enter') { /* searchHandler */ } }}
									endAdornment={<>
										{searchInput && <CancelRoundedIcon style={{ cursor: 'pointer' }} onClick={() => setSearchInput('')} />}
										<InputAdornment position="end" onClick={() => {}}>
											<img src="/img/icons/search_icon.png" alt={'searchIcon'} style={{ cursor: 'pointer' }} />
										</InputAdornment>
									</>}
								/>
							</Stack>
							<Divider />
						</Box>
						<InquiryList anchorEl={anchorEl} />
						<TablePagination rowsPerPageOptions={[20, 40, 60]} component="div"
							count={4} rowsPerPage={10} page={0}
							onPageChange={() => {}} onRowsPerPageChange={() => {}}
						/>
					</TabContext>
				</Box>
			</Box>
		</Box>
	);
};

export default withAdminLayout(InquiryArticles);