export interface Applicant {
  id: number;
  job_id: string;
  job_title: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  message: string;
  cv_path: string;
  is_favorite: boolean;
  created_at: string;
}
