import { useState } from 'react';
import { TextField, Button, MenuItem } from '@mui/material';
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
      <Button type="submit" variant="contained" color="primary" fullWidth>
        Create Task
      </Button>
    </form>
  );
};

export default TaskForm;
