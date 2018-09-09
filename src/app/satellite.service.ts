
import { Injectable } from '@angular/core';
import { Satellite } from './satellite.model';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs';

@Injectable()
export class SatelliteService {
  satellites: AngularFireList<any[]>;

  constructor(private db: AngularFireDatabase) {
    this.satellites = db.list('satellites');
    // console.log(this.satellites);
  }

  getSatellites() {
    return this.satellites.valueChanges();
  }

}
