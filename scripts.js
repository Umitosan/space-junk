var satData = [
  { name: 'Spuntik 1', owner: 'Russia', rad:  1.5, speed: 7, cx: 115, cy: 0, move: true },
  { name: 'Mir', owner: 'Russia', rad: 15, speed: 14, cx: 150, cy: 0, move: true },
  { name: 'Skylab', owner: 'USA', rad:  3.5, speed: 2, cx: 183, cy: 0, move: true },
  { name: 'ISS', owner: 'UN', rad: 3.5, speed: 4, cx: 237, cy: 0, move: true },
  { name: 'Telstar', owner: 'USA', rad:  6.8, speed: 5, cx: 385, cy: 0, move: true },
  { name: 'Explorer 1', owner: 'USA', rad: 5.3, speed: 6, cx: 294, cy: 0, move: true },
  { name: 'Chandrayaan 1', owner: 'India', rad: 3.8, speed: 15, cx: 400, cy: 0, move: true },
  { name: 'NOAA', owner: 'USA', rad: 4.2, speed: 22, cx: 125, cy: 0, move: true },
  { name: 'Uhuru', owner: 'USA', rad: 20, speed: 40, cx: 125, cy: 0, move: false }
];

var newObject = null;
var running = true;

function mainFunk() {

  var svg = d3.select("svg");

  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  //for each item in satData create a new satelite circle element
  var satelite = svg.selectAll(".start")
      .data(satData, function(d, i) { return (i); } )
      .enter().append("circle")
      .attr("class", "satelite");

  var allSatelites = svg.selectAll(".satelite")
  // allSatelites.attr("cx", function(d) { return d.cx; });
  // allSatelites.attr("cy", function(d) { return d.cy; });
  // allSatelites.attr("r", function(d) { return d.rad; });

  allSatelites.attrs({
    cx: function (d) { return d.cx; },
    cy: function (d) { return d.cy; },
    r:  function (d) { return d.rad; }
  });
  //This works with the d3 extension d3-selection-multi which has been added to the htmml file's head.


  // selection.styles(function(d) { return {fill: "red", stroke: d.stroke}; });

  var masterRad = 0;

  function updateAnim() {

    //This function will add a new satelite into the orbit of the planet:
    if (newObject != null) {
      var satelite = svg.selectAll(".start")
          .data(satData, function(d, i) { return (i); } )
          .enter().append("circle")
          .attr("class", "satelite");
      var allSatelites = svg.selectAll(".satelite")
      // allSatelites.attr("cx", function(d) { return d.cx; });
      // allSatelites.attr("cy", function(d) { return d.cy; });
      // allSatelites.attr("r", function(d) { return d.rad; });
      allSatelites.attrs({
        cx: function (d) { return d.cx; },
        cy: function (d) { return d.cy; },
        r:  function (d) { return d.rad; }
      });
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
      newObject = null;
    }

    svg.selectAll(".satelite").attr("transform", function(d) {
      if (d.move === true) {
        return "translate(500,500), rotate(" + (masterRad * d.speed/100) + ")";
      } else {
        return "translate(500,500)";
      }

    });
    if (masterRad === 10000) {
      masterRad = 0;
    }

    if (running === true) {
      masterRad += 1;
    }

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
    // for (var i = 0; i<satData.length; i++)	{
    // 	console.log(satData[i]['move']=false);
    // };
    div.transition()
        .duration(500)
        .style("opacity", 0);
  };

}



$(document).ready(function(){

  $('#myBtn').click(function(){
    mainFunk();
  });

  $('#submit-form').submit(function(event){
    event.preventDefault();
    var nameInput = $("input#satName").val();
    var ownerInput = $("input#satOwner").val();
    var radInput = parseFloat($("input#rad").val());
    var speedInput = parseFloat($("input#speed").val());
    var cxInput = parseFloat($("input#cx").val());
    var cyInput = parseFloat($("input#cy").val());
    newObject = { name: nameInput, owner: ownerInput, rad:  radInput, speed: speedInput, cx: cxInput, cy: cyInput, move: true };
    satData.push(newObject);
    // mainFunk();
  });

});
