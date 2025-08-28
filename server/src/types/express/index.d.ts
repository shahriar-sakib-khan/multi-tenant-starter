import 'express';

import { IMembership } from '@/models/Membership';
import { IDivisionMembership } from '@/models/DivisionMembership';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
      role: string;
      email?: string;
      username?: string;
    };
    workspace?: {
      workspaceId: string;
      name: string;
    };

    membership?: IMembership;
    divMembership?: IDivisionMembership;
  }
}
