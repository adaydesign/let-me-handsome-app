import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { Shop, ListServicesItem } from '../shops.model';
import { ShopService, QUEUE_BOOKING, QUEUE_WAITING } from '../shops.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/profile/auth.service';
import { User } from 'src/app/profile/user.model';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-shop-detail',
  templateUrl: './shop-detail.page.html',
  styleUrls: ['./shop-detail.page.scss'],
})
export class ShopDetailPage implements OnInit {
  shopDetail: Shop;
  isLoading = false;
  isLogin = false;
  userData: User;
  private shopSub: Subscription;
  listServices: [ListServicesItem] = [null]
  totalServicePrice: number = 0;
  // bookingCount,  status=1
  // waitingCount     status=2
  bookingCount: number = 0;
  waitingCount: number = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private shopService: ShopService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('shopId')) {
        // back
        this.navCtrl.navigateBack('/tabs/shops')
        return;
      }

      this.totalServicePrice = 0;

      this.shopSub = this.shopService.getShop(paramMap.get('shopId')).subscribe(item => {
        this.shopDetail = item
        if (this.listServices) {
          this.listServices.splice(0, this.listServices.length)
          console.log('remove all item in list service : ' + this.listServices.length)
        }

        this.shopDetail.services.forEach(item => {
          this.listServices.push({
            id: item.id,
            name: item.name,
            price: item.price,
            isChecked: false
          })
        })

        // update queue order
        this.updateQueueOrder()
      })

      // authen
      this.authService.userIsAuthenticated.subscribe(isAuthen => {
        this.isLogin = isAuthen;
        if (isAuthen) {
          this.authService.userData.subscribe(user => {
            this.userData = user;
          })
        }
      })

    });

  }

  onCommentSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    console.log(form.value)

    if (this.isLogin) {
      const comment = form.value.comment;
      this.shopService.addComment(comment, this.userData.id, this.shopDetail.id, this.userData.token).subscribe(res => {
        if (res) {
          // this.shopService.getShop(this.shopDetail.id.toString()).subscribe(item => {
          //   this.shopDetail = item
          //   console.log(this.shopDetail)
          //   console.log('>> update comment')
          // });
          this.shopDetail.comments.push(res);

          form.reset();
        }

      },
        errRes => {
          this.showAlert(401, 'เพิ่มความคิดเห็นไม่สำเร็จ');
          console.log(errRes)
        });
    }
  }

  onBookQueue() {
    console.log('booking event');
    if (this.isLogin) {
      // check select service
      let countServices = this.listServices.find(l => l.isChecked)
      if (countServices) {
        this.isLoading = true;
        this.loadingCtrl
          .create({ keyboardClose: true, message: 'รอสักครู่...' })
          .then(loadingEl => {
            loadingEl.present();

            this.shopService.bookQueue(this.shopDetail.id, this.userData.id, this.listServices, this.userData.token).subscribe(res => {
              // console.log('subscribe ... book queue')
              // console.log(res)
              this.isLoading = false;
              loadingEl.dismiss();
              this.showAlert(200, 'จองคิวเรียบร้อย');
              //update order
              this.updateQueueOrder();
              this.router.navigateByUrl('tabs/profile')
            },
              errRes => {
                this.isLoading = false;
                loadingEl.dismiss();
                this.showAlert(400, 'จองคิวไม่สำเร็จ');
                console.log(errRes)
              });
          });
      } else {
        this.showAlert(401, 'กรุณาเลือกบริการอย่างน้อย 1 อย่าง');
      }


    }
  }

  gotoLoginTab() {
    this.router.navigateByUrl('/tabs/profile')
  }

  updateSelectServices() {
    this.totalServicePrice = 0;
    // console.log(this.listServices)
    this.listServices.forEach(item => {
      if (item.isChecked) {
        this.totalServicePrice += item.price
      }
    })
  }

  private showAlert(code: number, message: string) {
    let header = 'ไม่สามารถดำเนินการได้'
    if (code === 400) {
      header = 'พบข้อมูลผิดพลาด'
    } else if (code === 200) {
      header = 'ดำเนินการสำเร็จ'
    }
    this.alertCtrl
      .create({
        header: header,
        message: message,
        buttons: ['ตกลง']
      })
      .then(alertEl => alertEl.present());
  }

  private updateQueueOrder() {
    if (this.shopDetail) {
      this.shopService.getShopQueue(this.shopDetail.id, QUEUE_BOOKING).subscribe(res => {
        console.log('QUEUE_BOOKING')
        console.log(res)
        this.bookingCount = res.count;

      })
      this.shopService.getShopQueue(this.shopDetail.id, QUEUE_WAITING).subscribe(res => {
        console.log('QUEUE_WAITING')
        console.log(res)
        this.waitingCount = res.count;
      })
    }
  }

}
