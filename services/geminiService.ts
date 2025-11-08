const fileToBase64Part = (file: File) => {
  return new Promise<{ data: string; mimeType: string }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("File could not be read as a data URL."));
      }
      const base64Data = reader.result.split(',')[1];
      resolve({ data: base64Data, mimeType: file.type });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const dataUriToBase64Part = (uri: string) => {
  const match = uri.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw new Error("سلسلة data URI غير صالحة.");
  }
  const mimeType = match[1];
  const data = match[2];
  return { data, mimeType };
};

const callApi = async (body: object) => {
    const response = await fetch('/.netlify/functions/gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
        // Use the error message from the serverless function, which passes it from Gemini
        throw new Error(result.error || `Request failed with status ${response.status}`);
    }

    return result;
}

export const generateDecorImage = async (
    mirrorFile: File, 
    decorFile: File | null,
    mirrorType: string,
    mirrorPlacement: string
): Promise<string> => {
    const mirrorImage = await fileToBase64Part(mirrorFile);
    const decorImage = decorFile ? await fileToBase64Part(decorFile) : null;

    const body = {
        action: 'generate',
        mirrorImage,
        decorImage,
        mirrorType,
        mirrorPlacement,
    };
    
    const result = await callApi(body);
    if (result.image) {
        return result.image;
    }

    throw new Error("فشل في إنشاء الصورة. لم يرجع النموذج جزء الصورة.");
};

export const editDecorImage = async (base64Image: string, prompt: string): Promise<string> => {
    const baseImage = dataUriToBase64Part(base64Image);
    
    const body = {
        action: 'edit',
        baseImage,
        prompt,
    };

    const result = await callApi(body);
    if (result.image) {
        return result.image;
    }

    throw new Error("فشل في تعديل الصورة. لم يرجع النموذج جزء الصورة.");
};
