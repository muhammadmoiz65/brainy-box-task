import { useEffect, useState } from 'react';
import { Grid, List, ListItem, ListItemText, Button, Select, MenuItem, Typography, Box, Container, Card } from '@mui/material';
import api from '../services/api';
import { io } from 'socket.io-client';
import { ENDPOINTS } from '../constants/endpoints';
import { toast } from 'react-toastify';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { MdDelete } from "react-icons/md";

const TaskList = ({ refresh }: { refresh: boolean }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const socket = io(import.meta.env.VITE_SOCKET_URL);
  const statuses = ['Pending', 'In Progress', 'Completed'];

  const groupedTasks = statuses.map((status) => ({
    status,
    tasks: tasks.filter((task) => task.status === status),
  }));

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
    <Container sx={{width:'100vw'}}>
    
    <Grid container spacing={1} sx={{ display:'flex', justifyContent:'center'}}>
    {groupedTasks.map((group) => (
      <Box m={1} sx={{width:'30%', display:'flex', justifyContent:'center', flexDirection:'column', backgroundColor:'#f5f5f5', borderRadius: '5px'}}>
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold'  }}>
          {group.status}
        </Typography>
      <Grid item key={group.status}>
        <List  sx={{width:'100%',}} >
          {group.tasks.map((task) => (
            <Card sx={{m:1, width:'320px'}}>
            <ListItem
              key={task.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                border: '1px solid #ddd',
                borderRadius: '8px',
               
              }}
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
                    {statuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                  <Button variant="contained" color="error" 
                  sx={{width:'50px', height:'50px', borderRadius: '50%', padding: 0, minWidth: 0 }}
                  onClick={() => handleDelete(task.id)}>
                    <MdDelete />
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
            </Card>
          ))}
        </List>
      </Grid>
      </Box>
    ))}
    
    </Grid>
    </Container>
  );
};

export default TaskList;
