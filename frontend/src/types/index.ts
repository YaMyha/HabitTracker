export interface User {
  id: number;
  email: string;
}

export interface UserCreate {
  email: string;
  password: string;
  telegram_chat_id?: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface Habit {
  id: number;
  title: string;
  description?: string;
  reminder_date?: string;
}

export interface HabitCreate {
  title: string;
  description?: string;
  reminder_date?: string;
}

export interface Record {
  id: number;
  date: string;
  completed: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, telegram_chat_id?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}
