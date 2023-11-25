// Data URL.
const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';

// Declare our variables.
let baseTemp;
let values = [];

let xScale;
let yScale;

let minYear;
let maxYear; 
let numberOfYears = maxYear - minYear;

let width = 1200;
let height = 600;
let padding = 60;

// Create your tooltip.
let tooltip = d3.select('#tooltip');

// Create SVG element.
let svg = d3.select('#root')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

// Create generative functions.
let generateScales = () => {

  minYear = d3.min(values, (item) => {
    return item.year;
  })

  maxYear = d3.max(values, (item) => {
    return item.year;
  })

  xScale = d3.scaleLinear() // Linear scale is fine because we're dealing with numbers.
    .domain([minYear, maxYear + 1]) // The plus one is to make sure the last rectangle is visible.
    .range([padding, width - padding]); // Goes from padding which is 60 to width - padding which is 1140.

  yScale = d3.scaleTime() // Our months are stored as numbers so we use time scale to convert them to dates.
    .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)]) // new Date(year, month, day, hours, minutes, seconds, milliseconds) creates an object.
    .range([padding, height - padding]) // Range refers to where the values will live on the map.
};

let drawCells = () => {

  svg.selectAll('rect')
    .data(values) // Bind data to the selection.
    .enter() // Enter the selection.
    .append('rect') // Creates a rectangle tag for each data point.
    .attr('class', 'cell')
    .attr('fill', (item) => { // Fill the rectangle with a color based on the variance.
      variance = item.variance
      if (variance <= -1) {
        return '#0f52ba'
      } else if (variance <= 0) {
        return '#87ceeb'
      } else if (variance <= 1) {
        return '#ffbf00'
      } else {
        return '#ee4b2b'
      }
    })
    .attr('data-year', (item) => {
      return item.year
    })
    .attr('data-month', (item) => {
      return item.month - 1 // With JS we have zero based indexing so we subtract 1.
    })
    .attr('data-temp', (item) => {
      return baseTemp + item.variance // The actual temperature is the base temperature plus the variance.
    })
    .attr('height', (height - (2 * padding)) / 12) // The height of each rectangle is the height of the SVG minus 2 times the padding divided by 12.
    .attr('y', (item) => { // The y attribute is the  y coordinate of the rectangle.
      return yScale(new Date(0, item.month - 1, 0, 0, 0, 0, 0)) // We use the yScale to align our rectangles based on the month to the correct spot on the y axis.
    })
    .attr('width', (item) => {
      numberOfYears = maxYear - minYear
      return (width - (2 * padding)) / numberOfYears // The width of each rectangle is the width of the SVG minus 2 times the padding divided by the number of years.
    })
    .attr('x', (item) => { // The x attribute is the x coordinate of the rectangle cells.
      return xScale(item.year) // We use the xScale to align our rectangles based on the year to the correct spot on the x axis.
    })
    // The mouseover and mouseout events take two arguments, the event and the item.
    .on('mouseover', (evnt, item) => { // When the mouse is over the rectangle, show the tooltip.
      tooltip.transition() // The transition method allows us to animate the tooltip.
        .style('visibility', 'visible')
        .attr('data-year', item.year) // The relatedTarget property returns the element related to the element that triggered the mouse event.
      let monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'Novermber', 'December']
      tooltip.text(item.year + ' ' + monthNames[item['month'] - 1] + ' - ' + (baseTemp + item.variance) + '(' + item['variance'] +  ')') // The text method allows us to set the text of the tooltip.
    })
    .on('mouseout', (evnt, item) => { // When the mouse is out of the rectangle, hide the tooltip.
      tooltip.transition()
        .style('visibility', 'hidden')
    })
  };

let drawAxes = () => {

  let xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.format('d')); // The d here means decimal notation and displays the tick values as integers.

  let yAxis = d3.axisLeft(yScale)
    .tickFormat(d3.timeFormat('%B')); // Here we use the timeFormat method to displaly the tick values as the full month name. We pass a format string to the method. %B means show the full month name.  

  svg.append('g')
    .call(xAxis)
    .attr('id', 'x-axis')
    .attr('transform', `translate(0, ${height - padding})`);

  svg.append('g')
    .call(yAxis)
    .attr('id', 'y-axis')
    .attr('transform', `translate(${padding}, 0)`)
};

// Load and process the data.
d3.json(url).then(data => {
  console.dir(data);
  baseTemp = data.baseTemperature;
  values = data.monthlyVariance;
  generateScales();
  drawCells();
  drawAxes();
});