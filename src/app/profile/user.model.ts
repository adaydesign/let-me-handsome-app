export class User {
    constructor(
        public id: number,
        public username: string,
        public email: string,
        public fullName: string,
        public userType: string,
        public profilePicture: string,
        public profilePictureURL: string,
        private _token: string,
    ) { }

    get token() {
        return this._token;
    }
}