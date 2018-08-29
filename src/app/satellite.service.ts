
import { Injectable } from '@angular/core';
import { Satellite } from './satellite.model';
// import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs';

@Injectable()
export class SatelliteService {
  // satellites: FirebaseListObservable<any[]>;
  satellites: AngularFireList<any[]>;

  constructor(private db: AngularFireDatabase) {
    this.satellites = db.list('satellites');
    console.log(this.satellites);
  }

  getSatellites() {
    return this.satellites.valueChanges();
  }

}

// old firebase


// import { Injectable } from '@angular/core';
// import { Satellite } from './satellite.model';
// import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
//
// @Injectable()
//
// export class SatelliteService {
//   satellites: FirebaseListObservable<any[]>;
//
//   constructor(private database: AngularFireDatabase) {
//     this.satellites = database.list('satellites');
//   }
//
//   getSatellites() {
//     return this.satellites;
//   }
//
//   // getSatelliteById(someid: string){
//   //   return this.database.object('/satellites/' + someid);
//   // }
//
//
// }
