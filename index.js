// External Dependencies
const { exec } = require('child_process');
const awaitExec = require('await-exec');
const cwebp = require('cwebp-bin');

// Internal Dependencies
const image = require('./modules/base');

// @todo: Add options for img2webp
module.exports = {
  async convert(input, output, options, fn = null) {
    // @todo: check if valid image
    const validated = image.validateOptions(options);

    // Get filename from path less extension
    const file = await image.getImageAttributes(input);

    if (!validated) return; // Invalid options

    // Build method based on file type
    // const method = `"${cWebPPath + image.getMethod(file)}"`;
    const method = cwebp;

    // Build command string
    const command = image.buildCommand(input, output, options, method);

    // Execute function or return promise
    if (fn) {
      exec(`${command}`, fn);
    } else {
      return awaitExec(`${command}`);
    }
  }
};
