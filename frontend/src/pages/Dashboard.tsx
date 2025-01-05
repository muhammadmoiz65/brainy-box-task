import Navbar from '../components/Navbar';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import { useState } from 'react';

const Dashboard = () => {
  const [refresh, setRefresh] = useState(false);

  const handleTaskCreated = () => {
    setRefresh(!refresh);
  };

  return (
    <>
      <Navbar />
      <TaskForm onTaskCreated={handleTaskCreated} />
      <TaskList />
    </>
  );
};

export default Dashboard;
