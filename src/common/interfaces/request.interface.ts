import { JwtUser } from './jwt-user';

export interface RequestWithUser extends Request {
  user: JwtUser;
}
