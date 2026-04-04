import Adapter from '@ember-data/adapter';
import { service } from '@ember/service';

/**
 * Custom adapter that stores patches as complete JSON documents in IndexedDB.
 *
 * Architecture:
 * - Patch records are persisted to IndexedDB as complete documents
 * - All other record types (modules, ports, settings, etc.) are embedded in patches
 * - Non-patch records resolve immediately on save (they're persisted with their patch)
 * - Any embedded record save triggers a debounced save of the current patch
 */
export default class ApplicationAdapter extends Adapter {
  @service database;
  @service store;
  @service autoSave;

  /**
   * Find all records of a given type.
   * For patches: loads from IndexedDB and deserializes complete documents
   * For other types: returns empty array (they're embedded in patches)
   */
  async findAll(store, type) {
    if (type.modelName === 'patch') {
      const documents = await this.database.getAllPatches();
      const serializer = store.serializerFor('patch');

      // Deserialize each document into Ember Data records via store.push
      for (const doc of documents) {
        serializer.normalizePatchDocument(doc);
      }

      // Return empty array - records are already in the store via push
      // The route will use store.peekAll('patch') to get them
      return [];
    }
    // Other types are embedded in patches - return empty
    return [];
  }

  /**
   * Find a single record by ID.
   */
  async findRecord(store, type, id) {
    if (type.modelName === 'patch') {
      // Check if the record already exists in the store (may have been just created)
      const existingRecord = store.peekRecord('patch', id);
      if (existingRecord) {
        // Return JSON:API format
        return {
          data: {
            id: String(id),
            type: 'patch',
            attributes: { title: existingRecord.title || 'Untitled Patch' }
          }
        };
      }

      const doc = await this.database.getPatch(id);
      if (!doc) {
        throw new Error(`Patch ${id} not found`);
      }
      return {
        data: {
          id: String(doc.id),
          type: 'patch',
          attributes: { title: doc.title || 'Untitled Patch' }
        }
      };
    }
    // Other types should already be in the store from patch loading
    throw new Error(`Cannot find individual ${type.modelName} records - they are embedded in patches`);
  }

  /**
   * Create a new record.
   * For patches: serializes and saves to IndexedDB
   * For other types: resolves immediately and schedules auto-save
   */
  async createRecord(store, type, snapshot) {
    if (type.modelName === 'patch') {
      return this._savePatch(snapshot);
    }
    // Embedded records - schedule auto-save of current patch
    console.log(`Auto-save requested by: ${snapshot.modelName}:${snapshot.id}`);
    this.autoSave.scheduleSave();
    return null;
  }

  /**
   * Update an existing record.
   * For patches: serializes and saves to IndexedDB
   * For other types: resolves immediately and schedules auto-save
   */
  async updateRecord(store, type, snapshot) {
    if (type.modelName === 'patch') {
      return this._savePatch(snapshot);
    }
    // Embedded records - schedule auto-save of current patch
    console.log(`Auto-save requested by: ${snapshot.modelName}:${snapshot.id}`);
    this.autoSave.scheduleSave();
    return null;
  }

  /**
   * Delete a record.
   * For patches: removes from IndexedDB
   * For other types: resolves immediately and schedules auto-save
   */
  async deleteRecord(store, type, snapshot) {
    if (type.modelName === 'patch') {
      await this.database.deletePatch(snapshot.id);
      return null;
    }
    // Embedded records - schedule auto-save of current patch
    console.log(`Auto-save requested by: ${snapshot.modelName}:${snapshot.id}`);
    this.autoSave.scheduleSave();
    return null;
  }

  /**
   * Serialize and save a patch document to IndexedDB.
   */
  async _savePatch(snapshot) {
    const serializer = this.store.serializerFor('patch');
    const data = serializer.serializePatchDocument(snapshot);

    await this.database.savePatch(snapshot.id, data);

    // Return null to prevent Ember Data from processing a response
    // The record is already correct in the store
    return null;
  }

  /**
   * Generate a unique ID for new records.
   */
  generateIdForRecord() {
    return crypto.randomUUID();
  }
}
