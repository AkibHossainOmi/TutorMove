import apiService from './apiService';

/**
 * Download payment statement as PDF
 * @param {string} startDate - Start date in ISO format
 * @param {string} endDate - End date in ISO format
 * @param {string} status - Optional payment status filter (all, SUCCESS, PENDING, FAILED)
 * @returns {Promise<void>}
 */
export const downloadPaymentStatement = async (startDate, endDate, status = 'all') => {
  try {
    // Construct URL with query parameters
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });

    if (status && status !== 'all') {
      params.append('status', status);
    }

    const url = `/api/admin/payments/download_statement/?${params.toString()}`;

    // Make API request with blob response type
    const response = await apiService.get(url, {
      responseType: 'blob',
    });

    // Create blob from response
    const blob = new Blob([response.data], { type: 'application/pdf' });

    // Create download link
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;

    // Generate filename from dates
    const startDateStr = new Date(startDate).toISOString().split('T')[0];
    const endDateStr = new Date(endDate).toISOString().split('T')[0];
    link.download = `payment_statement_${startDateStr}_to_${endDateStr}.pdf`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return { success: true };
  } catch (error) {
    console.error('Error downloading payment statement:', error);

    // Handle error response
    let errorMessage = 'Failed to download payment statement. Please try again.';

    if (error.response) {
      if (error.response.status === 403) {
        errorMessage = 'You do not have permission to download payment statements.';
      } else if (error.response.status === 404) {
        errorMessage = 'No payments found for the specified date range.';
      } else if (error.response.data) {
        try {
          // Try to parse error from blob
          const text = await error.response.data.text();
          const data = JSON.parse(text);
          errorMessage = data.error || errorMessage;
        } catch (e) {
          // If parsing fails, use default message
        }
      }
    }

    throw new Error(errorMessage);
  }
};
