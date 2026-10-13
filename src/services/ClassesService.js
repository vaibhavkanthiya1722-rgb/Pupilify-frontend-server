import API from "../libs/api";

const ClassesService = {

  // Create new class
  createClass: (schoolId, className) => {
    return API.post(`/api/admin/classes/create/${schoolId}`, { 
      className: className.trim() 
    });
  },

  // Delete class
  deleteClass: (classId) => {
    return API.delete(`/api/admin/classes/delete/${classId}`);
  },

  // Add section to class
  addSection: (classId, schoolId, sectionName) => {
    return API.post(`/api/admin/classes/${classId}/sections/${schoolId}`, {
      sectionName: sectionName.trim().toUpperCase() // Always uppercase
    });
  },

  // Delete section
  deleteSection: (sectionId) => {
    return API.delete(`/api/admin/classes/sections/delete/${sectionId}`);
  },

  // Get all classes
 getClasses: (schoolId) => {
  return API.get(`/api/admin/classes/school/${schoolId}`);
},

  // Get sections for a class
  getSections: (classId) => {
    return API.get(`/api/admin/classes/${classId}/sections`);
  },

  // Normalize class name - IMPROVED VERSION
  normalizeClassName: (className) => {
    if (!className) return '';
    
    // Remove extra spaces and convert to lowercase
    const normalized = className.trim().toLowerCase();
    
    // Extract only numbers from the string
    const numbers = normalized.match(/\d+/);
    if (!numbers) return normalized;
    
    const classNumber = numbers[0];
    
    // Common patterns mapping
    const patterns = {
      '1': ['1', '1st', 'first', 'i', 'one'],
      '2': ['2', '2nd', 'second', 'ii', 'two'],
      '3': ['3', '3rd', 'third', 'iii', 'three'],
      '4': ['4', '4th', 'fourth', 'iv', 'four'],
      '5': ['5', '5th', 'fifth', 'v', 'five'],
      '6': ['6', '6th', 'sixth', 'vi', 'six'],
      '7': ['7', '7th', 'seventh', 'vii', 'seven'],
      '8': ['8', '8th', 'eighth', 'viii', 'eight'],
      '9': ['9', '9th', 'ninth', 'ix', 'nine'],
      '10': ['10', '10th', 'tenth', 'x', 'ten'],
      '11': ['11', '11th', 'eleventh', 'xi', 'eleven'],
      '12': ['12', '12th', 'twelfth', 'xii', 'twelve']
    };
    
    // Find which class number this matches
    for (const [num, variations] of Object.entries(patterns)) {
      if (variations.some(v => normalized.includes(v))) {
        return `class ${num}`;
      }
    }
    
    // If number found but no pattern match, still return class with that number
    if (classNumber) {
      return `class ${classNumber}`;
    }
    
    return className.trim();
  },

  // Check if class exists - IMPROVED VERSION
  checkClassExists: async (schoolId, className) => {
    try {
      const response = await ClassesService.getClasses(schoolId);
      const classes = response.data || [];
      const normalizedNew = ClassesService.normalizeClassName(className);
      
      return classes.some(c => {
        const normalizedExisting = ClassesService.normalizeClassName(c.className);
        return normalizedExisting === normalizedNew;
      });
    } catch (error) {
      console.error('Error checking class:', error);
      return false;
    }
  },

  // Create class with default section - WITH DUPLICATE CHECK
createClassWithDefaultSection: async (schoolId, className) => {
  try {
    // ✅ Duplicate check
    const exists = await ClassesService.checkClassExists(schoolId, className);
    if (exists) {
      throw new Error('Class already exists!');
    }

    const res = await ClassesService.createClass(schoolId, className);

    const classId =
      res?.data?.id ||
      res?.id ||
      res?.data?.classId ||
      res?.data?.data?.id;

    if (!classId) {
      throw new Error("Class created but ID not returned!");
    }

    try {
      await ClassesService.addSection(classId, schoolId, 'Section A');
    } catch (err) {
      console.warn("Retrying section creation...");
      await ClassesService.addSection(classId, schoolId, 'Section A');
    }

    return res;

  } catch (error) {
    console.error("Error in createClassWithDefaultSection:", error);
    throw error;
  }
},
  // Format class name for display
  formatClassName: (className) => {
    const normalized = ClassesService.normalizeClassName(className);
    // Capitalize first letter
    return normalized.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

};

export default ClassesService;