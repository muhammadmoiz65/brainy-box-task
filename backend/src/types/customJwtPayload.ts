import { JwtPayload } from 'jsonwebtoken';

export interface CustomJwtPayload extends JwtPayload {
  role: string;
}
