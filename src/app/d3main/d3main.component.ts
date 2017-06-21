import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { D3Service, D3, Selection } from 'd3-ng2-service'; // <-- import the D3 Service, the type alias for the d3 letiable and the Selection interface
import { Satellite } from '../satellite.model';
import { SatelliteService } from '../satellite.service';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { CountryPipe } from '../country.pipe';

@Component({
  selector: 'app-d3main',
  templateUrl: './d3main.component.html',
  styleUrls: ['./d3main.component.css'],
  providers: [SatelliteService, CountryPipe]
})

export class D3mainComponent implements OnInit {
  private d3: D3; // <-- Define the private member which will hold the d3 reference
  private parentNativeElement: any;
  satellites: any[];
  readyToDisplay: boolean = false;
  desiredFilter: string = "none";
  masterRad: number = 0;
  countryFilter: any;

  satData: any[] = [];
  // newObject = null;
  running = true;

  lightsOn: boolean = true;

  constructor(element: ElementRef,
              d3Service: D3Service,
              private router: Router,
              private database: AngularFireDatabase,
              private satelliteService: SatelliteService,
              countryPipe: CountryPipe) {
        this.d3 = d3Service.getD3(); // <-- obtain the d3 object from the D3 Service
        this.parentNativeElement = element.nativeElement;
        this.countryFilter = countryPipe;
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

              var num1: number = 5;
  } // END ngOnInit()

  createSatData(satArr) {
    let myArr: any[] = [];
    for (let i = 0; i < satArr.length ; i++) {
      let randSpeed: number = this.getRandomNum(3,20);

      let calcRad: number = ((satArr[i].LaunchMassKG**(1/3))/3)+1.7;
      let powerApogee: number = (Math.pow(satArr[i].ApogeeKM, 1/2) + 50);
      let randCx: number = this.getRandomNum(1,powerApogee);
      let calcCY: number = Math.pow(( (powerApogee**2) - (randCx**2) ) ,1/2);

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

  startButtonClicked() {
    if (this.readyToDisplay === true) {
      this.createSatData(this.satData)
      this.satInit(this.d3);
      this.readyToDisplay = false;
    }
  }

  anotherOneClicked() {
    console.log("anotherOneClicked yup");
    this.scatterPlot();
  }

  onChange(dropdownOption) {
    let allSats: any[] = this.satellites;
    this.satData = [];
    this.desiredFilter = dropdownOption;
    this.readyToDisplay = true;
    let someArr: any[] = this.countryFilter.transform(allSats, this.desiredFilter);
    this.satData = someArr;
    console.log(this.satData.length);
  }

  turnLightsOff() {
    document.getElementById("thisSvg").classList.remove('svg1');
    document.getElementById("thisSvg").classList.add('svg2');
    this.lightsOn = false;
  }

  turnLightsOn() {
    document.getElementById("thisSvg").classList.remove('svg2');
    document.getElementById("thisSvg").classList.add('svg1');
    this.lightsOn = true;
  }

  satInit(myd3) {

    let d3 = myd3;
    // clear all cirlces before creating new ones
    d3.selectAll("circle").remove();

    let satData = this.satData;
    console.log("init data length", satData.length);
    // let newObject = this.newObject;
    let running = this.running;

    let svg = d3.select("svg");

    let div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    //for each item in satData create a new satelite circle element
    let satelite = svg.selectAll()
        .data(satData, function(d, i) { return (i); } )
        .enter().append("circle")
        .attr("class", "satelite");

    let allSatelites = svg.selectAll(".satelite")

    // color by country
    allSatelites.style("fill", function(d) {
      if(d.owner === 'USA') {
        return "steelblue";
      } else if (d.owner === 'Russia') {
        return "darkred";
      } else if (d.owner === 'Multinational') {
        return "white";
      } else if (d.owner === 'China') {
        return "gold";
      } else if (d.owner === 'United Kingdom') {
        return "blue";
      } else if (d.owner === 'Japan') {
        return "red";
      } else if (d.owner === 'ESA') {
        return "lightblue";
      } else if (d.owner === 'Germany') {
        return "green";
      } else if (d.owner === 'India') {
        return "yellow";
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

    // allSatelites.attr("cx", function(d) { return d.cx; });
    // allSatelites.attr("cy", function(d) { return d.cy; });
    // allSatelites.attr("r", function(d) { return d.rad; });

    let masterRad = 0;

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
      .style("stroke", "black").style("stroke-width", 5);
      running = false;
      console.log(d);
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
    d3.timer(updateAnim);



  } // END satInit

  scatterPlot() {
    let d3 = this.d3;
    let svg = d3.select("svg");
    alert("Success!");
    this.running = false;

    let satelites = svg.selectAll(".satelite")

    // satelites.attr("transform", function(d) {
    //   // d3.select(this)
    //   // .transition()
    //   //   .delay(0)
    //   //   .duration(1000)
    //   //   .attr("cx", d.cx)
    //   //   .attr("cy", d.cy);
    // });
  }

} // END D3mainComponent
