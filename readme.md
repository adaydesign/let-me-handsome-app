# Let Me Handsome mobile app

## 1. Install

### 1.1 Ionic cli

```
$ npm uninstall -g ionic
$ npm install -g @ionic/cli
```

### 1.2 Angular cli

```
$ npm install -g @angular/cli
```

### 1.3 npm install other package

```
$ npm install
```

## 2. Change API URL configuration

1) go to folder /let-me-handsome/src/environments
2) open file environments.ts
3) change value of endPointAPIURL variable to correct API URL, example
4) change value of endPointAPIURL variable in environments.prod.ts too

```
endPointAPIURL: 'https://6ead9f68.ngrok.io'
```

## 3. Start App

```
$ cd let-me-handsome
$ ionic serve
```
