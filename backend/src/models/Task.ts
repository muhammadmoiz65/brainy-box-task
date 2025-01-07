import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db'; // Adjust path to your DB configuration

// Define the attributes for the Task model
interface TaskAttributes {
  id: number;
  title: string;
  description?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  deadline?: string;
  assigned_user?: number;
  attachment_url?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the optional attributes for creating a new Task
interface TaskCreationAttributes extends Optional<TaskAttributes, 'id' | 'description' | 'deadline' | 'assigned_user' | 'attachment_url'> {}

// Define the Task class
class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  public id!: number;
  public title!: string;
  public description?: string;
  public status!: 'Pending' | 'In Progress' | 'Completed';
  public deadline?: string;
  public assigned_user?: number;
  public attachment_url?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the Task model
Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Ensures the title is not an empty string
      },
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
      validate: {
        isDate: true, // Ensures deadline is a valid date
      },
    },
    assigned_user: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: true, // Ensures assigned_user is an integer
      },
    },
    attachment_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Task',
    tableName: 'Tasks', // Ensures the table name is uppercase
    timestamps: true, // Enables createdAt and updatedAt
    freezeTableName: true, // Prevents Sequelize from pluralizing table names
    underscored: true, // Optional: use snake_case column names
  }
);

export default Task;
