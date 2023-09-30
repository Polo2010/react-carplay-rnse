import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PhoneIcon from '@mui/icons-material/Phone';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import { Link, useLocation } from "react-router-dom";

export default function Nav({ receivingVideo }) {
  const [value, setValue] = React.useState(0);
  const { pathname } = useLocation()

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Tabs value={value} onChange={handleChange} aria-label="icon label tabs example" centered sx={receivingVideo === true && pathname === '/' ? {minHeight: '0px', height: '0px'} : {}}>
      <Tab icon={<PhoneIcon />} to={'/'} component={Link}/>
      <Tab icon={<SettingsIcon />} to={'/settings'}  component={Link}/>
      <Tab icon={<InfoIcon />} to={'/info'} component={Link}/>
    </Tabs>
  );
}