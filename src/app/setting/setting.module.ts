import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettingPageRoutingModule } from './setting-routing.module';

import { SettingPage } from './setting.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SettingPageRoutingModule,
    ExploreContainerComponentModule
  ],
  declarations: [SettingPage]
})
export class SettingPageModule { }
