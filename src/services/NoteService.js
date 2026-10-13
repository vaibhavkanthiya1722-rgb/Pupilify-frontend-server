// src/services/NoteService.js
import API from "../libs/api";

const NoteService = {
  /**
   * Get all notes for a school
   * @param {number} schoolId - School ID
   * @returns {Promise<Array>} - List of notes
   */
  async getNotes(schoolId) {
    try {
      const response = await API.get(`/api/admin/notes/school/${schoolId}`);
      return response.data || response;
    } catch (err) {
      console.error("getNotes error:", err);
      throw err;
    }
  },

  /**
   * Get a single note by ID
   * @param {number} schoolId - School ID
   * @param {number} noteId - Note ID
   * @returns {Promise<Object>} - Note object
   */
  async getNoteById(schoolId, noteId) {
    try {
      const response = await API.get(`/api/admin/notes/school/${schoolId}/note/${noteId}`);
      return response.data || response;
    } catch (err) {
      console.error("getNoteById error:", err);
      throw err;
    }
  },

  /**
   * Create a new note
   * @param {number} schoolId - School ID
   * @param {Object} noteData - { title, content, type? }
   * @returns {Promise<Object>} - Created note
   */
  async createNote(schoolId, noteData) {
    try {
      const payload = {
        title: noteData.title,
        content: noteData.content || noteData.title,
        type: noteData.type || "info"
      };
      const response = await API.post(`/api/admin/notes/school/${schoolId}`, payload);
      return response.data || response;
    } catch (err) {
      console.error("createNote error:", err);
      throw err;
    }
  },

  /**
   * Update an existing note
   * @param {number} schoolId - School ID
   * @param {number} noteId - Note ID
   * @param {Object} noteData - Updated note data
   * @returns {Promise<Object>} - Updated note
   */
  async updateNote(schoolId, noteId, noteData) {
    try {
      const payload = {
        title: noteData.title,
        content: noteData.content || noteData.title,
        type: noteData.type || "info"
      };
      const response = await API.put(`/api/admin/notes/school/${schoolId}/note/${noteId}`, payload);
      return response.data || response;
    } catch (err) {
      console.error("updateNote error:", err);
      throw err;
    }
  },

  /**
   * Soft delete a note
   * @param {number} schoolId - School ID
   * @param {number} noteId - Note ID
   * @returns {Promise<Object>} - Success message
   */
  async deleteNote(schoolId, noteId) {
    try {
      const response = await API.delete(`/api/admin/notes/school/${schoolId}/note/${noteId}`);
      return response.data || response;
    } catch (err) {
      console.error("deleteNote error:", err);
      throw err;
    }
  },

  /**
   * Hard delete a note (permanent)
   * @param {number} schoolId - School ID
   * @param {number} noteId - Note ID
   * @returns {Promise<Object>} - Success message
   */
  async hardDeleteNote(schoolId, noteId) {
    try {
      const response = await API.delete(`/api/admin/notes/school/${schoolId}/note/${noteId}/hard`);
      return response.data || response;
    } catch (err) {
      console.error("hardDeleteNote error:", err);
      throw err;
    }
  }
};

export default NoteService;