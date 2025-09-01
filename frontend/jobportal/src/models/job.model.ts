export interface Job {
  id: number;
  is_active: boolean;
  created_at: string;
  lang: 'de' | 'en';
  title: string;
  location: string;
  description: string;
  details: string;
  salary: string;
}