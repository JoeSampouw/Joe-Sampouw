import { GoogleGenAI, Type } from "@google/genai";
import { FormData, ProjectFramework, ProjectModule } from '../types';
import {
    DUMMY_SITUATIONAL_ANALYSIS,
    DUMMY_PROJECT_MODULES,
    DUMMY_IMPLEMENTATION_STEPS,
    DUMMY_POTENTIAL_RISKS,
    DUMMY_PROPOSAL
} from "./dummyData";

// Initialize AI only if API Key is present to prevent immediate crash
const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
    ai = new GoogleGenAI({ apiKey: apiKey });
}

const model = "gemini-2.5-flash";

const getFocusContext = (focusArea: string): string => {
    switch (focusArea) {
        case 'Pusat Penilaian (Assessment Center)':
            return 'Rancang draf untuk Pusat Penilaian (Assessment Center). Detailkan: 1. Kompetensi kunci yang akan diukur. 2. Rekomendasi simulasi/tools. 3. Garis besar alur proses. 4. Format Laporan Hasil.';
        case 'Tes Psikologi (Psychological Test)':
            return 'Rancang draf rekomendasi Tes Psikologi. Detailkan: 1. Baterai tes yang relevan. 2. Justifikasi pemilihan alat tes. 3. Penjelasan output. 4. Poin-poin etika dan kerahasiaan data.';
        case 'Pelatihan & Pengembangan (Training & Development)':
            return 'Rancang draf outline program Pelatihan. Detailkan: 1. Kerangka Analisis Kebutuhan Pelatihan. 2. Desain dan outline modul pelatihan. 3. Rekomendasi metode penyampaian. 4. Metrik pengukuran efektivitas.';
        case 'Pencarian Eksekutif (Executive Search)':
            return 'Rancang draf strategi Pencarian Eksekutif. Detailkan: 1. Proses pendefinisian profil kandidat. 2. Strategi sourcing. 3. Tahapan proses seleksi. 4. Metodologi untuk memastikan cultural fit.';
        case 'Konseling & Pembinaan (Counseling & Coaching)':
            return 'Rancang draf program Konseling atau Pembinaan. Detailkan: 1. Perbedaan tujuan konseling dan coaching. 2. Kerangka kerja program. 3. Contoh topik yang relevan. 4. Mekanisme menjaga kerahasiaan.';
        default:
            return 'Berikan analisis dan rekomendasi umum dari sudut pandang psikologi industri dan organisasi.';
    }
};

const systemInstruction = "Anda adalah 'Magnapenta AI Project Assistant', AI asisten internal untuk konsultan Magnapenta. Tugas Anda adalah membantu konsultan membuat draf kerangka kerja proyek. Gaya Anda profesional, to-the-point, dan terstruktur. Gunakan pemformatan tebal dengan mengapit teks di antara **asterisk ganda** untuk judul atau poin penting. Selalu gunakan baris baru untuk memisahkan paragraf agar mudah dibaca. JANGAN gunakan format markdown lain seperti # atau -. Anda berbicara kepada kolega (konsultan), bukan klien.";

const commonErrorHandler = (error: unknown) => {
    console.error("Error calling Gemini API:", error);
    if(error instanceof Error && error.message.includes('SAFETY')) {
        throw new Error("Permintaan Anda diblokir karena alasan keamanan. Coba ubah input Anda.");
    }
    throw new Error("Gagal mendapatkan saran dari AI. Silakan coba lagi nanti.");
}

const generateContent = async (prompt: string, responseSchema?: any) => {
    if (!ai) return null; // Should be handled by caller checking apiKey
    try {
        const config = {
            systemInstruction,
            temperature: 0.7,
            ...(responseSchema && { responseMimeType: "application/json", responseSchema }),
        };

        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config
        });

        const text = result.text;
        if (!text) throw new Error("API mengembalikan respons kosong.");
        return text;
    } catch (error) {
        commonErrorHandler(error);
    }
};

const clientInfo = (formData: FormData) => `
- Nama Klien: ${formData.businessName || 'Tidak disebutkan'}
- Industri Klien: ${formData.industry}
- Ukuran Perusahaan Klien: ${formData.companySize}
- Layanan yang Diberikan: ${formData.focusArea}
- Brief/Tantangan Klien: "${formData.challenge}"
`;

export const generateSituationalAnalysis = async (
    formData: FormData,
    refinementInstruction?: string,
    originalContent?: string
): Promise<string> => {
    if (!apiKey) {
        console.warn("API Key missing. Returning dummy data.");
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        return DUMMY_SITUATIONAL_ANALYSIS;
    }

    const basePrompt = `
        KONTEKS KLIEN:
        ${clientInfo(formData)}

        INSTRUKSI KHUSUS UNTUK FOKUS LAYANAN:
        ${getFocusContext(formData.focusArea)}
    `;

    let prompt;
    if (refinementInstruction && originalContent) {
        prompt = `
            ${basePrompt}
            
            Anda diberi tugas untuk MENYEMPURNAKAN draf 'Analisis Situasi Klien' yang sudah ada.
            
            DRAF ASLI:
            ---
            ${originalContent}
            ---
            
            INSTRUKSI PENYEMPURNAAN DARI KONSULTAN: "${refinementInstruction}"
            
            Buatkan versi BARU dari analisis situasi berdasarkan instruksi di atas. Pastikan output tetap mengikuti gaya penulisan yang diminta (profesional, to-the-point, format tebal untuk judul/poin penting, dan spasi antar paragraf).
        `;
    } else {
        prompt = `
            ${basePrompt}
            
            Buatkan **Draf Analisis Situasi Klien** untuk disertakan dalam proposal atau laporan awal. Fokus pada 'problem statement' dari sudut pandang Psikologi Industri & Organisasi. Sajikan dalam beberapa paragraf yang jelas.
        `;
    }
    return await generateContent(prompt) ?? "Gagal menghasilkan analisis.";
};

export const generateProjectModules = async (
    formData: FormData, 
    situationalAnalysis: string,
    refinementInstruction?: string,
    originalContent?: ProjectModule[]
): Promise<ProjectModule[]> => {
    if (!apiKey) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return DUMMY_PROJECT_MODULES;
    }
    
    let prompt;
    const basePrompt = `
        Berdasarkan analisis situasi berikut:
        --- ANALISIS SITUASI ---
        ${situationalAnalysis}
        ---
        
        Dan informasi klien ini:
        ${clientInfo(formData)}
    `;

    if (refinementInstruction && originalContent) {
        prompt = `
            ${basePrompt}

            Anda diberi tugas untuk MENYEMPURNAKAN draf 'Modul Proyek' yang sudah ada.

            DRAF ASLI (dalam format JSON):
            ---
            ${JSON.stringify(originalContent)}
            ---

            INSTRUKSI PENYEMPURNAAN DARI KONSULTAN: "${refinementInstruction}"

            Buatkan versi BARU dari 'Modul Proyek' berdasarkan instruksi di atas. Setiap modul harus memiliki judul yang jelas dan deskripsi rinci. Pastikan output akhir adalah JSON array yang valid sesuai skema.
        `;
    } else {
        prompt = `
            ${basePrompt}

            Buatkan **Draf Modul Proyek**. Rancang serangkaian modul proyek yang dapat diimplementasikan. Setiap modul harus memiliki judul yang jelas (seperti nama deliverable) dan deskripsi rinci tentang apa yang tercakup, metodologi, dan hasil yang diharapkan.
        `;
    }

    const schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Judul yang jelas dan profesional untuk modul/deliverable proyek." },
            description: { type: Type.STRING, description: "Deskripsi rinci tentang modul, mencakup aktivitas, metodologi, dan output yang akan diterima klien. Gunakan pemformatan tebal (**text**) untuk poin penting dan baris baru untuk paragraf." }
          },
          required: ["title", "description"]
        },
    };
    const resultText = await generateContent(prompt, schema);
    return JSON.parse(resultText ?? "[]");
};

export const generateImplementationSteps = async (
    formData: FormData, 
    situationalAnalysis: string, 
    projectModules: ProjectModule[],
    refinementInstruction?: string,
    originalContent?: string[]
): Promise<string[]> => {
    if (!apiKey) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return DUMMY_IMPLEMENTATION_STEPS;
    }

    const modulesText = projectModules.map(m => `**${m.title}**: ${m.description}`).join('\n');
    const basePrompt = `
        Dengan mempertimbangkan analisis situasi dan modul proyek yang telah dirancang:
        --- ANALISIS SITUASI ---
        ${situationalAnalysis}
        ---
        --- MODUL PROYEK ---
        ${modulesText}
        ---

        Dan informasi klien ini:
        ${clientInfo(formData)}
    `;

    let prompt;
    if(refinementInstruction && originalContent) {
        prompt = `
            ${basePrompt}

            Anda diberi tugas untuk MENYEMPURNAKAN draf 'Langkah-langkah Implementasi Proyek'.

            DRAF ASLI:
            ---
            ${originalContent.join('\n- ')}
            ---

            INSTRUKSI PENYEMPURNAAN DARI KONSULTAN: "${refinementInstruction}"
            
            Buatkan versi BARU dari 'Langkah-langkah Implementasi Proyek' berdasarkan instruksi di atas. Jaga agar tetap ringkas dan berikan 3-5 langkah kunci. Pastikan output akhir adalah JSON array yang valid.
        `;
    } else {
        prompt = `
            ${basePrompt}

            Buatkan draf **Langkah-langkah Implementasi Proyek** secara garis besar. Berikan 3-5 langkah kunci dari kick-off hingga penutupan proyek.
        `;
    }
    
    const schema = { type: Type.ARRAY, items: { type: Type.STRING } };
    const resultText = await generateContent(prompt, schema);
    return JSON.parse(resultText ?? "[]");
};

export const generatePotentialRisks = async (
    formData: FormData, 
    situationalAnalysis: string, 
    projectModules: ProjectModule[], 
    implementationSteps: string[],
    refinementInstruction?: string,
    originalContent?: string[]
): Promise<string[]> => {
    if (!apiKey) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return DUMMY_POTENTIAL_RISKS;
    }

    const modulesText = projectModules.map(m => `**${m.title}**: ${m.description}`).join('\n');
    const stepsText = implementationSteps.join(', ');
    const basePrompt = `
        Melihat keseluruhan rencana proyek sejauh ini:
        - Analisis: ${situationalAnalysis}
        - Modul: ${modulesText}
        - Rencana Implementasi: ${stepsText}
        - Info Klien: ${clientInfo(formData)}
    `;

    let prompt;
    if(refinementInstruction && originalContent) {
        prompt = `
            ${basePrompt}

            Anda diberi tugas untuk MENYEMPURNAKAN draf 'Potensi Risiko'.

            DRAF ASLI:
            ---
            ${originalContent.join('\n- ')}
            ---

            INSTRUKSI PENYEMPURNAAN DARI KONSULTAN: "${refinementInstruction}"

            Buatkan versi BARU dari 'Potensi Risiko' berdasarkan instruksi di atas. Pertahankan format "**Risiko**: [deskripsi]. **Mitigasi**: [saran]." untuk setiap poin. Pastikan output akhir adalah JSON array yang valid.
        `;
    } else {
        prompt = `
            ${basePrompt}

            Identifikasi **Potensi Risiko** dari sisi proyek (misal: resistensi dari stakeholder, data tidak lengkap) dan sertakan saran mitigasi awal untuk setiap risiko. Format setiap poin sebagai: "**Risiko**: [deskripsi risiko]. **Mitigasi**: [saran mitigasi]."
        `;
    }
    const schema = { type: Type.ARRAY, items: { type: Type.STRING } };
    const resultText = await generateContent(prompt, schema);
    return JSON.parse(resultText ?? "[]");
};

export const generateProposal = async (
    formData: FormData,
    framework: ProjectFramework,
    refinementInstruction?: string,
    originalContent?: string
): Promise<string> => {
    if (!apiKey) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return DUMMY_PROPOSAL;
    }

    const modulesText = framework.projectModules?.map(m => `**${m.title}**:\n${m.description}`).join('\n\n');
    const stepsText = framework.implementationSteps?.map(s => `- ${s}`).join('\n');
    const risksText = framework.potentialRisks?.map(r => `- ${r}`).join('\n');

    const basePrompt = `
        Anda adalah konsultan senior di Magnapenta. Tugas Anda adalah menulis draf proposal resmi untuk klien berdasarkan kerangka kerja yang telah disiapkan secara internal.
        
        **KERANGKA KERJA PROYEK INTERNAL:**
        ---
        **1. Analisis Situasi:**
        ${framework.situationalAnalysis}

        **2. Modul Proyek yang Diusulkan:**
        ${modulesText}

        **3. Garis Besar Langkah Implementasi:**
        ${stepsText}

        **4. Manajemen Risiko:**
        ${risksText}
        ---

        **INFORMASI KLIEN:**
        ${clientInfo(formData)}
    `;
    
    let prompt;
    if(refinementInstruction && originalContent){
        prompt = `
            ${basePrompt}
            
            Anda diberi tugas untuk MENYEMPURNAKAN draf proposal yang sudah ada.

            DRAF ASLI:
            ---
            ${originalContent}
            ---

            INSTRUKSI PENYEMPURNAAN DARI KONSULTAN: "${refinementInstruction}"

            Buatkan versi BARU dari proposal berdasarkan instruksi di atas. Pastikan output adalah dokumen yang utuh, profesional, dan siap dikirim ke klien, serta mengikuti gaya penulisan yang diminta.
        `;
    } else {
        prompt = `
            ${basePrompt}

            **INSTRUKSI:**
            Tulis sebuah **Draf Proposal Resmi** yang kohesif, profesional, dan meyakinkan. Mulailah dengan pendahuluan singkat yang menyapa klien dan merangkum pemahaman Anda tentang tantangan mereka. Kemudian, integrasikan semua bagian dari kerangka kerja di atas ke dalam narasi yang mengalir dengan judul-judul bagian yang jelas (misalnya, Pendahuluan, Ruang Lingkup Proyek, Tahapan Implementasi, Mitigasi Risiko). Akhiri dengan penutup yang kuat yang mendorong langkah selanjutnya. Gunakan bahasa yang berorientasi pada klien.
        `;
    }

    return await generateContent(prompt) ?? "Gagal menghasilkan proposal.";
};
