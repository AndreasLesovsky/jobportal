import { Routes, ExtraOptions } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';

export const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent
  },
  {
    path: 'apply/:jobId',
    loadComponent: () =>
      import('./components/application-form/application-form.component').then(m => m.ApplicationFormComponent),
  },
  {
    path: 'home-three',
    loadComponent: () =>
      import('./pages/home-three/home-three.component').then(m => m.HomeThreeComponent),
  },
  {
    path: 'jobs',
    loadComponent: () =>
      import('./pages/jobs/jobs.component').then(m => m.JobsComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact.component').then(m => m.ContactComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      {
        path: 'create-job/:jobId',
        loadComponent: () =>
          import('./pages/create-job/create-job.component').then(m => m.CreateJobComponent),
      },
      {
        path: 'create-user/:userId',
        loadComponent: () =>
          import('./pages/create-user/create-user.component').then(m => m.CreateUserComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/dashboard-user/dashboard-user.component').then(m => m.DashboardUserComponent)
      },
      {
        path: 'applicants',
        loadComponent: () =>
          import('./pages/dashboard-applicants/dashboard-applicants.component').then(m => m.DashboardApplicantsComponent)
      },
      {
        path: 'jobs',
        loadComponent: () =>
          import('./pages/dashboard-jobs/dashboard-jobs.component').then(m => m.DashboardJobsComponent)
      },
      {
        path: 'create-user',
        loadComponent: () =>
          import('./pages/create-user/create-user.component').then(m => m.CreateUserComponent),
      },
      {
        path: 'create-job',
        loadComponent: () =>
          import('./pages/create-job/create-job.component').then(m => m.CreateJobComponent),
      },
    ]
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
  {
    path: 'under-construction',
    loadComponent: () =>
      import('./pages/under-construction/under-construction.component').then(m => m.UnderConstructionComponent),
  },
  {
    path: '**',
    redirectTo: 'not-found',
  },
];

export const routeConfig: ExtraOptions = {
  scrollPositionRestoration: 'top',
  anchorScrolling: 'enabled',
  // scrollOffset: [0, 5rem] // optional bei fixed Header für Sprungmarken
};
