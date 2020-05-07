import { Component, OnInit, OnDestroy } from '@angular/core';
// import { IonItemSliding } from '@ionic/angular';
// import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// import { LoadingController } from '@ionic/angular';
import { ShopService } from './shops.service';
import { Shop } from './shops.model'

@Component({
  selector: 'app-shops',
  templateUrl: './shops.page.html',
  styleUrls: ['./shops.page.scss'],
})
export class ShopsPage implements OnInit {
  availableShops: Shop[];
  private shopSub: Subscription;

  constructor(private shopService: ShopService) { }

  ngOnInit() {
    this.shopSub = this.shopService.shops.subscribe(shops => {
      this.availableShops = shops
    })
  }

  async ionViewWillEnter() {
    // loading -> true
    // console.log('loading.... ')
    this.shopService.fetchShops().subscribe(async () => {
      // loading -> false
    })
  }

  ngOnDestroy() {
    if (this.shopSub) {
      this.shopSub.unsubscribe();
    }
  }

  arrayOne(n: number): any[] {
    return Array(n);
  }

}
