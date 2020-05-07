import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { environment as env } from '../../environments/environment'

import { Shop, ListServicesItem } from './shops.model';

interface ShopData {
    id: number,
    shopName: string,
    tel: string,
    mobile: string,
    locLat: number,
    locLng: number,
    welcomeText: string,
    photo: {
        id: number,
        url: string
    },
    openTime: string,
    address: string,
    services: [{
        id: number,
        name: string,
        price: number,
    }],
    comments: [{
        id: number,
        commentText: string,
        score: number
    }]
}

export const QUEUE_BOOKING: number = 1
export const QUEUE_WAITING: number = 2

@Injectable({
    providedIn: 'root'
})
export class ShopService {
    private _shops = new BehaviorSubject<Shop[]>([]);

    get shops() {
        return this._shops.asObservable();
    }

    constructor(private http: HttpClient) { }

    fetchShops() {
        const url = `${env.endPointAPIURL}/shops`
        return this.http.get<[ShopData]>(url)
            .pipe(
                map(resData => {
                    const shops = [];
                    // console.log('-- res data --')
                    // console.log(resData)
                    if (resData && resData.length > 0) {
                        resData.forEach(d => {
                            shops.push(new Shop(d.id,
                                d.shopName,
                                d.tel,
                                d.mobile,
                                d.locLat,
                                d.locLng,
                                d.welcomeText,
                                `${env.endPointAPIURL}${d.photo.url}`,
                                d.openTime,
                                d.address,
                                d.services.sort((a, b) => {
                                    return a.id - b.id;
                                }),
                                d.comments))
                        });
                    }
                    console.log(shops)
                    return shops;
                }),
                tap(shops => {
                    this._shops.next(shops)
                })
            )
    }

    getShop(id: string) {
        return this.shops.pipe(
            take(1),
            map(listShops => {
                return { ...listShops.find(sh => sh.id === parseInt(id)) };
            })
        );
    }

    bookQueue(shopID: number, userID: number, listSelectedServices: [ListServicesItem], token: string) {
        const url = `${env.endPointAPIURL}/queues`
        const listServices = []
        let totalPrice = 0
        if (listSelectedServices) {
            listSelectedServices.map(item => {
                if (item.isChecked) {
                    listServices.push(item.id)
                    totalPrice += item.price
                }
            })
        }

        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
        let options = { headers: headers };

        return this.http.post<any>(url, {
            "bookingDate": new Date().toJSON(),
            "totalPrice": totalPrice,
            "userID": userID,
            "barberShopID": shopID,
            "queueStatusID": 1,
            "serviceIDs": listServices
        }, options)
            .pipe(map(res => {
                // console.log('booking...')
                // console.log(res)
                return res
            }))
    }

    getUserQueue(userID: number, token: string) {
        const url = `${env.endPointAPIURL}/queues?userID=${userID}&_sort=bookingDate:DESC`
        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
        let options = { headers: headers };
        return this.http.get<any>(url, options)
            .pipe(map(res => {
                console.log('get-user-queue')
                res.map(item => {
                    const qID = item.id
                    const qStatus = item.queueStatusID.id
                    const shopID = item.barberShopID.id
                    if (qStatus == 1 || qStatus == 2) {
                        this.getUserQueueNumberOfShop(qID, QUEUE_BOOKING, shopID, token).subscribe(res => {
                            item.countBookingOrder = res
                        }); // status = 1 จองไว้ แต่ทางร้านยังไม่รับเข้าคิว

                        this.getUserQueueNumberOfShop(qID, QUEUE_WAITING, shopID, token).subscribe(res => {
                            item.countWaitingOrder = res
                        }); // status = 2 เข้าคิวอยู่
                    }
                })
                console.log(res)
                return res
            }))
    }

    getUserQueueNumberOfShop(queueID: number, targetStatus: number, shopID: number, token: string) {
        const url = `${env.endPointAPIURL}/queues?barberShopID=${shopID}&queueStatusID=${targetStatus}&_sort=bookingDate:ASC`
        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
        let options = { headers: headers };
        return this.http.get<any>(url, options)
            .pipe(map(res => {
                console.log('get-queue-order')
                let queueOrder = 0
                let incressOrder = 1
                res.forEach(item => {
                    if (item.id == queueID) {
                        queueOrder = incressOrder
                        return;
                    }

                    incressOrder++;
                })
                return {
                    count: res.length,      // จำนวนทั้งหมด
                    atOrder: queueOrder       // อยู่ลำดับที่
                }
            }))
    }

    getShopQueue(shopID: number, targetStatus: number) {
        const url = `${env.endPointAPIURL}/queues?barberShopID=${shopID}&queueStatusID=${targetStatus}&_sort=bookingDate:ASC`
        return this.http.get<any>(url)
            .pipe(map(res => {
                return {
                    count: res.length,
                    data: res
                }
            }))
    }

    cancelQueue(queueID: number, token: string) {
        const url = `${env.endPointAPIURL}/queues/${queueID}`
        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
        let options = { headers: headers };
        return this.http.put<any>(url, { "queueStatusID": 12 }, options)
            .pipe(map(res => {
                return res
            }))
    }

    addComment(comment: string, userID: number, shopID: number, token: string) {
        const url = `${env.endPointAPIURL}/comments`
        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
        let options = { headers: headers };
        return this.http.post<any>(url, {
            "barberShopID": shopID,
            "userID": userID,
            "commentText": comment
        }
            , options)
            .pipe(map(res => {
                return res
            }))
    }

}