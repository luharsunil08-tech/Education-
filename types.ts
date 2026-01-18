
export type ExamType = 'JEE' | 'NEET' | 'SCHOOL' | 'GOVT';
export type Subject = 'Physics' | 'Chemistry' | 'Maths' | 'Biology' | 'GK' | 'Aptitude';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: Subject;
  chapter?: string;
  examType: ExamType;
}

export interface UserProfile {
  name: string;
  targetExam: ExamType;
  streak: number;
  lastVisit: string;
  points: number;
  badges: string[];
}

export interface DailyGK {
  id: string;
  title: string;
  content: string;
  category: 'Current Affairs' | 'Science' | 'Sports' | 'Static GK';
  date: string;
}

export interface StudyTask {
  id: string;
  task: string;
  completed: boolean;
  subject: Subject;
}
