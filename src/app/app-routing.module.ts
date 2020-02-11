import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/**
 * Components
 */
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { LoginRegisterComponent } from './components/login-register/login-register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { HomeComponent } from './components/home/home.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { ListComponent } from './components/list/list.component';
import { ContactComponent } from './components/contact/contact.component';
import { BackofficeComponent } from './components/admin/backoffice/backoffice.component';
import { UsersTableComponent } from './components/admin/users-table/users-table.component';
import { ListsTableComponent } from './components/admin/lists-table/lists-table.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { LogoutComponent } from './components/logout/logout.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' }, // no route specified (go to home)
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginRegisterComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'register', component: LoginRegisterComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'pricing', component: PricingComponent },
  { path: 'about', component: AboutUsComponent },
  { path: 'newList', component: ListComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'admin', component: BackofficeComponent },
  { path: 'admin/adminUsers', component: UsersTableComponent },
  { path: 'admin/adminLists', component: ListsTableComponent },
  { path: 'showLists', component: ListsTableComponent },
  { path: 'showParticipated', component: ListsTableComponent },
  { path: 'editProfile', component: EditProfileComponent },
  { path: '**', component: NotFoundComponent } // fallback route (not found - 404)
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents: Array<any> = [NavbarComponent, FooterComponent, NotFoundComponent,
  LoginRegisterComponent, ProfileComponent,
  HomeComponent, PricingComponent, AboutUsComponent,
  ListComponent, ContactComponent, BackofficeComponent, UsersTableComponent, ListsTableComponent, EditProfileComponent, LogoutComponent];
