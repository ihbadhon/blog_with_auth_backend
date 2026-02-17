export interface JwtPayload {
  id: number;
  username: string;
  email?: string | null;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
