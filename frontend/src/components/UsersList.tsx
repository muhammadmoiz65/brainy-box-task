import React,{useState,useEffect} from 'react'
import api from '../services/api';
import { io } from 'socket.io-client';
import { ENDPOINTS } from '../constants/endpoints';
import { toast } from 'react-toastify';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Box, Modal, Typography, MenuItem } from '@mui/material';
import { MdDelete, MdDownload, MdEdit, MdExpandMore } from "react-icons/md";
import { FaUserPlus } from 'react-icons/fa6';

type Props = {}

const UsersList = (props: Props) => {
    const [users, setUsers] = useState<any[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<any | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [userModalOpen, setUserModalOpen] = useState(false); // State for user modal
    const [userFormData, setUserFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'User',
      });
  
    const socket = io(import.meta.env.VITE_SOCKET_URL);

    useEffect(() => {
        const fetchTasksAndUsers = async () => {
          try {
            const [tasksRes, usersRes] = await Promise.all([
              api.get(ENDPOINTS.TASKS),
              api.get(ENDPOINTS.USERS),
            ]);
            setUsers(usersRes.data);
            console.log(usersRes.data);
          } catch (error) {
            console.error('Error fetching tasks or users:', error);
          }
        };
    
        fetchTasksAndUsers();
    
        socket.on('taskCreated', (newUser) => {
          setUsers((prev) => [...prev, newUser]);
        });
    
        socket.on('userUpdated', (updatedUser) => {
            setUsers((prev) =>
            prev.map((user) => (user.id == updatedUser.id ? updatedUser : user))
          );
        });
    
        socket.on('userDeleted', ({ id }: { id: number }) => {
            setUsers((prev) => prev.filter((user) => user.id != id));
        });
    
        return () => {
          socket.off('userCreated');
          socket.off('userUpdated');
          socket.off('userDeleted');
        };
      }, []);



      const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(userFormData)
        try {
          const response = await api.post(ENDPOINTS.USERS, userFormData);
          console.log('User created successfully:', response.data);
    
          toast.success('User created successfully!');
          setUserFormData({
            name: '',
            email: '',
            password: '',
            role: 'User',
          });
          setUserModalOpen(false); // Close user modal after successful creation
        } catch (error) {
          console.error('Error creating user:', error);
          toast.error('Failed to create user.');
        }
      };
    
      // Edit user
      const handleEditUser = async (e: React.FormEvent,id: number) => {
        e.preventDefault();
       console.log("id",id);
       console.log(currentUser)
        try {
          const response = await api.put(`${ENDPOINTS.USERS}/${id}`, currentUser);
          console.log('User updated successfully:', response.data);
    
          toast.success('User updated successfully!');
          setUserFormData({
            name: '',
            email: '',
            password: '',
            role: 'User',
          });
          setOpen(false); // Close user modal after successful creation
        } catch (error) {
          console.error('Error updated user:', error);
          toast.error('Failed to updated user.');
        }
      };
    
      // Delete user
      const handleDelete = async (id: number) => {
        try {
          await api.delete(`${ENDPOINTS.USERS}/${id}`);
          setUsers((prev) => prev.filter((user) => user.id != id));
          toast.success('User deleted successfully!');
        } catch (error) {
          console.error('Error deleting user:', error);
          toast.error('Failed to delete user.');
        }
      };
    
      // Open dialog for adding or editing user
      const handleDialogOpen = (user?: any) => {
        console.log('User passed to handleDialogOpen:', user);
        if (user && Object.keys(user).length > 0) {
          setCurrentUser(user);
          setIsEditing(true);
        } else {
          setCurrentUser(null);
          setIsEditing(false);
        }
        setOpen(true);
      };
      
    
      // Close the dialog
      const handleDialogClose = () => {
        setOpen(false);
      };
    
      // Handle input change for form fields
      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            [e.target.name]: e.target.value,
          });
        }
      };
    
      // Submit the form for adding or editing a user
    //   const handleSubmit = () => {
    //     if (currentUser) {
    //       if (isEditing) {
    //         editUser(currentUser);
    //       } else {
    //         addUser(currentUser);
    //       }
    //       setOpen(false);
    //       setCurrentUser(null);
    //     }
    //   };
    
  return (
    <Container sx={{width:'100vw'}}>
    <Box mt={-5} mb={5} sx={{ width: '90vw',display: 'flex', justifyContent: 'flex-end', marginRight: '15vw' }}>
       
        <Button variant="contained" onClick={() => setUserModalOpen(true)}
          sx={{ width: '50px', height: '50px', borderRadius: '50%', padding: 0, minWidth: 0, margin:'5px' }}
          >
        <FaUserPlus style={{fontSize:'1.5rem'}} />
        </Button>
      </Box>
   
      <Box sx={{ width: '85vw',display: 'flex', justifyContent: 'center', marginLeft: '5vw' }}>
        <TableContainer component={Paper}>
        <Table sx={{textAlign: 'center'}}>
            <TableHead>
            <TableRow >
                <TableCell sx={{textAlign: 'center', fontWeight: 'bold', }}>Name</TableCell>
                <TableCell sx={{textAlign: 'center', fontWeight: 'bold', }}>Email</TableCell>
                <TableCell sx={{textAlign: 'center', fontWeight: 'bold', }}>Role</TableCell>
                <TableCell sx={{textAlign: 'center', fontWeight: 'bold', }}>Actions</TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {users.map((user) => (
                <TableRow key={user.id}>
                <TableCell sx={{textAlign: 'center'}}>{user.name}</TableCell>
                <TableCell sx={{textAlign: 'center'}}>{user.email}</TableCell>
                <TableCell sx={{textAlign: 'center'}}>{user.role}</TableCell>
                <TableCell sx={{textAlign: 'center'}}>
                    <Button 
                    variant="contained"
                    color="primary"
                    sx={{ width: '50px', height: '50px', borderRadius: '50%', padding: 0, minWidth: 0, margin: '5px' }}
                    onClick={() => handleDialogOpen(user)}>
                    <MdEdit  style={{fontSize:'1.5rem'}}/>
                    </Button>
                    <Button   variant="contained"
                        color="error"
                        sx={{ width: '50px', height: '50px', borderRadius: '50%', padding: 0, minWidth: 0, margin: '5px' }}
                        onClick={() => handleDelete(user.id)}>
                    <MdDelete style={{fontSize:'1.5rem'}}/>
                    </Button>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
        </TableContainer>
      </Box>
    {/* Dialog for Adding or Editing User */}
    <Dialog open={open} onClose={handleDialogClose}>
      <DialogTitle>{isEditing ? 'Edit User' : 'Add User'}</DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          name="name"
          value={currentUser?.name || ''}
          onChange={handleInputChange}
          fullWidth
          sx={{ marginBottom: '10px' }}
        />
        <TextField
          label="Email"
          name="email"
          value={currentUser?.email || ''}
          onChange={handleInputChange}
          fullWidth
          sx={{ marginBottom: '10px' }}
        />
        <TextField
          label="Role"
          name="role"
          value={currentUser?.role || ''}
          onChange={handleInputChange}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Cancel</Button>
        { isEditing && <Button onClick={(e) => handleEditUser(e,currentUser.id)} variant="contained" color="primary">Update</Button> }
       
      </DialogActions>
    </Dialog>

     {/* User Modal */}
     <Modal open={userModalOpen} onClose={() => setUserModalOpen(false)} aria-labelledby="user-modal-title">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography id="user-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
            Create User
          </Typography>
          <form onSubmit={handleUserSubmit}>
            <TextField
              label="Name"
              name="name"
              value={userFormData.name}
              onChange={(e) => setUserFormData({ ...userFormData, [e.target.name]: e.target.value })}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Email"
              name="email"
              value={userFormData.email}
              onChange={(e) => setUserFormData({ ...userFormData, [e.target.name]: e.target.value })}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={userFormData.password}
              onChange={(e) => setUserFormData({ ...userFormData, [e.target.name]: e.target.value })}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              select
              label="Role"
              name="role"
              value={userFormData.role}
              onChange={(e) => setUserFormData({ ...userFormData, [e.target.name]: e.target.value })}
              fullWidth
              margin="normal"
            >
              <MenuItem value="User">User</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </TextField>
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              Create User
            </Button>
          </form>
        </Box>
      </Modal>
  </Container>
  )
}

export default UsersList