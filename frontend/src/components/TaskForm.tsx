import { useState } from 'react';
import { TextField, Button, MenuItem, Box, Modal, Typography } from '@mui/material';
import api from '../services/api';
import { ENDPOINTS } from '../constants/endpoints';
import { toast } from 'react-toastify';

const TaskForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Pending',
    deadline: '',
    assigned_user: '',
  });
  const [open, setOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post(ENDPOINTS.TASKS, formData);
      console.log('Task created successfully:', response.data);

      toast.success('Task created successfully!');
      setFormData({
        title: '',
        description: '',
        status: 'Pending',
        deadline: '',
        assigned_user: '',
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task.');
    }
  };

  return (
    <Box p={2} mt={10} mb={5} sx={{width:'100vw', display:'flex', justifyContent:'flex-end'}}>
      <Box sx={{width:'90vw'}}>
       <Button variant="contained" onClick={() => setOpen(true)}>
        Add Task
      </Button>
      </Box>
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
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Create Task
          </Button>
        </form>
      </Box>
    </Modal>
    </Box>
  );
};

export default TaskForm;
