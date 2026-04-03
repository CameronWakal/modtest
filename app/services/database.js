import Service from '@ember/service';
import Dexie from 'dexie';

/**
 * Database service that manages IndexedDB storage via Dexie.
 * Stores patches as complete JSON documents for simplicity and export-readiness.
 */
export default class DatabaseService extends Service {
  db = null;

  constructor() {
    super(...arguments);
    this.db = new Dexie('modtest');

    // Schema version 1: Simple document storage
    // Each patch is stored as a complete JSON document
    this.db.version(1).stores({
      patches: 'id',  // Primary key only - data is stored as JSON
    });
  }

  /**
   * Get all patches from the database
   * @returns {Promise<Array>} Array of patch documents
   */
  async getAllPatches() {
    return this.db.patches.toArray();
  }

  /**
   * Get a single patch by ID
   * @param {string} id - Patch ID
   * @returns {Promise<Object|undefined>} Patch document or undefined
   */
  async getPatch(id) {
    return this.db.patches.get(id);
  }

  /**
   * Save a patch document (create or update)
   * @param {string} id - Patch ID
   * @param {Object} data - Serialized patch data
   * @returns {Promise<string>} The patch ID
   */
  async savePatch(id, data) {
    await this.db.patches.put({ id, ...data });
    return id;
  }

  /**
   * Delete a patch by ID
   * @param {string} id - Patch ID
   * @returns {Promise<void>}
   */
  async deletePatch(id) {
    await this.db.patches.delete(id);
  }

  /**
   * Export a patch as JSON string (for file download)
   * @param {string} id - Patch ID
   * @returns {Promise<string>} JSON string of patch data
   */
  async exportPatch(id) {
    const patch = await this.getPatch(id);
    if (!patch) {
      throw new Error(`Patch ${id} not found`);
    }
    return JSON.stringify(patch, null, 2);
  }

  /**
   * Import a patch from JSON string
   * @param {string} jsonString - JSON string of patch data
   * @param {string} [newId] - Optional new ID (generates one if not provided)
   * @returns {Promise<string>} The imported patch ID
   */
  async importPatch(jsonString, newId) {
    const data = JSON.parse(jsonString);
    const id = newId || data.id || crypto.randomUUID();
    await this.savePatch(id, { ...data, id });
    return id;
  }

  /**
   * Clear all data (useful for testing or reset)
   * @returns {Promise<void>}
   */
  async clearAll() {
    await this.db.patches.clear();
  }
}
