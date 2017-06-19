
import { Injectable } from '@angular/core';
import { Satellite } from './satellite.model';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

@Injectable()

export class SatelliteService {
  satellites: FirebaseListObservable<any[]>;

  constructor(private database: AngularFireDatabase) {
    this.satellites = database.list('satellite');
  }

  getSatellites() {
    return this.satellites;
  }

  getSatelliteById(satelliteId: string){
    return this.database.object('/satellites/' + satelliteId);
  }

  // addSatellite(newSatellite: Satellite) {
  //   this.satellites.push(newSatellite);
  // }

  // updateSatellite(localUpdatedSatellite){
  //   let satelliteEntryInFirebase = this.getSatelliteById(localUpdatedSatellite.$key);
  //   satelliteEntryInFirebase.update({name: localUpdatedSatellite.name,
  //                             role: localUpdatedSatellite.role,
  //                             tech: localUpdatedSatellite.tech,
  //                             years: localUpdatedSatellite.years,
  //                             bio: localUpdatedSatellite.bio});
  // }

  // deleteSatellite(localSatelliteToDelete){
  //   let satelliteEntryInFirebase = this.getSatelliteById(localSatelliteToDelete.$key);
  //   satelliteEntryInFirebase.remove();
  // }

}










// import { Injectable } from '@angular/core';
//
// @Injectable()
// export class SatelliteService {
//
//   constructor() { }
//
// }
