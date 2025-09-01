import { ApiConfig } from './api.config.interface';

const baseUrl = 'https://example.com/jobportal/api';

export const apiUrls = {
  checkActivity: `${baseUrl}/example_api.php`,
  deleteEntity: `${baseUrl}/example_api.php`,
  downloadCv: `${baseUrl}/example_api.php`,
  getUsers: `${baseUrl}/example_api.php`,
  getApplicants: `${baseUrl}/example_api.php`,
  getJobs: `${baseUrl}/example_api.php`,
  login: `${baseUrl}/example_api.php`,
  logout: `${baseUrl}/example_api.php`,
  saveUser: `${baseUrl}/example_api.php`,
  saveJob: `${baseUrl}/example_api.php`,
  sendContactMail: `${baseUrl}/example_api.php`,
  sendJobApplication: `${baseUrl}/example_api.php`,
  toggleEntity: `${baseUrl}/example_api.php`,
};