const fileType = require('file-type');
const fs = require('fs');
const path = require('path');
const cwebpOptions = require('./cwebp_options.json');

// const cWebPPath = '"./cwebplib/bin/cwebp"';

// const webp_methods = {
//   cwebp: 'cwebp',
//   dwebp: 'dwebp',
//   gif2webp: 'gif2webp',
//   img2webp: 'img2webp'
// };

module.exports = {
  async getImageAttributes(file) {
    const fileData = await fs.readFileSync(file);
    const type = fileType(fileData);

    // Get filename from path less extension
    const name = path.basename(file, `.${type.ext}`);

    // Get basename from name and extension
    const baseName = `${name}.${type.ext}`;

    return {
      ...type,
      name,
      baseName,
      path: file
    };
  },

  validateOptions(options) {
    let errorMsgs = [];

    const errors = Object.entries(options).map(([key, value]) => {
      let status = true;

      // Check property exists
      if (!cwebpOptions.hasOwnProperty(key)) {
        errorMsgs.push(`${key} is not a valid option`);
        status = false;
        return status;
      }

      const option = cwebpOptions[key];

      // Check property type = value type
      if (option.type !== typeof value) {
        errorMsgs.push(
          `"${key}" requires a ${
            option.type
          } and you provided a ${typeof value}.`
        );
        status = false;
      }

      // Check type specfic shape requirements
      switch (option.type) {
        case 'string':
          if (!option.values.some(str => str === value)) {
            status = false;

            errorMsgs.push(
              `${value} is not a valid value for the option "${key}". The options available for this property are ${option.values.join(
                ', '
              )}.`
            );
          }
          break;
        case 'number':
          let [min, max] = option.range;
          if (min > value || max < value) {
            status = false;
            errorMsgs.push(
              `${value} is outside the valid range for "${key}" option. The range for this option is from ${min} to ${max}.`
            );
          }
          break;
        case 'object':
          if (option.shape.length !== value.length) {
            status = false;
            errorMsgs.push(
              `"${key}" requires the following values ${option.shape.join(
                ', '
              )}.`
            );
          }
          if (value.some(v => typeof v !== 'number')) {
            status = false;
            errorMsgs.push(`"${key}" array values should be of number type`);
          }
          break;
      }

      return status;
    });

    const hasErrors = errors.some(x => !x);

    if (hasErrors) errorMsgs.forEach(msg => console.log(`Error: ${msg}`));

    return !hasErrors;
  },

  getMethod(file) {
    if (Array.isArray(file)) {
      return 'img2webp';
    } else if (file.ext === 'gif') {
      return 'gif2webp';
    } else if (file.ext === 'webp') {
      return 'dwebp';
    } else {
      return 'cwebp';
    }
  },

  buildCommand(input, output, options, method) {
    // check if einput is set for order

    // Build options

    // const optionsArr = [];
    const optionsStr = Object.entries(options)
      .map(([key, value]) => {
        if (value === false) return;
        let str;

        switch (typeof value) {
          case 'object':
            str = `${cwebpOptions[key].flag} ${value.join(' ')}`;
            break;
          case 'boolean':
            str = cwebpOptions[key].flag;
            break;
          default:
            str = `${cwebpOptions[key].flag} ${value}`;
            break;
        }

        return str;
      })
      .join(' ');

    const paths = [method, optionsStr, input, '-o', output];

    const command = paths.join(' ');
    return command;
  }
};
