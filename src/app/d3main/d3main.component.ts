import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { D3Service, D3, Selection } from 'd3-ng2-service'; // <-- import the D3 Service, the type alias for the d3 letiable and the Selection interface
import { Satellite } from '../satellite.model';
import { SatelliteService } from '../satellite.service';
// import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
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
  themeStatus2: string = "navDark";

  constructor(element: ElementRef,
              d3Service: D3Service,
              private router: Router,
              private satelliteService: SatelliteService,
              countryPipe: CountryPipe,
              purposePipe: PurposePipe
              ) {
        this.d3 = d3Service.getD3(); // <-- obtain the d3 object from the D3 Service
        this.parentNativeElement = element.nativeElement;
        this.countryPipeTransform = countryPipe.transform;
        this.purposePipeTransform = purposePipe.transform;
  } // constructor

  ngOnInit() {
      this.satelliteService.getSatellites().subscribe(data => {
        this.satellites = data;
      });
  } // END ngOnInit()

  getFilteredRawData() {
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

  createSatDataForD3() {
    let satArr: Satellite[] = this.filterdSatData;
    let myArr: any[] = [];
    let counter = 0;

    for (let i = 0; i < satArr.length ; i++) {
      let randSpeed: number = this.getRandomNum(3,20);
      let calcRad: number = ((satArr[i].LaunchMassKG**(1/3))/3)+1.7;
      let maxApogee: number = (Math.pow(satArr[i].ApogeeKM, 1/2)*1.3 + 50); // modify the "*1.3" val to scale max orbit size
      let randCx: number = this.getRandomNum(1,maxApogee);
      let calcCy: number = Math.pow(( (maxApogee**2) - (randCx**2) ) ,1/2);

      counter++;

      if (counter == 1) {
        randCx *= -1;
      } else if (counter == 2) {
        calcCy *= -1;
      } else if (counter == 3) {
        randCx *= -1; calcCy *= -1;
      } else if (counter > 3) {
        counter = 0;
      } else {
        console.log('counter probs');
      }

      let dateOfLaunch: string = satArr[i].DateOfLaunch;

      let newSat = {  name: satArr[i].Name ,
                      owner: satArr[i].CountryOperatorOwner,
                      rad: calcRad,
                      speed: randSpeed,
                      origCx: randCx,
                      origCy: calcCy,
                      cx: randCx,
                      cy: calcCy,
                      move: true,
                      date: dateOfLaunch }

      myArr.push(newSat);
    } // end for

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
    return (Math.random() * (max - min) + min);
  }

  orbitButtonClicked() {
    if (this.readyToDisplay === true) {
      this.getFilteredRawData();
      this.createSatDataForD3();
      this.satInit(this.satData,this.d3);
      this.readyToDisplay = false;
    }
  }

  graphClicked() {
    // console.log("Graph Activated");
    this.scatterPlot(this.satData,this.d3);
  }

  turnLightsOff() {
    this.themeStatus = "lightsOff";
    this.themeStatus2 = "navDark";
  }

  turnLightsOn() {
    this.themeStatus = "lightsOn";
    this.themeStatus2 = "navLight";
  }

  onCountrySelectChange(dropdownOption) {
    this.countrySelected = dropdownOption;
    this.readyToDisplay = true;
  }
  onPurposeSelectChange(dropdownOption) {
    this.purposeSelected = dropdownOption;
    this.readyToDisplay = true;
  }

  satInit(sd,d) {
    let d3 = d;
    d3.timer(updateAnim);
    let satData = sd;
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

    // clear all cirlces before creating new ones
    d3.selectAll("circle").remove();

    let svg = d3.select("svg");
    svg.append("g");

    let div = d3.select("body").append("div");
    div.attr("class", "tooltip").style("opacity", 0);

    //for each item in satData create a new satelite circle element
    svg.selectAll().data(satData, function(d, i) { return (i); } )
                   .enter().append("circle")
                   .attr("class", "satelite");

    let allSatelites = svg.selectAll(".satelite");
    allSatelites.style("opacity", 0.6);
    allSatelites.attrs({
      cx: 0,
      cy: 0,
      r:  function (d) { return d.rad; }
    });
    allSatelites.attr("transform", function(d) {
      d3.select(this)
      .transition()
      .delay(0)
      .duration(1500)
      .attr("cx", d.cx)
      .attr("cy", d.cy);
    });
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

    d3.select("g").append("circle")
      .attr("fill", "url(#earth)")
      .attr("cx", 500)
      .attr("cy", 500)
      .attr("r", 50);

    // define sat tooltip mouse hover event
    allSatelites.on("mouseover", function(d) {
      d3.select(this)
      .style("stroke", "gold").style("stroke-width", 6);
      running = false;
      div.transition()
          .duration(200)
          .style("opacity", .9);
      div	.html("<strong> Name: </strong>" + d.name +
                "<br/> <strong> Country: </strong>" + d.owner +
                "<br/> <strong> Launch Date: </strong>" + d.date)
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
  } // END satInit

  scatterPlot(sd,d) {
    let d3 = d;
    let satData = sd;
    let svg = d3.select("svg");
    svg.call( d3.zoom().on("zoom", function () {}) );
    let xRangeWidth = 800;
    let yMin = 150;

    // var newScale = d3.scaleLinear().range([1970,2016]).domain([0,1498400000]);
    var xScale = d3.scaleLinear().range([0,xRangeWidth]).domain([1970,2020]);
    var yScale = d3.scaleLinear().range([0,200]).domain([0,200]);
    var xAxis = d3.axisBottom().scale(xScale);
    var yAxis = d3.axisLeft().scale(yScale);

    svg.append("g")
              .attr("class", "axis")
              .attr("transform", "translate(100,350)") // define where the axis gets painted to svg element
              .call(xAxis);

    svg.append("g")
              .attr("class", "axis")
              .attr("transform", "translate(100,"+yMin+")") // define where the axis gets painted to svg element
              .call(yAxis);

    // rotate the dots slightly back along thier orbits for effet
    var satelites = d3.selectAll(".satelite")
              .data(satData)
              .attr("class", "orbitalObject")
              .classed("satelite", false)
              .transition()
              .delay(0)
              .duration(1000)
              .attr("transform", "translate(500,500), rotate(-25)"); // rotate back 25 degrees

    // this trasition determines the location of each sat dot on the graph based on date launched
    let getr = this.getRandomNum; // temp funk
    satelites.transition().attr("cx", function(d) {
      // console.log("d.date = ", d.date);
      // console.log("Date.parse(d.date) = ", Date.parse(d.date));
      let leftPixOffset = 100;
      // d.data =  milliseconds since January 1, 1970
      // 31536000000 ms = 1 year
      let yearsSince1970 = (Date.parse(d.date)/31536000000);
      // console.log('yearsSince1970 =  ', yearsSince1970);
      let pixPerYear = (xRangeWidth/(2020-1970));
      // console.log('pixPerYear =  ', pixPerYear);
      let xPosition = (pixPerYear*yearsSince1970)+leftPixOffset;
      // console.log('xPosition =  ', xPosition);
      return xPosition;
    })
    .attr("cy", function(d) {
      let randN = getr(10,190); // random Y axis value minus 10 so it doesnt' overlap the x-axis
      return (randN + yMin);
    })
    .attr("transform", "translate(0,0)"); // reset the corner of svg for graph

  } // scatterPlot

  resetAll() {
    console.log('test clicked');
    // this.unScatter(this.satData, this.d3);
  }
  unScatter(satData,myd3) {
    // let d3 = myd3;

    // let newSat = {  name: satArr[i].Name ,
    //                 owner: satArr[i].CountryOperatorOwner,
    //                 rad: calcRad,
    //                 speed: randSpeed,
    //                 origCx: randCx,
    //                 origCy: randCy,
    //                 cx: randCx,
    //                 cy: 8,
    //                 move: true,
    //                 date: dateOfLaunch }
  }

} // END D3mainComponent
