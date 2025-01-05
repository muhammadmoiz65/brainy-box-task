import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

class Task extends Model {}

Task.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'In Progress', 'Completed'),
      defaultValue: 'Pending',
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    assigned_user: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Task',
  }
);

export default Task;
