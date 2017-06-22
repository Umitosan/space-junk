import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { D3Service, D3, Selection } from 'd3-ng2-service'; // <-- import the D3 Service, the type alias for the d3 letiable and the Selection interface
import { Satellite } from '../satellite.model';
import { SatelliteService } from '../satellite.service';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { CountryPipe } from '../country.pipe';
import { PurposePipe } from '../purpose.pipe';

@Component({
  selector: 'app-d3main',
  templateUrl: './d3main.component.html',
  styleUrls: ['./d3main.component.css'],
  providers: [SatelliteService, CountryPipe, PurposePipe]
})

export class D3mainComponent implements OnInit {
  private d3: D3; // <-- Define the private member which will hold the d3 reference
  private parentNativeElement: any;
  satellites: any[];
  readyToDisplay: boolean = false;
  masterRad: number = 0;
  countryPipeTransform: any;
  purposePipeTransform: any;
  countrySelected: string = "none";
  purposeSelected: string = "none";

  filterdSatData: Satellite[] = [];
  satData: any[] = [];
  running = true;

  themeStatus: string = "lightsOff";

  constructor(element: ElementRef, d3Service: D3Service, private router: Router,
              private database: AngularFireDatabase, private satelliteService: SatelliteService,
              countryPipe: CountryPipe, purposePipe: PurposePipe
              ) {
        this.d3 = d3Service.getD3(); // <-- obtain the d3 object from the D3 Service
        this.parentNativeElement = element.nativeElement;
        this.countryPipeTransform = countryPipe.transform;
        this.purposePipeTransform = purposePipe.transform;
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
              });
  } // END ngOnInit()

  filterSatData() {
    let countryOpt = this.countrySelected;
    let purposeOpt = this.purposeSelected;
    let satsToBeFiltered: Satellite[] = this.satellites;
    let filteredSats1: Satellite[] = [];
    let filteredSats2: Satellite[] = [];
    // run through filters depending on which changed
    if (countryOpt !== 'none') {
      filteredSats1 = this.countryPipeTransform(satsToBeFiltered, countryOpt);
      filteredSats2 = filteredSats1;
      if (purposeOpt !== 'none') {
        filteredSats2 = this.purposePipeTransform(filteredSats1, purposeOpt);
      }
    } else {
      filteredSats2 = this.purposePipeTransform(satsToBeFiltered, purposeOpt);
    }
    this.filterdSatData = filteredSats2;
  }

  createSatData() {
    let satArr: Satellite[] = this.filterdSatData;
    let myArr: any[] = [];
    let counter = 0;
    for (let i = 0; i < satArr.length ; i++) {
      let randSpeed: number = this.getRandomNum(3,20);

      let calcRad: number = ((satArr[i].LaunchMassKG**(1/3))/3)+1.7;
      let powerApogee: number = (Math.pow(satArr[i].ApogeeKM, 1/2) + 50);
      let randCx: number = this.getRandomNum(1,powerApogee);
      let calcCY: number = Math.pow(( (powerApogee**2) - (randCx**2) ) ,1/2);

      if (counter == 1) { randCx *= -1; }
      else if (counter == 2) { calcCY *= -1; }
      else if (counter == 3) { randCx *= -1; calcCY *= -1;}
      if (counter > 3) { counter = 0; }
      counter++;

      let dateOfLaunch: string = satArr[i].DateOfLaunch;

      let newSat = {  name: satArr[i].Name , owner: satArr[i].CountryOperatorOwner,
                      rad: calcRad, speed: randSpeed,  cx: randCx, cy: calcCY, move: true, date: dateOfLaunch }

      myArr.push(newSat);
    }
    this.satData = myArr;
    // MODEL
    // public Name: string,
    // public CountryOperatorOwner: string,
    // public OperatorOwner: string,
    // public Users: string,
    // public Purpose: string,
    // public ApogeeKM: number,
    // public LaunchMassKG: number,
    // public DateOfLaunch: string,
    // public LaunchSite: string
  } // END createSatData

  getRandomNum(min, max) {
    return Math.random() * (max - min) + min;
  }

  orbitButtonClicked() {
    if (this.readyToDisplay === true) {
      this.filterSatData();
      this.createSatData()
      this.satInit(this.d3);
      this.readyToDisplay = false;
    }
  }

  graphClicked() {
    console.log("anotherOneClicked yup");
    this.scatterPlot(this.satData);
  }

  turnLightsOff() {
    this.themeStatus = "lightsOff";
  }

  turnLightsOn() {
    this.themeStatus = "lightsOn";
  }

  onCountrySelectChange(dropdownOption) {
    this.countrySelected = dropdownOption;
    console.log("country opt: ", this.countrySelected);
    this.readyToDisplay = true;
  }

  onPurposeSelectChange(dropdownOption) {
    this.purposeSelected = dropdownOption;
    console.log("country opt: ", this.purposeSelected);
    this.readyToDisplay = true;
  }

  satInit(myd3) {
    let d3 = myd3;

    // clear all cirlces before creating new ones
    d3.selectAll("circle").remove();

    let satData = this.satData;
    console.log("init data length", satData.length);
    // let newObject = this.newObject;

    let svg = d3.select("svg")
      .call(d3.zoom().on("zoom", function () {
         svg.attr("transform", d3.event.transform)
      }))
      .append("g");



    let div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);



    //for each item in satData create a new satelite circle element
    svg.selectAll()
        .data(satData, function(d, i) { return (i); } )
        .enter().append("circle")
        .attr("class", "satelite");

    let allSatelites = svg.selectAll(".satelite").style("opacity", 0.6);

    // color by country
    allSatelites.style("fill", function(d) {
      if(d.owner === 'USA') {
        return "#33ccff";
      } else if (d.owner === 'Russia') {
        return "#cc0000";
      } else if (d.owner === 'Multinational') {
        return "white";
      } else if (d.owner === 'China') {
        return "#ffff33";
      } else if (d.owner === 'United Kingdom') {
        return "#99ebff";
      } else if (d.owner === 'Japan') {
        return "#ff0000";
      } else if (d.owner === 'ESA') {
        return "#3399ff";
      } else if (d.owner === 'Germany') {
        return "#00cc2c";
      } else if (d.owner === 'India') {
        return "#B27F12";
      } else if (d.owner === 'France') {
        return "#ff33cc";
      } else if (d.owner === 'Canada') {
          return "#BF0031";
      } else if (d.owner === 'Argentina') {
        return "#00E5AA";
      } else if (d.owner === 'Spain') {
        return "#CECD00";
      } else if (d.owner === 'Saudi Arabia') {
        return "#C88200";
      }
    });

    allSatelites.attrs({
      cx: 0,
      cy: 0,
      r:  function (d) { return d.rad; }
    });

    allSatelites.attr("transform", function(d) {
      d3.select(this)
      .transition()
        .delay(0)
        .duration(1000)
        .attr("cx", d.cx)
        .attr("cy", d.cy);
    });

    d3.select("svg").append("circle")
      .attr("class", "earth")
      .attr("cx", 500)
      .attr("cy", 500)
      .attr("r", 35);

    // allSatelites.attr("cx", function(d) { return d.cx; });
    // allSatelites.attr("cy", function(d) { return d.cy; });
    // allSatelites.attr("r", function(d) { return d.rad; });

    let masterRad = 0;

    let running = this.running;



    function updateAnim() {



      svg.selectAll(".satelite").attr("transform", function(d) {
        if (d.move === true) {
          return "translate(500,500), rotate(" + (masterRad * d.speed/100) + ")";
        } else {
          return "translate(500,500)";
        }

      });
      if (masterRad === 10000) { masterRad = 0; }
      if (running === true) {  masterRad += 1; }

    } // END updateAnim

    // show data bubble
    allSatelites.on("mouseover", function(d) {
      d3.select(this)
      .style("stroke", "gold").style("stroke-width", 6);
      running = false;
      div.transition()
          .duration(200)
          .style("opacity", .9);
      div	.html("<strong> Name: </strong>" + d.name + "<br/> <strong> Country: </strong>" + d.owner)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
    })

    allSatelites.on("mouseout", hideData);

    function hideData(){
      d3.select(this).style("stroke", "black").style("stroke-width", 1);
      running = true;
      div.transition()
          .duration(500)
          .style("opacity", 0);
    };

    var masterTimer = d3.timer(updateAnim);
  } // END satInit

  scatterPlot(satData) {
    let d3 = this.d3;
    let svg = d3.select("svg");
    this.running = false;



    let satelites = svg.selectAll(".satelite")
        .data(satData)
        .classed("satelite", false);

    console.log(satelites);

      // .transition()
      // .delay(0)
      // .duration(1000)
      // .attr("cx", function(d) {
      //   return (Date.parse(d.date))/10000000000;
      //   // return 100;
      // })
      // .attr("cy", function(d) {
      //   return 100;
      // })
      // .attr("transform", "rotate(0)");

        // .attr("transform", function(d) {
        //   console.log(d);
        //   d3.select(this);
        // });

    satelites.transition()
        .delay(0)
        .duration(1000)
        .attr("cx", function(d) {
          return (Date.parse("2/5/2016"))/10000000000;
          // return 100;
        })
        .attr("cy", function(d) {

          return 0;
        })
        .attr("transform", function(d) {
            return "rotate(0)";
        });

    // satelites.attr("transform", function(d) {
    //   // d3.select(this)
    //   // .transition()
    //   //   .delay(0)
    //   //   .duration(1000)
    //   //   .attr("cx", d.cx)
    //   //   .attr("cy", d.cy);
    // });
  }

  // scatterPlot() {
  //   let d3 = this.d3;
  //   let svg = d3.select("svg");
  //   this.running = false;
  //   d3.selectAll(".satelite")
  //     .classed("satelite", false);
  //   var satelites = d3.selectAll("circle")
  //
  //   satelites.transition()
  //       .delay(0)
  //       .duration(1000)
  //       .attr("cx", function(d) {
  //
  //         return (Date.parse("2/5/2016"))/10000000000;
  //         // return 100;
  //       })
  //       .attr("cy", function(d) {
  //
  //         return 100;
  //       })
  //       .attr("transform", function(d) {
  //           return "rotate(0)";
  //       });
  //   // satelites.attr("transform", function(d) {
  //   //   // d3.select(this)
  //   //   // .transition()
  //   //   //   .delay(0)
  //   //   //   .duration(1000)
  //   //   //   .attr("cx", d.cx)
  //   //   //   .attr("cy", d.cy);
  //   // });
  // }


} // END D3mainComponent
