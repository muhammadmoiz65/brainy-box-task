import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AppBar sx={{ width: '100vw' }}>
      <Toolbar disableGutters>
        <Box ml={5} mr={5} sx={{width:'90vw',display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <Box>
          <Typography
            variant="h6"
            noWrap
            sx={{
              flexGrow: 1,
              display: { xs: 'flex', md: 'flex' },
              fontWeight: 700,
              letterSpacing: '.1rem',
              textDecoration: 'none',
            }}
          >
            Task Manager
          </Typography>
          </Box>
          <Box>
          <Button
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ mx: 1 }}
          >
            Dashboard
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
          </Box>
          </Box>
        </Toolbar>
        
    </AppBar>
  );
};

export default Navbar;
