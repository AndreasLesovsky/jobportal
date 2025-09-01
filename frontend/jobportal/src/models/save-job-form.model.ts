export interface JobFormLang {
  title: string;
  location: string;
  description: string;
  details: string;
  salary: string;
}

export interface SaveJobForm {
  id?: number | null; // optional im Editmode
  is_active: boolean;
  de: JobFormLang;
  en: JobFormLang;
}
