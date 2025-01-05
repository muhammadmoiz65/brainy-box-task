import { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Button, Select, MenuItem, Typography, Box } from '@mui/material';
import api from '../services/api';
import { io } from 'socket.io-client';
import { ENDPOINTS } from '../constants/endpoints';
import { toast } from 'react-toastify';
import { formatDistanceToNow, parseISO } from 'date-fns';

const TaskList = ({ refresh }: { refresh: boolean }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const socket = io(import.meta.env.VITE_SOCKET_URL);

  useEffect(() => {
    const fetchTasksAndUsers = async () => {
      try {
        const [tasksRes, usersRes] = await Promise.all([
          api.get(ENDPOINTS.TASKS),
          api.get(ENDPOINTS.USERS),
        ]);

        setTasks(tasksRes.data);
        setUsers(usersRes.data);
      } catch (error) {
        console.error('Error fetching tasks or users:', error);
      }
    };

    fetchTasksAndUsers();

    socket.on('taskCreated', (newTask) => {
      setTasks((prev) => [...prev, newTask]);
    });

    socket.on('taskUpdated', (updatedTask) => {
      setTasks((prev) =>
        prev.map((task) => (task.id == updatedTask.id ? updatedTask : task))
      );
    });

    socket.on('taskDeleted', ({ id }: { id: number }) => {
      setTasks((prev) => prev.filter((task) => task.id != id));
    });

    return () => {
      socket.off('taskCreated');
      socket.off('taskUpdated');
      socket.off('taskDeleted');
    };
  }, [refresh]);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`${ENDPOINTS.TASKS}/${id}`);
      setTasks((prev) => prev.filter((task) => task.id != id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };


  const handleError = (error: any, defaultMessage: string) => {
    if (error.status == '403') {
      toast.error("Access Denied, you dont have permission to perform this action");
    } else {
      toast.error(defaultMessage); 
    }
    console.error(error);
  };
  
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      setTasks((prev) =>
        prev.map((task) => (task.id == id ? { ...task, status: newStatus } : task))
      );
      await api.put(`${ENDPOINTS.TASKS}/${id}`, { status: newStatus });
    } catch (error) {
      handleError(error, 'Error');
    }
  };

  const handleUserChange = async (id: number, newUserId: number) => {
    try {
      setTasks((prev) =>
        prev.map((task) => (task.id == id ? { ...task, assigned_user: newUserId } : task))
      );
      await api.put(`${ENDPOINTS.TASKS}/${id}`, { assigned_user: newUserId });

    } catch (error) {
      handleError(error, 'Error');
    }
  };

  return (
    <List>
      {tasks.map((task) => (
        <ListItem
          key={task.id}
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2, p: 2, border: '1px solid #ddd', borderRadius: '8px' }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <ListItemText
              primary={
                <Typography variant="h6" component="div">
                  {task.title}
                </Typography>
              }
              secondary={task.description}
            />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Select
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                sx={{ minWidth: 120, marginRight: 2 }}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
              <Button variant="contained" color="error" onClick={() => handleDelete(task.id)}>
                Delete
              </Button>
            </Box>
          </Box>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            <strong>Assigned User:</strong> {task.assigned_user || 'Unassigned'}
          </Typography>
          <Select
            value={task.assigned_user || ''}
            onChange={(e) => handleUserChange(task.id, Number(e.target.value))}
            sx={{ minWidth: 150, mt: 1 }}
          >
            <MenuItem value="">Unassigned</MenuItem>
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          <strong>Deadline:</strong> {formatDistanceToNow(parseISO(task.deadline), { addSuffix: true })}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              <strong>Last Updated:</strong> {formatDistanceToNow(parseISO(task.updatedAt), { addSuffix: true })}
            </Typography>
        </ListItem>
      ))}
    </List>
  );
};

export default TaskList;
