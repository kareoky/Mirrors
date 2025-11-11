import { GoogleGenAI, Modality } from "@google/genai";

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const dataUriToGenerativePart = (uri: string) => {
  const match = uri.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw new Error("سلسلة data URI غير صالحة.");
  }
  const mimeType = match[1];
  const data = match[2];
  return {
    inlineData: { data, mimeType },
  };
};


export const generateDecorImage = async (
    mirrorFile: File, 
    decorFile: File | null,
    mirrorType: string,
    mirrorPlacement: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("متغير البيئة API_KEY غير موجود.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const mirrorPart = await fileToGenerativePart(mirrorFile);
  const parts: any[] = [mirrorPart];

  let prompt = `تعليمات هامة: يجب الحفاظ على نفس شكل وإطار وتصميم المرآة الموجودة في الصورة الأولى بالضبط. لا تغير المرآة نفسها بأي شكل من الأشكال. مهمتك هي تغيير الخلفية والمحيط فقط.\\n\\n`;
  
  if (mirrorPlacement === 'wall-mounted') {
    prompt += `ضع هذه المرآة بشكل واقعي على حائط داخل ديكور داخلي جديد وأنيق وعصري. `;
  } else { // floor-standing
    prompt += `ضع هذه المرآة القائمة على الأرض بشكل واقعي في ديكور داخلي جديد وأنيق وعصري. تأكد من أنها قائمة على الأرض، ربما مستندة على حائط أو على حاملها الخاص. `;
  }

  if (mirrorType === 'illuminated') {
    prompt += `المرآة من النوع المضيء (إضاءة خلفية). عند وضعها في المشهد الجديد، يجب أن تظهر وهي تعمل، مع توهج ناعم وأنيق ينبعث من حوافها. `;
  } else if (mirrorType === 'touch-illuminated') {
    prompt += `المرآة من النوع المضيء مع زر تشغيل يعمل باللمس. عند وضعها في المشهد الجديد، يجب أن تظهر وهي تعمل، مع توهج ناعم وأنيق. تأكد من أن زر اللمس ظاهر ومضاء بشكل خافت. `;
  }

  prompt += `يجب أن تبدو الغرفة راقية وأنيقة ومضاءة جيدًا. قم بإنشاء مساحة معيشة جميلة وملهمة. يجب أن تكون المرآة هي نقطة الجذب الرئيسية.`;


  if (decorFile) {
    const decorPart = await fileToGenerativePart(decorFile);
    parts.push(decorPart);
    prompt = `باستخدام الصورة الأولى (مرآة) والصورة الثانية (مرجع لستايل الديكور)، ضع المرآة في ديكور داخلي جديد. يجب أن يكون هذا الديكور الجديد مستوحى بشكل كبير من الستايل ولوحة الألوان والحالة المزاجية للصورة المرجعية. يجب أن تبدو الصورة النهائية أنيقة وعصرية ومصممة باحتراف، مع دمج المرآة بسلاسة في الديكور المستوحى.\\n\\n` + prompt;
  }
  
  parts.push({ text: prompt });

  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ parts: parts }],
    config: {
      responseModalities: [Modality.IMAGE],
    }
  });

  if (!result.candidates || result.candidates.length === 0) {
      let errorMessage = "فشل في إنشاء الصورة. لم يتم تلقي أي مرشحين من النموذج.";
      if (result.text) {
          errorMessage += ` رد النموذج: ${result.text}`;
      }
      throw new Error(errorMessage);
  }

  const candidate = result.candidates[0];

  if (candidate.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
    const safetyMessage = candidate.safetyRatings?.length ? ` تقييمات السلامة: ${JSON.stringify(candidate.safetyRatings)}` : '';
    throw new Error(`فشل إنشاء الصورة. السبب: ${candidate.finishReason}.${safetyMessage}`);
  }

  for (const part of candidate.content.parts) {
    if (part.inlineData) {
      const base64Image = part.inlineData.data;
      const mimeType = part.inlineData.mimeType;
      return `data:${mimeType};base64,${base64Image}`;
    }
  }

  if (result.text) {
    throw new Error(`فشل في إنشاء الصورة. استجاب النموذج بالنص: "${result.text}"`);
  }

  throw new Error("فشل في إنشاء الصورة. لم يرجع النموذج جزء الصورة.");
};

export const editDecorImage = async (base64Image: string, prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("متغير البيئة API_KEY غير موجود.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = dataUriToGenerativePart(base64Image);
  const textPart = { text: `عدّل الصورة التالية بمهارة بناءً على هذه التعليمات: "${prompt}". حافظ على التكوين العام وواقعية الصورة.` };
  
  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ parts: [imagePart, textPart] }],
    config: {
      responseModalities: [Modality.IMAGE],
    }
  });

  if (!result.candidates || result.candidates.length === 0) {
      let errorMessage = "فشل في تعديل الصورة. لم يتم تلقي أي مرشحين من النموذج.";
      if (result.text) {
          errorMessage += ` رد النموذج: ${result.text}`;
      }
      throw new Error(errorMessage);
  }

  const candidate = result.candidates[0];

  if (candidate.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
    const safetyMessage = candidate.safetyRatings?.length ? ` تقييمات السلامة: ${JSON.stringify(candidate.safetyRatings)}` : '';
    throw new Error(`فشل تعديل الصورة. السبب: ${candidate.finishReason}.${safetyMessage}`);
  }

  for (const part of candidate.content.parts) {
    if (part.inlineData) {
      const newBase64Image = part.inlineData.data;
      const mimeType = part.inlineData.mimeType;
      return `data:${mimeType};base64,${newBase64Image}`;
    }
  }

  if (result.text) {
    throw new Error(`فشل في تعديل الصورة. استجاب النموذج بالنص: "${result.text}"`);
  }

  throw new Error("فشل في تعديل الصورة. لم يرجع النموذج جزء الصورة.");
};