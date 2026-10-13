import { API_URL } from "../libs/constants";

const PriOverviewService = {

  getLogoUrl: (logoFile) => {
    if (!logoFile) return null;
    
    // If already a full URL, return as is
    if (logoFile.startsWith('http://') || logoFile.startsWith('https://')) {
      return logoFile;
    }
    
    // Remove leading slashes from logo file
    const cleanLogo = logoFile.replace(/^\/+/, '');
    
    // Clean API_URL - remove trailing slash if exists
    let baseUrl = API_URL;
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    
    // 🔥 Debug log to check URL
    const finalUrl = `${baseUrl}/uploads/schools/${cleanLogo}`;
    console.log('Generated Logo URL:', finalUrl);
    
    return finalUrl;
  }
};

export default PriOverviewService;