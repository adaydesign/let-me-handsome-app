import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContentsPage } from './contents.page';

const routes: Routes = [
  {
    path: '',
    component: ContentsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContentsPageRoutingModule {}
