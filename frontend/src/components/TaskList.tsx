import { useEffect, useState } from 'react';
import { Grid, List, ListItem, ListItemText, Button, Select, MenuItem, Typography, Box, Container, Card, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import api from '../services/api';
import { io } from 'socket.io-client';
import { ENDPOINTS } from '../constants/endpoints';
import { toast } from 'react-toastify';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { MdDelete, MdDownload, MdExpandMore } from "react-icons/md";

const TaskList = ({ refresh }: { refresh: boolean }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const socket = io(import.meta.env.VITE_SOCKET_URL);
  const statuses = ['Pending', 'In Progress', 'Completed'];
  const [expanded, setExpanded] = useState(false);  // Manage expanded state


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
        console.log(tasksRes.data);
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

  const handleToggleExpand = () => {
    setExpanded(!expanded);  // Toggle expand/collapse
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
  const downloadAttachment = async (attachmentUrl: string) => {
    if (!attachmentUrl) {
      console.error('Attachment URL is not available');
      return;
    }
  
    const fullUrl = `${ENDPOINTS.UPLOAD}/${attachmentUrl}`;
  
    try {
      const response = await fetch(fullUrl);
  
      if (!response.ok) {
        throw new Error('Failed to fetch the file.');
      }
  
      const blob = await response.blob(); // Convert the response to a Blob
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob); // Create a Blob URL
      link.download = attachmentUrl; // Set the desired file name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading the attachment:', error);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Completed':
        return '#4caf50'; // Green for completed
      case 'In Progress':
        return '#ff9800'; // Orange for in progress
      case 'Pending':
        return '#f44336'; // Red for pending
      default:
        return '#9e9e9e'; // Grey for unknown status
    }
  };
  
  
  

  return (
    <Container sx={{width:'100vw'}}>
    
    <Grid container spacing={1} sx={{ display:'flex', justifyContent:'center'}}>
    {groupedTasks.map((group) => (
      <Box m={1} sx={{width:'30%', height:'80vh', display:'flex', justifyContent:'center', flexDirection:'column', borderRadius: '5px',boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px'}}>
        <Box sx={{
            position: 'absolute',
            top: '15vh',     
            textAlign: 'center', 
            marginTop:'2rem',
            width:'30%',
            
                  
          }}>
         <Typography
            variant="h6"
            sx={{
              width: '30%',
              textAlign: 'center', 
              fontWeight: 'bold',  
              fontSize: '1.25rem', 
              marginLeft: '6.5rem',
            
            }}
          >
           {group.status}
        </Typography>
        </Box>
       
      <Grid item key={group.status}>
        <List  sx={{width:'100%',}} >
          {group.tasks.map((task) => (
          <Card sx={{ m: 1, width: '320px' }}>
          {/* Accordion for Expandable Card */}
          <Accordion sx={{ border: '1px solid #ddd', borderRadius: '8px' }}>
          <AccordionSummary
              expandIcon={<MdExpandMore />} // Icon to indicate expandable content
              aria-controls={`panel-${task.id}-content`}
              id={`panel-${task.id}-header`}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderLeft: `6px solid ${getStatusColor(task.status)}`, // Add thick colored border
                paddingLeft: 2, // Add some padding to separate content from the border
              }}
            >
              {/* Task title displayed in the accordion header */}
              <Typography variant="h6" component="div">
                {task.title}
              </Typography>
              
            </AccordionSummary>
    
            <AccordionDetails>
              {/* Expandable content inside AccordionDetails */}
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
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Button
                    variant="contained"
                    color="error"
                    sx={{ width: '50px', height: '50px', borderRadius: '50%', padding: 0, minWidth: 0, margin: '5px' }}
                    onClick={() => handleDelete(task.id)}
                  >
                    <MdDelete />
                  </Button>
                  {task.attachment_url && (
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ width: '50px', height: '50px', borderRadius: '50%', padding: 0, minWidth: 0, margin: '5px' }}
                      onClick={() => downloadAttachment(task.attachment_url)}
                    >
                      <MdDownload />
                    </Button>
                  )}
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
            </AccordionDetails>
          </Accordion>
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
