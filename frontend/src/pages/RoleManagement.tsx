import { useState, useEffect } from 'react';
import { TextField, Button, Checkbox, Box, Typography, MenuItem, Grid, List, ListItem, ListItemText } from '@mui/material';
import api from '../services/api';
import { ENDPOINTS } from '../constants/endpoints';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [resources, setResources] = useState(['/tasks']);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedRole1, setSelectedRole1] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [permissions, setPermissions] = useState({});
  const [newRole, setNewRole] = useState('');

  // Fetch roles and users
  const fetchRolesAndUsers = async () => {
    try {
      const [rolesResponse, usersResponse] = await Promise.all([
        api.get(ENDPOINTS.ROLES),
        api.get(ENDPOINTS.USERS),
      ]);
      setRoles(rolesResponse.data);
      setUsers(usersResponse.data);
    } catch (error) {
      console.error('Error fetching roles or users:', error);
    }
  };
  useEffect(() => {
    fetchRolesAndUsers();
  }, []);

  // Handle permission change
  const handlePermissionChange = (resource, method) => {
    setPermissions((prev) => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [method]: !prev[resource]?.[method],
      },
    }));
  };

  // Handle adding a new role
  const handleAddRole = async () => {
    try {
      await api.post(ENDPOINTS.ROLES, { name: newRole });
      setNewRole('');
      await fetchRolesAndUsers();
    } catch (error) {
      console.error('Error adding role:', error);
    }
  };

  // Handle assigning role to a user
  const handleAssignRole = async () => {
    try {
      const filteredRole = roles.filter((role) => {return role.name === selectedRole});

      if (filteredRole.length > 0) {
        const roleId = filteredRole[0].id;
        await api.put(`${ENDPOINTS.USERS}/role`, { roleId: roleId, userId :selectedUser });

        setSelectedUser('');
        setSelectedRole('');
        toast.success('Successfully assigned role to user');
      }
    } catch (error) {
      console.error('Error assigning role to user:', error);
    }
  };

  // Handle permission submission
  const handleSubmitPermissions = async () => {
    try {
      const filteredRole = roles.filter((role) => {return role.name === selectedRole1});

      if (filteredRole.length > 0) {
        const roleId = filteredRole[0].id;
        await api.post(ENDPOINTS.PERMISSIONS, { roleId: roleId, permissions });
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
    }
  };

  return (
    <>
      <Navbar />
      <Box p={2}>
        <br />
        <br />
        <br />
        <Typography variant="h4">Role Management</Typography>

        {/* Add New Role */}
        <Box mt={3}>
          <Typography variant="h6">Add New Role</Typography>
          <TextField
            label="New Role"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" onClick={handleAddRole}>
            Add Role
          </Button>
        </Box>

        {/* Select Role and Assign to User */}
        <Box mt={3}>
          <Typography variant="h6">Assign Role to User</Typography>
          <TextField
            select
            label="Select User"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            fullWidth
            margin="normal"
          >
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name} ({user.email})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Select Role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            fullWidth
            margin="normal"
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.name}>
                {role.name}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" onClick={handleAssignRole}>
            Assign Role
          </Button>
        </Box>

        {/* Set Permissions */}
        <Box mt={3}>
          <Typography variant="h6">Set Permissions for Role</Typography>
          <TextField
            select
            label="Select Role"
            value={selectedRole1}
            onChange={(e) => setSelectedRole1(e.target.value)}
            fullWidth
            margin="normal"
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.name}>
                {role.name}
              </MenuItem>
            ))}
          </TextField>
          <Box mt={3}>
            {resources.map((resource) => (
              <Box key={resource} mb={2}>
                <Typography variant="h6">{resource}</Typography>
                {['FETCH', 'UPDATE', 'INSERT', 'DELETE'].map((method) => (
                  <label key={method}>
                    <Checkbox
                      checked={permissions[resource]?.[method] || false}
                      onChange={() => handlePermissionChange(resource, method)}
                    />
                    {method}
                  </label>
                ))}
              </Box>
            ))}
          </Box>
          <Button variant="contained" onClick={handleSubmitPermissions}>
            Save Permissions
          </Button>
        </Box>

        {/* List Users and Roles */}
        <Grid container spacing={2} mt={5}>
          <Grid item xs={6}>
            <Typography variant="h6">Users</Typography>
            <List>
              {users.map((user) => (
                <ListItem key={user.id}>
                  <ListItemText primary={`${user.name} (${user.role})`} />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6">Roles</Typography>
            <List>
              {roles.map((role) => (
                <ListItem key={role.id}>
                  <ListItemText primary={role.name} />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default RoleManagement;
