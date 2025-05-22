const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const getFileConfigurations = async () => {
  try {
    const response = await fetch(`${baseURL}/api/automate/getDB`);
    const data = await response.json();
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to load file configurations.');
    }
  } catch (error) {
    console.error('Error fetching file configurations:', error);
    throw error;
  }
};

export const getSelectedConfigurations = async () => {
  try {
    const response = await fetch(`${baseURL}/getConfig`);
    const data = await response.json();
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to load selected configurations.');
    }
  } catch (error) {
    console.error('Error fetching selected configurations:', error);
    throw error;
  }
};

export const createConfiguration = async (selectedIds: number[]) => {
  try {
    const response = await fetch(`${baseURL}/buildConfig`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: selectedIds }),
    });
    const data = await response.json();
    if (data.success) {
      return data.message || 'Configuration created successfully.';
    } else {
      throw new Error(data.message || 'Failed to create configuration.');
    }
  } catch (error) {
    console.error('Error creating configuration:', error);
    throw error;
  }
};


