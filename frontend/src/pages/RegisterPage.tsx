import { useState } from 'react';
import { TextField, Button, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import api from '../services/api';
import { ENDPOINTS } from '../constants/endpoints';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(ENDPOINTS.REGISTER, { name, email, password });
      toast.success('Registration successful! Please login.');
    } catch (error) {
      toast.error('Failed to register. Email might already be in use.');
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <Typography variant="h4">Register</Typography>
      <TextField
        label="Name"
        fullWidth
        margin="normal"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        label="Email"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" variant="contained" color="primary">
        Register
      </Button>
    </form>
  );
};

export default RegisterPage;
