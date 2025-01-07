import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { MdDashboard, MdPerson, MdLogout } from 'react-icons/md'; 
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
    {/* Icon to open the Drawer */}
    <IconButton
     color='primary'
      aria-label="open drawer"
      onClick={() => setOpen(true)}
      edge="start"
      sx={{ ml: 2, mt: 2,}}
    >
      <MenuIcon style={{fontSize:'2rem'}}/>
    </IconButton>

    {/* Sidebar Drawer */}
    <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
      <Box
        sx={{
          width: 250,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        

        }}
        role="presentation"
        onClick={() => setOpen(false)}
        onKeyDown={() => setOpen(false)}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Task Manager
          </Typography>
        </Toolbar>

        {/* Sidebar Links */}
        <List>
          <ListItem button onClick={() => navigate('/dashboard')}>
            <ListItemIcon>
              <MdDashboard size={24} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>

          <ListItem button onClick={() => navigate('/users')}>
            <ListItemIcon>
              <MdPerson size={24} />
            </ListItemIcon>
            <ListItemText primary="Users" />
          </ListItem>

          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <MdLogout size={24} />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  </Box>
  );
};

export default Navbar;
