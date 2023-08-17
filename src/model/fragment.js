// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
//Refer https://www.npmjs.com/package/markdown-it
var MarkdownIt = require('markdown-it'),
  md = new MarkdownIt();
// Refer https://sharp.pixelplumbing.com/
const sharp = require('sharp');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

const supportedTypes = [
  'text/plain',
  'text/plain; charset=utf-8',
  'text/markdown',
  'application/json',
  'text/html',
  'image/png',
  'image/jpeg',
  'image/webp',
];

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId) {
      throw new Error('ownerId is required');
    }
    if (!Fragment.isSupportedType(type) || !type) {
      throw new Error('Not a supported type or required a type');
    }
    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size =
      typeof size === 'number' && size >= 0
        ? size
        : (() => {
            throw new Error(
              typeof size === 'number' ? `size can't be negative` : `size must be a number`
            );
          })();
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    const fragments = await listFragments(ownerId, expand);

    return expand ? fragments.map((fragment) => new Fragment(fragment)) : fragments;
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    return new Fragment(await readFragment(ownerId, id));
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise<void>
   */
  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error('data need to be Buffer');
    }

    this.size = Buffer.byteLength(data);
    this.updated = new Date().toISOString();
    await this.save();
    return writeFragmentData(this.ownerId, this.id, data);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    let result = [];
    if (
      this.type.includes('image/png') ||
      this.type.includes('image/jpeg') ||
      this.type.includes('image/webp')
    ) {
      result = ['image/png', 'image/jpeg', 'image/webp'];
    } else if (this.type.includes('text/plain')) {
      result = ['text/plain'];
    } else if (this.type.includes('text/markdown')) {
      result = ['text/plain', 'text/html', 'text/markdown'];
    } else if (this.type.includes('text/html')) {
      result = ['text/plain', 'text/html'];
    } else if (this.type.includes('application/json')) {
      result = ['application/json', 'text/plain'];
    }
    //return empty array if the type is not supported
    return result;
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    const { type } = contentType.parse(value);
    // const supportedTypes = ['text/plain', 'text/html'];
    return supportedTypes.includes(type) ? true : false;
  }

  /**
   * Returns data after conversion based on requirement
   * @param {string} value type of data in which it is to be changed
   * @returns {string} data with changed type
   */
  async textConvert(value) {
    var result, data;
    data = await this.getData();
    if (value == 'plain') {
      if (this.type == 'application/json') {
        result = JSON.parse(data);
      } else {
        result = data;
      }
    } else if (value == 'html') {
      if (this.type.endsWith('markdown')) {
        result = md.render(data.toString());
      }
    }
    return result;
  }

  /**
   * Converts image data to a different format based on the provided extension.
   * @param {string} value - The target extension for the image conversion (e.g., 'jpg', 'jpeg', 'webp', 'png').
   * @returns {Buffer} - The image data in the specified format.
   */
  async imgConvert(value) {
    var result, data;
    data = await this.getData();

    if (this.type.startsWith('image')) {
      if (value == 'jpg' || value == 'jpeg') {
        result = await sharp(data).jpeg();
      } else if (value == 'webp') {
        result = await sharp(data).webp();
      } else if (value == 'png') {
        result = await sharp(data).png();
      }
    }
    return result.toBuffer();
  }

  /**
   * Returns string of newly changed type name by changing extension
   * @param {string} value extension to be changed
   * @returns {string} changes type name
   */
  extConvert(value) {
    var ext;
    if (value == 'txt') {
      ext = 'plain';
    } else if (value == 'md') {
      ext = 'markdown';
    } else if (value == 'jpg') {
      ext = 'jpeg';
    } else {
      ext = value;
    }
    return ext;
  }
}

module.exports.Fragment = Fragment;
