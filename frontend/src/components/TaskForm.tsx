import { useState } from 'react';
import { TextField, Button, MenuItem, Box, Modal, Typography } from '@mui/material';
import api from '../services/api';
import { ENDPOINTS } from '../constants/endpoints';
import { toast } from 'react-toastify';
import { MdAddTask } from 'react-icons/md';
import { FaUserPlus } from 'react-icons/fa6';

const TaskForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Pending',
    deadline: '',
    assigned_user: '',
    attachment: null,
  });
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User',
  });
  const [open, setOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false); // State for user modal

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post(ENDPOINTS.TASKS, {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        deadline: formData.deadline,
        assigned_user: formData.assigned_user,
      });
  
      const createdTask = response.data.task.id;
     
      // Upload the attachment if it exists
      if (formData.attachment) {
        await handleFileUpload(createdTask, formData.attachment);
      }
  
      toast.success('Task created successfully!');
      setFormData({
        title: '',
        description: '',
        status: 'Pending',
        deadline: '',
        assigned_user: '',
        attachment: null,
      });
      setOpen(false); // Close task modal after successful creation
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task.');
    }
  };
  

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleFileUpload = async (taskId: number, file: File) => {
    const formData = new FormData();
    formData.append('attachment', file);
  
    try {
      const response = await api.post(`${ENDPOINTS.TASKS}/${taskId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('File uploaded successfully!');
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file.');
    }
  };
  

  return (
    <Box mt={-5} mb={5} sx={{ width: '100vw', display: 'flex', justifyContent: 'flex-end' }}>
      <Box sx={{ width: '90vw',display: 'flex', justifyContent: 'flex-end', marginRight: '10vw' }}>
        <Button variant="contained" onClick={() => setOpen(true)}
           sx={{ width: '50px', height: '50px', borderRadius: '50%', padding: 0, minWidth: 0, margin:'5px' }}
           >
          <MdAddTask style={{fontSize:'1.5rem'}} />
        </Button>
        <p> </p>
        <Button variant="contained" onClick={() => setUserModalOpen(true)}
          sx={{ width: '50px', height: '50px', borderRadius: '50%', padding: 0, minWidth: 0, margin:'5px' }}
          >
        <FaUserPlus style={{fontSize:'1.5rem'}} />
        </Button>
      </Box>

      {/* Task Modal */}
      <Modal open={open} onClose={() => setOpen(false)} aria-labelledby="task-modal-title" aria-describedby="task-modal-description">
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
          <Typography id="task-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
            Create Task
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              fullWidth
              margin="normal"
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </TextField>
            <TextField
              label="Deadline"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Assigned User"
              name="assigned_user"
              value={formData.assigned_user}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          <TextField
               type="file"
                inputProps={{ accept: 'image/*,application/pdf/txt' }} 
                onChange={(e) => setFormData({ ...formData, attachment: e.target.files?.[0] || null })}
                fullWidth
                 margin="normal"
            />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}
           >
              Create Task
            </Button>
          </form>
        </Box>
      </Modal>

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
    </Box>
  );
};

export default TaskForm;
