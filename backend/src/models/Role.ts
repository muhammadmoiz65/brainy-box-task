// Role.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

class Role extends Model {
  public id!: number;
  public name!: string;
}

Role.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  { sequelize, modelName: 'Role' }
);

export default Role;
