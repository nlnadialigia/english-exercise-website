import { User } from "@prisma/client";

export interface UserWithRelations extends User {
  teacher?: User;
  students?: User[];
  _count?: {
    exercises?: number;
    submissions?: number;
    students?: number;
  };
}

export interface StudentFormData {
  email: string;
  fullName: string;
  level: string;
  isGeneral: boolean;
}

export interface TeacherFormData {
  email: string;
  fullName: string;
  password?: string;
}

export interface UserFormData {
  email: string;
  fullName: string;
  role: "admin" | "teacher" | "student";
  level?: string;
  isGeneral?: boolean;
  teacherId?: string;
  password?: string;
}
