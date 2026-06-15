import { ProductFormComponent } from './product-form/product-form';
import { ProductListComponent } from './product-list/product-list';
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'products', component: ProductListComponent },
  { path: 'products/add', component: ProductFormComponent },      
  { path: 'products/edit/:id', component: ProductFormComponent }  
];