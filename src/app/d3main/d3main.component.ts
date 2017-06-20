import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { D3Service, D3, Selection } from 'd3-ng2-service'; // <-- import the D3 Service, the type alias for the d3 variable and the Selection interface
import { Satellite } from '../satellite.model';
import { SatelliteService } from '../satellite.service';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';

@Component({
  selector: 'app-d3main',
  templateUrl: './d3main.component.html',
  styleUrls: ['./d3main.component.css'],
  providers: [SatelliteService]
})

export class D3mainComponent implements OnInit {
  private d3: D3; // <-- Define the private member which will hold the d3 reference
  private parentNativeElement: any;
  satellites: FirebaseListObservable<any[]>;
  readyToDisplay: boolean = false;
  desiredFilter: string = "none";
  masterRad: number = 0;

  constructor(element: ElementRef, d3Service: D3Service,
              private router: Router,
              private database: AngularFireDatabase,
              private satelliteService: SatelliteService) {
        this.d3 = d3Service.getD3(); // <-- obtain the d3 object from the D3 Service
        this.parentNativeElement = element.nativeElement;
  }

  ngOnInit() {
              let d3 = this.d3; // <-- for convenience use a block scope variable
              let d3ParentElement: Selection<any, any, any, any>; // <-- Use the Selection interface (very basic here for illustration only)
              if (this.parentNativeElement !== null) {
                d3ParentElement = d3.select(this.parentNativeElement); // <-- use the D3 select method
                // Do more D3 things
              }
              this.satellites = this.satelliteService.getSatellites();
  }

  funkButtonClicked() {

    // this.mainFunk(this.d3);
  }

  // stopButtonClicked() {
  //   this.readyToDisplay = false;
  // }

  onChange(dropdownOption) {
    this.desiredFilter = dropdownOption;
    this.readyToDisplay = true;
    console.log("dropdownOption changed to: ", this.desiredFilter);
    // this.readyToDisplay = true;
  }

  mainFunk(d3) {

    let svg = d3.select("svg");

    let satData = [
      { rad:  5, speed: 0.9, phi0: 100, cx: 50, cy: 0 },
      { rad:  10, speed: 0.6, phi0: 100, cx: 70, cy: 0 },
      { rad:  20, speed: 0.3, phi0: 100, cx: 100, cy: 0 }
    ];

    //for each item in satData create a new satelite circle element
    let satelite = svg.selectAll(".start")
        .data(satData, function(d, i) { return (i); } )
        .attr("class", "satelite");

    satelite.enter().append("circle")
        .attr("class", "satelite");

    let allSatelites = svg.selectAll(".satelite")
    allSatelites.attr("cx", function(d) { return d.cx; });
    allSatelites.attr("cy", function(d) { return d.cy; });
    allSatelites.attr("r", function(d) { return d.rad; });

    let masterRad = 0;

    function updateAnim() {
      svg.selectAll(".satelite").attr("transform", function(d) {
        return "translate(500,100), rotate(" + d.phi0 + masterRad * d.speed + ")";
      });
      if (masterRad === 3600000) {
        masterRad = 0;
      }
      masterRad += 1;
      // console.log(masterRad);
    }
    d3.timer(updateAnim);
  }

}
