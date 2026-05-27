import { parseGoogleSheet } from './parser';

export interface FetchResponse {
  is_cached: boolean;
  data: Record<string, any>;
  yearlyData?: Record<string, any>;
  success: boolean;
  message: string;
}

export const fetchDashboardData = async (url: string): Promise<FetchResponse> => {
  try {
    if (import.meta.env.VITE_APP_MODE === 'singlefile') {
      let exportUrl = url;
      if (exportUrl.includes('/edit')) {
        exportUrl = exportUrl.replace(/\/edit.*/, '/export?format=xlsx');
      }

      const proxyUrl = 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(exportUrl);
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Gagal mengunduh data: ${response.statusText}`);
      }
      const buffer = await response.arrayBuffer();
      
      const { data, churchName } = await parseGoogleSheet(buffer);
      data['church_name'] = churchName;

      return {
        is_cached: false,
        data,
        success: true,
        message: 'Data berhasil dimuat.'
      };
    } else {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }
  } catch (error: any) {
    throw new Error(error.message || 'Terjadi kesalahan saat memproses data.');
  }
};

export const fetchCachedData = async (): Promise<FetchResponse> => {
  if (import.meta.env.VITE_APP_MODE === 'singlefile') {
    throw new Error('Cache offline tidak lagi didukung di mode single-file.');
  } else {
    const response = await fetch('/api/cache');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  }
};

export const parseLocalExcelFile = async (buffer: ArrayBuffer): Promise<FetchResponse> => {
  try {
    const { data, churchName, yearlyData } = await parseGoogleSheet(buffer);
    data['church_name'] = churchName;
    return {
      is_cached: false,
      data,
      yearlyData,
      success: true,
      message: 'Data lokal berhasil dimuat.'
    };
  } catch (error: any) {
    throw new Error(error.message || 'Gagal membaca file lokal.');
  }
};
