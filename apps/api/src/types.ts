/**
 * Global type augmentations for Express.
 * Fixes Express 5 typing issues with params and adds Clerk user data.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        institution_id: string | null;
        role: string;
        department_id: string | null;
        email?: string;
      };
    }

    // Express 5 types ParamsDictionary values as string | string[].
    // Override to string for simpler usage in route handlers.
    interface ParamsDictionary {
      [key: string]: string;
    }
  }
}

export {};
