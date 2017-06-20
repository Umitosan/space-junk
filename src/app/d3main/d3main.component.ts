import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { D3Service, D3, Selection } from 'd3-ng2-service'; // <-- import the D3 Service, the type alias for the d3 letiable and the Selection interface
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
  satellites: any[];
  readyToDisplay: boolean = false;
  desiredFilter: string = "none";
  masterRad: number = 0;

  satData: any[] = [];
  newObject = null;
  running = true;


  constructor(element: ElementRef,
              d3Service: D3Service,
              private router: Router,
              private database: AngularFireDatabase,
              private satelliteService: SatelliteService) {
        this.d3 = d3Service.getD3(); // <-- obtain the d3 object from the D3 Service
        this.parentNativeElement = element.nativeElement;
  }

  ngOnInit() {
              let d3 = this.d3; // <-- for convenience use a block scope letiable
              let d3ParentElement: Selection<any, any, any, any>; // <-- Use the Selection interface (very basic here for illustration only)
              if (this.parentNativeElement !== null) {
                d3ParentElement = d3.select(this.parentNativeElement); // <-- use the D3 select method
                // Do more D3 things
              }
              this.satelliteService.getSatellites().subscribe(data => {
                this.satellites = data;
                // this.createSatData(data);
              });
  }

  createSatData(sats) {
    let myArr: any[] = [];
    for (let i = 0; i < sats.length ; i++) {
      let randSpeed: number = this.getRandomNum(3,20);
      let randRad: number = this.getRandomNum(2,20);
      let randCx: number = this.getRandomNum(100,500);
      let newSat = {  name: sats[i].Name , owner: sats[i].OperatorOwner,
                      rad: randRad, speed: randSpeed,  cx: randCx, cy: 0, move: true }
      myArr.push(newSat);
    }
    this.satData = myArr;
    console.log("myArr", myArr);
    // public Name: string,
    // public CountryOperatorOwner: string,
    // public OperatorOwner: string,
    // public Users: string,
    // public Purpose: string,
    // public ApogeeKM: number,
    // public LaunchMassKG: number,
    // public DateOfLaunch: string,
    // public LaunchSite: string
  } // <-- end createSatData

  getRandomNum(min, max) {
    return Math.random() * (max - min) + min;
  }

  funkButtonClicked() {
    this.createSatData(this.satellites)
    this.mainFunk(this.d3, this.satData, this.newObject, this.running);
  }

  anotherOneClicked() {
    console.log("anotherOneClicked yup");
  }

  onChange(dropdownOption) {
    this.desiredFilter = dropdownOption;
    this.readyToDisplay = true;
    console.log("dropdownOption changed to: ", this.desiredFilter);
  }

  mainFunk(d3, sd, newo, run) {
    let satData = sd;
    let newObject = newo;
    let running = run;

    let svg = d3.select("svg");

    let div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    //for each item in satData create a new satelite circle element
    let satelite = svg.selectAll(".start")
        .data(satData, function(d, i) { return (i); } )
        .enter().append("circle")
        .attr("class", "satelite");

    let allSatelites = svg.selectAll(".satelite")
    allSatelites.attr("cx", function(d) { return d.cx; });
    allSatelites.attr("cy", function(d) { return d.cy; });
    allSatelites.attr("r", function(d) { return d.rad; });

    let masterRad = 0;

    function updateAnim() {

      if (newObject != null) {

        let satelite = svg.selectAll(".start")
            .data(satData, function(d, i) { return (i); } )
            .enter().append("circle")
            .attr("class", "satelite");

        let allSatelites = svg.selectAll(".satelite")
        allSatelites.attr("cx", function(d) { return d.cx; });
        allSatelites.attr("cy", function(d) { return d.cy; });
        allSatelites.attr("r", function(d) { return d.rad; });

        newObject = null;
      }

      svg.selectAll(".satelite").attr("transform", function(d) {
        if (d.move === true) {
          return "translate(500,500), rotate(" + (masterRad * d.speed/100) + ")";
        } else {
          return "translate(500,500)";
        }

      });
      if (masterRad === 10000) { masterRad = 0; }
      if (running === true) {  masterRad += 1; }
    }

    d3.timer(updateAnim);

    allSatelites.on("mouseover", function(d) {
      d3.select(this)
      .style("stroke", "black").style("stroke-width", 5);
      running = false;
      console.log(d);
      div.transition()
          .duration(200)
          .style("opacity", .9);
      div	.html(d.name + "<br/>"  + d.owner)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
    })

    allSatelites.on("mouseout", hideData);


    function hideData(){
      d3.select(this).style("stroke", "black").style("stroke-width", 1);
      running = true;
      // for (let i = 0; i<satData.length; i++)	{
      // 	console.log(satData[i]['move']=false);
      // };
      div.transition()
          .duration(500)
          .style("opacity", 0);
    };

  }

  // mainFunk(d3) {
  //
  //   let svg = d3.select("svg");
  //
  //   let satData = [
  //     { rad:  5, speed: 0.9, phi0: 100, cx: 50, cy: 0 },
  //     { rad:  10, speed: 0.6, phi0: 100, cx: 70, cy: 0 },
  //     { rad:  20, speed: 0.3, phi0: 100, cx: 100, cy: 0 }
  //   ];
  //
  //   //for each item in satData create a new satelite circle element
  //   let satelite = svg.selectAll(".start")
  //       .data(satData, function(d, i) { return (i); } )
  //       .attr("class", "satelite");
  //
  //   satelite.enter().append("circle")
  //       .attr("class", "satelite");
  //
  //   let allSatelites = svg.selectAll(".satelite")
  //   allSatelites.attr("cx", function(d) { return d.cx; });
  //   allSatelites.attr("cy", function(d) { return d.cy; });
  //   allSatelites.attr("r", function(d) { return d.rad; });
  //
  //   let masterRad = 0;
  //
  //   function updateAnim() {
  //     svg.selectAll(".satelite").attr("transform", function(d) {
  //       return "translate(500,100), rotate(" + d.phi0 + masterRad * d.speed + ")";
  //     });
  //     if (masterRad === 3600000) {
  //       masterRad = 0;
  //     }
  //     masterRad += 1;
  //     // console.log(masterRad);
  //   }
  //   d3.timer(updateAnim);
  // }

}
