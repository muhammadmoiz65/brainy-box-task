
// PermissionSet.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';
import Role from './Role';

class PermissionSet extends Model {
  public id!: number;
  public role_id!: number;
  public resource!: string;
  public permissions!: string[];
}

PermissionSet.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    role_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Role, key: 'id' } },
    resource: { type: DataTypes.STRING, allowNull: false },
    permissions: { type: DataTypes.JSONB, allowNull: false },
  },
  { sequelize, modelName: 'PermissionSet' }
);

PermissionSet.belongsTo(Role, { foreignKey: 'role_id' });

export default PermissionSet;
