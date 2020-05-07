import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { AuthService, AuthResponseData } from './auth.service'
import { ShopService } from '../shops/shops.service'
import { LoadingController, AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { take, switchMap, map } from 'rxjs/operators';
import { User } from './user.model';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})

export class ProfilePage implements OnInit {
  userData: User;
  isLoading = false;
  isLogin = false;
  displaySignUp = false;
  listQueue: [any] = [null];
  queueFilter: string = "current";

  constructor(
    private authService: AuthService,
    private shopService: ShopService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController) { }

  ngOnInit() {
    console.log('--OnInit')
    this.authService.userIsAuthenticated.subscribe(isAuthen => {
      this.isLogin = isAuthen;
      this.displaySignUp = false;
      if (isAuthen) {
        // user data
        this.authService.userData.subscribe(user => {
          this.userData = user;
        })

        // user queue
        this.displayQueue()
      }
    })
  }

  async ionViewWillEnter() {
    console.log('--ionViewWillEnter')
    this.displayQueue()
  }

  authenticate(identifier: string, password: string) {
    this.isLoading = true;
    this.loadingCtrl
      .create({ keyboardClose: true, message: 'กำลังเข้าสู่ระบบ...' })
      .then(loadingEl => {
        loadingEl.present();
        let authObs: Observable<AuthResponseData>;

        authObs = this.authService.login(identifier, password);

        authObs.subscribe(
          resData => {
            console.log('resData - page.ts')
            console.log(resData);
            this.isLoading = false;
            loadingEl.dismiss();

            this.isLogin = true;
            this.displaySignUp = false;
          },
          errRes => {
            this.isLogin = false;
            this.displaySignUp = false;
            loadingEl.dismiss();
            const code = errRes.error.statusCode;
            let message = 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองอีกครั้ง';
            // console.log(errRes.error)
            if (errRes.error.message) {
              if (errRes.error.message[0]) {
                if (errRes.error.message[0].messages) {
                  let errMsg = errRes.error.message[0].messages[0]
                  message = errMsg.message
                }
              }
            }
            this.showAlert(code, message);
          }
        );
      });
  }

  register(data) {
    this.isLoading = true;
    this.loadingCtrl
      .create({ keyboardClose: true, message: 'กำลังสมัครสมาชิก' })
      .then(loadingEl => {
        loadingEl.present();
        let authObs: Observable<any>;
        console.log(data)
        this.authService.register(data).subscribe(
          resData => {
            console.log('resData - page.ts - register')
            console.log(resData);
            this.isLoading = false;
            loadingEl.dismiss();

            this.showAlert(200, `ทำการสมัครสำเร็จ @${resData.user.username}`);

            this.isLogin = false;
            this.displaySignUp = false;
          },
          errRes => {
            this.isLogin = false;
            this.displaySignUp = true;
            loadingEl.dismiss();
            const code = errRes.error.statusCode;
            let message = 'ไม่สามารถสมัครได้ กรุณาลองอีกครั้ง';
            console.log(errRes.error)
            if (errRes.error.message) {
              if (errRes.error.message[0]) {
                if (errRes.error.message[0].messages) {
                  let errMsg = errRes.error.message[0].messages[0]
                  message = errMsg.message
                }
              }
            }
            this.showAlert(code, message);
          }
        )

      });
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    console.log(form.value)

    const identifier = form.value.identifier;
    const password = form.value.password;
    this.authenticate(identifier, password);
    form.reset();
  }

  onRegisterSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    // console.log(form.value)
    const username: string = form.value.username;
    const email: string = form.value.email;
    const password: string = form.value.password;
    const userType: string = "CUSTOMER";
    const fullName: string = form.value.fullName;
    const data = {
      username: username,
      email: email,
      password: password,
      userType: userType,
      fullName: fullName
    }

    this.register(data)
    form.reset();
  }

  onLogout() {
    this.authService.logout();
  }

  showSignUpCard(show: boolean) {
    // console.log(show)
    this.displaySignUp = show;
  }

  segmentChanged(ev: any) {
    // console.log('Segment changed', ev.detail.value);
    // if(ev.datail.value === "current"){
    // }
    this.queueFilter = ev.detail.value;
  }

  cancelQueue(q: any) {
    if (this.isLogin) {
      // user queue
      this.shopService.cancelQueue(q.id, this.userData.token).subscribe(res => {
        console.log('cancel queue')
        //console.log(res)
        if (res) {
          this.displayQueue()
        }
      })
    }
  }

  private showAlert(code: number, message: string) {
    let header = 'พบข้อผิดพลาด'
    if (code === 400) {
      header = 'ดำเนินการไม่สำเร็จ'
    } else if (code >= 200 && code < 300) {
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

  private displayQueue() {
    if (this.isLogin) {
      // user queue
      this.shopService.getUserQueue(this.userData.id, this.userData.token).subscribe(res => {
        console.log(res)
        if (res) {
          this.listQueue = res
        }
      })
    }
  }

}
