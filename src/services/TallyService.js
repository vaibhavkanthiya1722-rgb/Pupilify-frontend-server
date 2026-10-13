import API from "../libs/api";


class TallyService {
  // Get Tally Summary (Profit/Loss Dashboard)
  static async getTallySummary(schoolId, academicYearId) {
    try {
      const response = await API.get(
        `/api/admin/tally/summary/${schoolId}?yearId=${academicYearId}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching tally summary:', error);
      throw error;
    }
  }

  // Get All Expenses for a school and academic year
  static async getExpenses(schoolId, academicYearId) {
    try {
      const response = await API.get(
        `/api/admin/tally/expenses/${schoolId}?yearId=${academicYearId}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  }

  // Add New Expense
  static async addExpense(schoolId, academicYearId, expenseData) {
    try {
      const response = await API.post(
        `/api/admin/tally/add-expense/${schoolId}?yearId=${academicYearId}`,
        expenseData
      );
      return response;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  }

  // Delete Expense
  static async deleteExpense(expenseId) {
    try {
      const response = await API.delete(
        `/api/admin/tally/delete-expense/${expenseId}`
      );
      return response;
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }
}

export default TallyService;