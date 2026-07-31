export type TaskStatus = 'INBOX' | 'PLANNED' | 'IN_PROGRESS' | 'WAITING' | 'COMPLETED' | 'ARCHIVED';
export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Label {
  id: string;
  name: string;
  color?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface SubTask {
  id: string;
  parentTaskId: string;
  title: string;
  status: TaskStatus;
}

export interface Reminder {
  id: string;
  taskId: string;
  remindAt: Date;
  isSent: boolean;
}

export interface Attachment {
  id: string;
  taskId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  fullName: string;
  content: string;
  createdAt: Date;
}

export interface Activity {
  id: string;
  taskId: string;
  userId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  userId: string;
  organizationId?: string | null;
  projectId?: string | null;
  goalId?: string | null;
  parentTaskId?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date | null;
  estimatedDuration?: number | null; // in minutes
  actualDuration?: number | null; // in minutes
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  tags?: Tag[];
  labels?: Label[];
  checklist?: ChecklistItem[];
  subtasks?: SubTask[];
  attachments?: Attachment[];
  comments?: Comment[];
  activities?: Activity[];
}
