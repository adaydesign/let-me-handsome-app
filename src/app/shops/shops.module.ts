import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShopsPageRoutingModule } from './shops-routing.module';

import { ShopsPage } from './shops.page';
// import { ShopItemComponent } from './shop-item/shop-item.component'
// import { ShopDetailPage } from './shop-detail/shop-detail.page'
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShopsPageRoutingModule
  ],
  declarations: [ShopsPage]
})
export class ShopsPageModule { }
