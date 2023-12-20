
const _ = require('lodash');

// helpers


const findMinParsedPath = (path) => {
  let minX = Infinity;
  let minY = Infinity;

  /* eslint-disable */
  for (const item of path) {
    if (item[0] === 'M' || item[0] === 'L') {
      const x = item[1];
      const y = item[2];
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
    }
  }
  return [minX, minY];
}

const recalibrate = (points) => {
    // Step 1: Find the minimum X and Y values in the shape
    let minX = Infinity;
    let minY = Infinity;
    let needsShift = false;
  
    /* eslint-disable */
    for (const item of points) {
      if (item[0] === 'M' || item[0] === 'L') {
        const x = item[1];
        const y = item[2];
        if (x < 0 || y < 0) {
          needsShift = true;
        }
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
      }
    }
    /* eslint-enable */
  
    // Step 2: Determine the shift values if needed
    const shiftX = needsShift ? -minX : 0;
    const shiftY = needsShift ? -minY : 0;
  
    // Step 3: Update the shape's coordinates if needed
    const shiftedPoints = points.map((item) => {
      if (item[0] === 'M' || item[0] === 'L') {
        const x = item[1] + shiftX;
        const y = item[2] + shiftY;
        return [item[0], x, y];
      }
      return item; // Preserve non-coordinate items like 'z'
    });
  
    return shiftedPoints;
};

const recalibrateAllPaths = (paths, minX, minY) => {
  let returned_shifted_paths = [];
  
  /* eslint-disable */
  for (const points of paths) {
    /* eslint-enable */

    // Step 2: Determine the shift values if needed
    const shiftX = -minX;
    const shiftY = -minY;

    // Step 3: Update the shape's coordinates if needed
    const shiftedPoints = points.map((item) => {

      if (item[0] === 'M' || item[0] === 'L') {
        const x = item[1] + shiftX;
        const y = item[2] + shiftY;
        return [item[0], x, y];
      }
      return item; // Preserve non-coordinate items like 'z'
    })

    returned_shifted_paths.push(shiftedPoints);
  }
  return returned_shifted_paths;
};


const pointsToSvgPath = (points) => {
    let pathData = '';
    let lastCommand = '';
  
    /* eslint-disable */
    for (const item of points) {
      const command = item[0];
      const params = item.slice(1);
  
      if (command !== lastCommand) {
        pathData += command;
        lastCommand = command;
      } else {
        pathData += 'L'; // Add "L" command for consecutive points
      }
  
      pathData += params.join(',');
    }
    /* eslint-enable */
  
    return pathData;
  };

  const addOffsetToPoints = (points, offsetX, offsetY) => {
    // Iterate through the points and update numeric values
    const updatedPoints = points.map((item) => {
      if (typeof item === 'number') {
        // If it's a number, add the offsets
        return item + (item === offsetX ? offsetX : offsetY);
      } else if (Array.isArray(item)) {
        // If it's an array, recursively process it
        return addOffsetToPoints(item, offsetX, offsetY);
      } else {
        // If it's not a number or array, return it unchanged
        return item;
      }
    });
  
    return updatedPoints;
  
  };

  module.exports = { recalibrate, recalibrateAllPaths, pointsToSvgPath, addOffsetToPoints, findMinParsedPath };  