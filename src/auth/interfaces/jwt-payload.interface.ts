export interface JwtPayload {
  id: number;
  username: string;
  email?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
