// FICHIER : app/api/chat/route.ts

import { streamText, type CoreMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export const maxDuration = 30;

// La fonction de recherche est performante, nous la conservons.
async function searchDatabase(args: { 
    item: string; 
    brand?: string; 
    color?: string; 
    city?: string; 
}) {
    console.log("🤖 AI is calling the database tool with arguments:", args);
    try {
        const lowerItem = args.item.toLowerCase();
        const keywordsToSearch = lowerItem.split(' ').filter(w => w.length > 2 && !['pour', 'de', 'le', 'la', 'un', 'une'].includes(w));
        if (keywordsToSearch.length === 0 && lowerItem) keywordsToSearch.push(lowerItem);
        
        const whereConditions: string[] = [];
        const params: string[] = [];

        if (keywordsToSearch.length > 0) {
            const keywordConditions = keywordsToSearch.map(keyword => {
                // Using LIKE %keyword% for more flexible matching
                params.push(`%${keyword}%`, `%${keyword}%`); 
                return `(LOWER(f.discription) LIKE ? OR LOWER(f.type) LIKE ?)`;
            }).join(' OR '); 
            whereConditions.push(`(${keywordConditions})`);
        }

        if (args.city) {
            const escapedCity = args.city.toLowerCase(); // No need for regexp escaping
            whereConditions.push("LOWER(v.ville) LIKE ?");
            params.push(`%${escapedCity}%`); 
        }
        if (args.brand) {
            const escapedBrand = args.brand.toLowerCase(); // No need for regexp escaping
            whereConditions.push("LOWER(f.marque) LIKE ?");
            params.push(`%${escapedBrand}%`);
        }
        if (args.color) {
            const escapedColor = args.color.toLowerCase(); // No need for regexp escaping
            whereConditions.push("(LOWER(f.color) LIKE ? OR LOWER(f.discription) LIKE ?)");
            params.push(`%${escapedColor}%`, `%${escapedColor}%`); 
        }
        
        if (whereConditions.length === 0) return [];

        let sql = `
          SELECT 
            f.id, f.discription as description, v.ville as city, c.cname as category_name,
            f.marque, f.modele, f.color, f.type, f.etat, f.postdate
          FROM fthings f
          LEFT JOIN catagoery c ON f.cat_ref = c.cid
          LEFT JOIN ville v ON f.ville = v.id
          WHERE ${whereConditions.join(" AND ")}
          ORDER BY f.postdate DESC LIMIT 5;`;
        
        const results = await query(sql, params);
        return Array.isArray(results) ? results.map(item => ({...item, id: String(item.id), contactUrl: `https://mafqoodat.ma/trouve.php?contact=${item.id}`})) : [];
    } catch (error) {
        console.error("Database search tool error:", error);
        return [];
    }
}

// Le point d'entrée unique de l'API
export async function POST(req: Request) {
    const { messages }: { messages: CoreMessage[] } = await req.json();

    const filteredMessages = messages.filter(m => m.role !== 'tool');

    const lang = /[\u0600-\u06FF]/.test(filteredMessages[filteredMessages.length - 1]?.content as string) ? "ar" : "fr";

    const systemPrompts = {
        fr: `Tu es un assistant expert pour "Mafqoodat". Ton rôle est d'aider les utilisateurs à retrouver des objets perdus ou trouvés.
- Si l'utilisateur pose une question générale, demande un conseil, écrit un texte sans rapport avec un objet perdu/trouvé, ou envoie un message vide ou un simple point, réponds normalement comme un assistant conversationnel, **sans utiliser d'outil**.
- **Priorité 1: Recherche d'objet.** Si tu identifies ne serait-ce qu'un "item" (objet) dans la requête de l'utilisateur, **utilise immédiatement l'outil 'searchDatabase' avec cet item et toute autre information disponible (ville, couleur, marque, etc.)**. Ne demande pas de détails supplémentaires si un item est déjà identifié.
- **Gestion des résultats de recherche:**
    - Si l'outil 'searchDatabase' retourne **plusieurs résultats**, présente-les en Markdown et dis à l'utilisateur : "J'ai trouvé plusieurs objets correspondants. Veuillez les examiner pour voir si l'un d'eux correspond au vôtre."
    - Si l'outil 'searchDatabase' retourne **un seul résultat**, présente-le en Markdown et dis à l'utilisateur : "J'ai trouvé un objet qui pourrait correspondre. Le voici :"
    - Si l'outil 'searchDatabase' ne retourne **aucun résultat**, propose de créer une annonce avec ce lien Markdown EXACT : [Créer une nouvelle annonce](action:create_ad)
- **Priorité 2: Clarification.** Si la requête ne contient pas d'item clair, mais semble être une recherche (ex: "J'ai perdu quelque chose"), demande poliment le type d'objet.
- Ne fais jamais de recherche pour un message vide, un point, ou une question générale.
- Si c'est une conversation générale (salut, merci...), réponds naturellement sans utiliser l'outil.`,
        ar: `أنت مساعد خبير لمنصة "مفقودات". دورك هو مساعدة المستخدمين في إيجاد الأشياء المفقودة أو المعثور عليها.
- إذا طرح المستخدم سؤالاً عاماً أو طلب نصيحة أو كتب نصاً لا علاقة له بشيء مفقود/معثور عليه، أو أرسل رسالة فارغة أو نقطة فقط، **أجب كمساعد عادي ولا تستخدم أي أداة**.
- **الأولوية 1: البحث عن شيء.** إذا تعرفت على "item" (غرض) واحد فقط في طلب المستخدم، **استخدم على الفور أداة 'searchDatabase' مع هذا الغرض وأي معلومات أخرى متاحة (المدينة، اللون، العلامة التجارية، إلخ)**. لا تطلب تفاصيل إضافية إذا تم تحديد الغرض بالفعل.
- **إدارة نتائج البحث:**
    - إذا أعادت أداة 'searchDatabase' **عدة نتائج**، قم بعرضها بتنسيق Markdown وقل للمستخدم: "لقد وجدت عدة أغراض مطابقة. يرجى مراجعتها لمعرفة ما إذا كان أي منها يطابق غرضك."
    - إذا أعادت أداة 'searchDatabase' **نتيجة واحدة فقط**، قم بعرضها بتنسيق Markdown وقل للمستخدم: "لقد وجدت غرضًا واحدًا قد يطابق. إليك هو:"
    - إذا لم تعد أداة 'searchDatabase' **أي نتائج**، اقترح إنشاء إعلان بهذا الرابط بالماركدون: [إنشاء إعلان جديد](action:create_ad)
- **الأولوية 2: توضيح.** إذا لم يحتوي الطلب على غرض واضح، ولكنه يبدو وكأنه بحث (مثال: "فقدت شيئًا ما")، اطلب نوع الغرض بلطف.
- لا تستخدم الأداة أبداً لرسالة فارغة أو نقطة أو نص غير ذي صلة.
- إذا كانت محادثة عامة (تحية، شكر...)، أجب بشكل طبيعي دون استخدام الأداة.`,
        en: `You are an expert assistant for "Mafqoodat". Your role is to help users find lost or found items.
- If the user asks a general question, requests advice, writes something unrelated to a lost/found item, or sends an empty message or just a dot, **respond as a normal assistant and DO NOT use any tool**.
- **Priority 1: Object Search.** If you identify at least an "item" (objet) in the user's request, **use immediately the 'searchDatabase' tool with this item and any other available information (city, color, brand, etc.)**. Do not ask for additional details if an item is already identified.
- **Search Results Management:**
    - If the 'searchDatabase' tool returns **multiple results**, present them in Markdown and tell the user: "I found several matching items. Please review them to see if any match yours."
    - If the 'searchDatabase' tool returns **a single result**, present it in Markdown and tell the user: "I found one item that might match. Here it is:"
    - If the 'searchDatabase' tool returns **no results**, suggest creating an ad with this exact Markdown link: [Create a new ad](action:create_ad)
- **Priority 2: Clarification.** If the request does not contain a clear item, but seems to be a search (e.g., "I lost something"), politely ask for the type of object.
- Never use the tool for empty, short, or irrelevant input.
- For general conversation (hello, thanks, etc.), respond naturally without using the tool.`
    };

    const result = await streamText({
        model: openai("gpt-4o"),
        system: systemPrompts[lang],
        messages: filteredMessages, 
        tools: {
          searchDatabase: {
            description: "Recherche les objets perdus dans la base de données.",
            parameters: z.object({
              item: z.string(), city: z.string().optional(), brand: z.string().optional(), color: z.string().optional(),
            }),
            execute: async (args) => await searchDatabase(args),
          },
        },
    });

    return result.toAIStreamResponse();
}