import Navbar from '../components/Navbar';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
const Dashboard = () => {

  return (
    <>
      <Navbar />
      <TaskForm/> {/* Pass onSubmit prop */}
      <TaskList /> {/* Refresh task list */}
    </>
  );
};

export default Dashboard;
