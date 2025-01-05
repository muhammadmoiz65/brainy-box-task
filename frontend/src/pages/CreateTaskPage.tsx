import React from 'react';
import TaskForm from '../components/TaskForm';
import api from '../services/api';
import { ENDPOINTS } from '../constants/endpoints';

const CreateTaskPage = () => {
  const handleTaskSubmit = async (taskData: any) => {
    try {
      const res = await api.post(ENDPOINTS.TASKS, taskData);
      console.log('Task created successfully:', res.data);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return <TaskForm onSubmit={handleTaskSubmit} />;
};

export default CreateTaskPage;
