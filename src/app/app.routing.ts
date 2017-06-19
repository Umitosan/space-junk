
import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { D3mainComponent } from './d3main/d3main.component';


const appRoutes: Routes = [
  {
    path: '',
    component: D3mainComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
