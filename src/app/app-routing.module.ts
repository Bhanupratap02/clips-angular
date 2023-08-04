import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ClipComponent } from './clip/clip.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ClipService } from './services/clip.service';
const routes: Routes = [
  {
    path:'',
    component:HomeComponent
  }
  ,
   {
    path:'about',
    component:AboutComponent
   },{
    path:'clip/:id',
    component:ClipComponent,
    resolve:{
      clip:ClipService
    }
   },
   // Lazy Loading Modules
   {
    // implemtation of lazy loading of video module ie when app initialize first appmodule will load but video module will load later bacause all user may not want  manage and upload page
    path:'',
    loadChildren:async () =>( await import('./video/video.module')).VideoModule,
   },
   {
    path:'**',
    component:NotFoundComponent
   }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
