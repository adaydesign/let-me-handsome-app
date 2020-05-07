export class Shop {
    constructor(
        public id: number,
        public name: string,
        public tel: string,
        public mobile: string,
        public locLat: number,
        public locLng: number,
        public welcomeText: string,
        public photo: string,
        public openTime: string,
        public address: string,
        public services: [ShopServiceLabel],
        public comments: [ShopComment]
    ) { }
}

export class ShopServiceLabel {
    constructor(
        public id: number,
        public name: string,
        public price: number
    ) { }
}

export class ShopComment {
    constructor(
        public id: number,
        public commentText: string,
        public score: number
    ) { }
}

export interface ListServicesItem {
    id: number,
    name: string,
    price: number,
    isChecked: boolean
}