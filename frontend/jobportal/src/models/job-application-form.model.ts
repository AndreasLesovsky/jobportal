export interface JobApplicationForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  message: string;
  jobId: number;
  recaptcha: string;
  cv: File | null;
}