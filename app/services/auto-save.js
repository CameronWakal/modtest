import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { debounce, cancel } from '@ember/runloop';

/**
 * Auto-save service that handles debounced persistence of the current patch.
 * Any save() call on any record triggers a debounced save of the active patch.
 */
export default class AutoSaveService extends Service {
  @service store;

  // The currently active patch ID
  currentPatchId = null;

  // Pending save timer
  _pendingTimer = null;

  // Debounce delay in milliseconds
  debounceMs = 500;

  /**
   * Set the current active patch.
   * Called by the patch route when entering.
   */
  setCurrentPatch(patchId) {
    this.currentPatchId = patchId;
  }

  /**
   * Schedule a save for the current patch.
   * Multiple calls within the debounce window are coalesced.
   */
  scheduleSave() {
    if (!this.currentPatchId) {
      return;
    }

    // Cancel any existing pending save
    if (this._pendingTimer) {
      cancel(this._pendingTimer);
    }

    // Schedule new debounced save
    this._pendingTimer = debounce(this, this._performSave, this.debounceMs);
  }

  /**
   * Perform the actual save operation.
   */
  async _performSave() {
    this._pendingTimer = null;

    const patch = this.store.peekRecord('patch', this.currentPatchId);
    if (patch && !patch.isDeleted && !patch.isDestroyed) {
      try {
        console.log('Auto-save: saving patch', this.currentPatchId);
        await patch.save();
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }
  }

  /**
   * Force an immediate save (cancels any pending debounce).
   */
  async saveNow() {
    if (this._pendingTimer) {
      cancel(this._pendingTimer);
      this._pendingTimer = null;
    }

    await this._performSave();
  }

  /**
   * Clear the current patch (e.g., when leaving the patch route).
   */
  clearCurrentPatch() {
    if (this._pendingTimer) {
      cancel(this._pendingTimer);
      this._pendingTimer = null;
    }
    this.currentPatchId = null;
  }

  /**
   * Clean up when the service is destroyed.
   */
  willDestroy() {
    super.willDestroy();
    if (this._pendingTimer) {
      cancel(this._pendingTimer);
    }
  }
}
